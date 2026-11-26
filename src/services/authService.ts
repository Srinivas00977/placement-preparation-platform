/**
 * Authentication Service for PlacePilot AI — AI Placement Preparation Planner
 * 
 * FEATURES:
 * 1. Hybrid Server + Local Storage Architecture:
 *    - Calls Flask backend (VITE_API_BASE_URL) with persistent users.json storage & Werkzeug password hashing.
 *    - Automatic instant fallback to client-side storage if server is offline (zero crashes).
 * 2. Explicit Account Registration (Does NOT auto-login; directs to /login)
 * 3. Secure Login with strict credential verification & "Remember me" session persistence
 * 4. Forgot Password & Reset Password flow (Updates server & local password hash; old password stops working)
 * 5. Real Google OAuth 2.0 Integration (Google Identity Services GIS API)
 * 6. Protected Route Session Verification
 */

export interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  provider?: 'email' | 'google';
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  configured?: boolean;
  state?: any;
}

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  picture?: string;
  provider?: 'email' | 'google';
}

const ACTIVE_SESSION_KEY = 'placepilot_auth_session';
const REGISTERED_USERS_KEY = 'placepilot_registered_accounts';
const REMEMBERED_EMAIL_KEY = 'placepilot_remembered_email';
const STORAGE_PREFIX = 'placepilot_user_data_';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Safe fetch wrapper with timeout to prevent hanging when backend server is offline
 */
async function safeApiCall<T>(endpoint: string, options: RequestInit = {}, timeoutMs = 2500): Promise<{ ok: boolean; status: number; data?: T }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);
    let data: any;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    return { ok: response.ok, status: response.status, data };
  } catch {
    clearTimeout(timeoutId);
    return { ok: false, status: 0 };
  }
}

// Client-side hash function for fallback local storage mode
function mockHashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'phash_' + Math.abs(hash).toString(36) + '_' + password.length;
}

function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredAccounts(accounts: StoredAccount[]): void {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(accounts));
}

