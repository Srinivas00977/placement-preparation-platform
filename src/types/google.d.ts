/* Google Identity Services (GIS) Types */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notification?: (notification: { isNotDisplayed: () => boolean; getNotDisplayedReason: () => string }) => void) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          revoke: (hint: string, callback?: () => void) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; error_description?: string }) => void;
            error_callback?: (error: { message?: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

export {};