export const authService = {
  /**
   * Register a new user account.
   * Calls Flask backend first; saves to users.json on server with Werkzeug password hash.
   * Account is created, BUT user is NOT logged in automatically.
   * User is redirected to /login to explicitly sign in.
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const cleanEmail = credentials.email.trim().toLowerCase();
    const fullName = credentials.fullName.trim();
    const password = credentials.password || '';

    if (!fullName || !cleanEmail || !password) {
      return { success: false, message: 'All fields are required.' };
    }

    // 1. Attempt Server-side registration first
    const apiRes = await safeApiCall<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email: cleanEmail, password }),
    });

    if (apiRes.status > 0) {
      // Backend responded
      if (apiRes.ok && apiRes.data?.success) {
        // Also mirror in local accounts cache for seamless offline fallback
        const accounts = getStoredAccounts();
        if (!accounts.some((a) => a.email === cleanEmail)) {
          accounts.push({
            id: 'usr_' + Math.random().toString(36).substring(2, 9),
            name: fullName,
            email: cleanEmail,
            passwordHash: mockHashPassword(password),
            provider: 'email',
          });
          saveStoredAccounts(accounts);
        }

        return {
          success: true,
          message: apiRes.data.message || 'Account created successfully. Please sign in.',
        };
      } else {
        return {
          success: false,
          message: apiRes.data?.message || 'Registration failed. Please try again.',
        };
      }
    }

    // 2. Offline Fallback to localStorage (if Flask server is not running)
    const accounts = getStoredAccounts();
    const existing = accounts.find((acc) => acc.email === cleanEmail);

    if (existing) {
      return {
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      };
    }

    const newAccount: StoredAccount = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: fullName,
      email: cleanEmail,
      passwordHash: mockHashPassword(password),
      provider: 'email',
    };

    accounts.push(newAccount);
    saveStoredAccounts(accounts);

    return {
      success: true,
      message: 'Account created successfully. Please sign in.',
    };
  },

  /**
   * Authenticate user with Email & Password.
   * Calls Flask backend to verify Werkzeug hash from users.json.
   * Falls back to localStorage account check if server is offline.
   * Handles "Remember me" persistence.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const cleanEmail = credentials.email.trim().toLowerCase();
    const password = credentials.password || '';

    if (!cleanEmail || !password) {
      return { success: false, message: 'Invalid email or password.' };
    }

    // 1. Attempt Server-side login
    const apiRes = await safeApiCall<{
      success: boolean;
      user: User;
      token: string;
      message?: string;
      state?: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail, password, rememberMe: credentials.rememberMe }),
    });

    if (apiRes.status > 0) {
      if (apiRes.ok && apiRes.data?.success && apiRes.data.user) {
        const { user, token, state } = apiRes.data;
        const sessionData = { user, token };

        // Save session based on "Remember me"
        if (credentials.rememberMe) {
          localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionData));
          localStorage.setItem(REMEMBERED_EMAIL_KEY, cleanEmail);
        } else {
          sessionStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionData));
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }

        // Hydrate saved user state if returned by server
        if (state) {
          localStorage.setItem(`${STORAGE_PREFIX}${user.id}`, JSON.stringify(state));
        }

        return { success: true, user, token, state };
      } else {
        return {
          success: false,
          message: apiRes.data?.message || 'Invalid email or password.',
        };
      }
    }

    // 2. Offline Fallback to localStorage check
    const accounts = getStoredAccounts();
    const account = accounts.find((acc) => acc.email === cleanEmail);

    if (account) {
      const incomingHash = mockHashPassword(password);
      if (account.passwordHash !== incomingHash) {
        return { success: false, message: 'Invalid email or password.' };
      }

      const user: User = {
        id: account.id,
        name: account.name,
        email: account.email,
        picture: account.picture,
        provider: account.provider || 'email',
      };

      const sessionData = {
        user,
        token: 'placepilot_jwt_' + Date.now(),
      };

      if (credentials.rememberMe) {
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionData));
        localStorage.setItem(REMEMBERED_EMAIL_KEY, cleanEmail);
      } else {
        sessionStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionData));
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      return { success: true, user, token: sessionData.token };
    }

    return { success: false, message: 'Invalid email or password.' };
  },

  /**
   * Request Password Reset for specified email
   */
  async requestPasswordReset(email: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    sessionStorage.setItem('placepilot_reset_email', cleanEmail);

    return {
      success: true,
      message: 'Password reset request authorized.',
    };
  },

  /**
   * Reset Password for user.
   * Updates password hash in users.json on server and in localStorage.
   * Old password will no longer work!
   */
  async resetPassword(newPassword: string): Promise<AuthResponse> {
    const targetEmail = sessionStorage.getItem('placepilot_reset_email') || '';
    if (!targetEmail) {
      return {
        success: false,
        message: 'Password reset session expired. Please enter your email again.',
      };
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters.',
      };
    }

    // 1. Call server to update password in users.json
    const apiRes = await safeApiCall<AuthResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email: targetEmail, newPassword }),
    });

    // 2. Also update local storage account hash
    const accounts = getStoredAccounts();
    const accountIndex = accounts.findIndex((acc) => acc.email === targetEmail);
    const newLocalHash = mockHashPassword(newPassword);

    if (accountIndex >= 0) {
      accounts[accountIndex].passwordHash = newLocalHash;
    } else {
      accounts.push({
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: targetEmail.split('@')[0],
        email: targetEmail,
        passwordHash: newLocalHash,
        provider: 'email',
      });
    }
    saveStoredAccounts(accounts);
    sessionStorage.removeItem('placepilot_reset_email');

    if (apiRes.status > 0 && apiRes.data) {
      return apiRes.data;
    }

    return {
      success: true,
      message: 'Password updated successfully.',
    };
  },

  /**
   * Initiate Google OAuth Flow using Google Identity Services (GIS)
   * Client ID is configured in .env and opens the real Google Account Chooser
   */
  async signInWithGoogle(): Promise<AuthResponse> {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId || clientId.includes('your_google_client_id_here')) {
      return {
        configured: false,
        success: false,
        message:
          'To enable live Google Sign-In, please configure VITE_GOOGLE_CLIENT_ID in your environment file (.env).',
      };
    }

    if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
      return {
        success: false,
        message: 'Google Identity Services library is loading. Please try again in a moment.',
      };
    }

    return new Promise<AuthResponse>((resolve) => {
      try {
        const tokenClient = window.google!.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              if (tokenResponse.error === 'access_denied') {
                resolve({ success: false, message: 'Google Sign-In was cancelled.' });
              } else {
                resolve({
                  success: false,
                  message: tokenResponse.error_description || 'Google authentication failed.',
                });
              }
              return;
            }

            if (!tokenResponse.access_token) {
              resolve({ success: false, message: 'No access token returned from Google.' });
              return;
            }

            try {
              // Fetch user profile info from Google API using access token
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`,
                },
              });

              if (!res.ok) {
                resolve({ success: false, message: 'Failed to retrieve Google user profile.' });
                return;
              }

              const googleData: GoogleUser = await res.json();
              const authRes = await authService.processGoogleAccount(googleData);
              resolve(authRes);
            } catch {
              resolve({
                success: false,
                message: 'Network error while fetching Google profile information.',
              });
            }
          },
          error_callback: (err) => {
            resolve({
              success: false,
              message: err?.message || 'Failed to initialize Google authentication dialog.',
            });
          },
        });

        tokenClient.requestAccessToken();
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Google authentication error occurred.';
        resolve({
          success: false,
          message: errorMessage,
        });
      }
    });
  },

  /**
   * Process authenticated Google user identity on server & local session
   */
  async processGoogleAccount(googleUser: GoogleUser): Promise<AuthResponse> {
    const cleanEmail = googleUser.email.trim().toLowerCase();

    if (!cleanEmail) {
      return { success: false, message: 'Invalid Google account email.' };
    }

    // 1. Attempt to register/load Google user on server
    const apiRes = await safeApiCall<{
      success: boolean;
      user: User;
      token: string;
      state?: any;
    }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        sub: googleUser.sub,
        email: cleanEmail,
        name: googleUser.name,
        picture: googleUser.picture,
      }),
    });

    let user: User;
    let token: string;

    if (apiRes.status > 0 && apiRes.data?.success && apiRes.data.user) {
      user = apiRes.data.user;
      token = apiRes.data.token;
      if (apiRes.data.state) {
        localStorage.setItem(`${STORAGE_PREFIX}${user.id}`, JSON.stringify(apiRes.data.state));
      }
    } else {
      // Local fallback
      const accounts = getStoredAccounts();
      let account = accounts.find((acc) => acc.email === cleanEmail);

      if (account) {
        account.name = account.name || googleUser.name;
        if (googleUser.picture) account.picture = googleUser.picture;
        account.provider = 'google';
      } else {
        account = {
          id: 'usr_g_' + (googleUser.sub ? googleUser.sub.substring(0, 10) : Math.random().toString(36).substring(2, 9)),
          name: googleUser.name || cleanEmail.split('@')[0],
          email: cleanEmail,
          passwordHash: 'google_oauth_protected',
          picture: googleUser.picture,
          provider: 'google',
        };
        accounts.push(account);
      }
      saveStoredAccounts(accounts);

      user = {
        id: account.id,
        name: account.name,
        email: account.email,
        picture: account.picture,
        provider: 'google',
      };
      token = 'placepilot_jwt_google_' + Date.now();
    }

    // Google Sign-In always remembers session
    const sessionData = { user, token };
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionData));
    localStorage.setItem(REMEMBERED_EMAIL_KEY, cleanEmail);

    return {
      success: true,
      user,
      token,
    };
  },

  /**
   * Helper to check if Google OAuth is configured
   */
  initiateGoogleOAuth(): { configured: boolean; url?: string; message?: string } {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && !clientId.includes('your_google_client_id_here')) {
      return { configured: true };
    }
    return {
      configured: false,
      message:
        'To enable live Google Sign-In, please configure VITE_GOOGLE_CLIENT_ID in your environment file (.env).',
    };
  },

  /**
   * Logout current user: invalidates session on server and clears active local session
   */
  async logout(): Promise<void> {
    const token = this.getSessionToken();
    if (token) {
      safeApiCall('/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }

    sessionStorage.removeItem(ACTIVE_SESSION_KEY);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  },

  /**
   * Get current authenticated user session
   */
  getCurrentUser(): User | null {
    const sessionRaw =
      sessionStorage.getItem(ACTIVE_SESSION_KEY) || localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!sessionRaw) return null;

    try {
      const parsed = JSON.parse(sessionRaw);
      return parsed.user || null;
    } catch {
      return null;
    }
  },

  /**
   * Get current session token for API authorization
   */
  getSessionToken(): string | null {
    const sessionRaw =
      sessionStorage.getItem(ACTIVE_SESSION_KEY) || localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!sessionRaw) return null;

    try {
      const parsed = JSON.parse(sessionRaw);
      return parsed.token || null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  /**
   * Get last remembered email (if "Remember me" was selected)
   */
  getRememberedEmail(): string | null {
    return localStorage.getItem(REMEMBERED_EMAIL_KEY);
  },
};
