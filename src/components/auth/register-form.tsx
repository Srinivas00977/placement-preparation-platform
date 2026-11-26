import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, Bot, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  }>({});

  const [oauthNotice, setOauthNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must contain at least 2 characters.';
    }

    if (!email.trim()) {
      newErrors.email = 'Please enter your email.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }

    if (!password) {
      newErrors.password = 'Please enter a password.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must contain at least 8 characters.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setOauthNotice(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await authService.register({ fullName, email, password });

      if (res.success) {
        // Redirect to /login and prompt user to explicitly sign in
        navigate('/login', {
          state: {
            message: 'Account created successfully. Please sign in.',
            prefillEmail: email,
          },
        });
      } else {
        setErrors({ form: res.message || 'Registration failed. Please try again.' });
      }
    } catch {
      setErrors({ form: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setOauthNotice(null);
    setIsGoogleLoading(true);

    try {
      const res = await authService.signInWithGoogle();
      if (res.success) {
        navigate('/dashboard');
      } else if (res.message) {
        setOauthNotice(res.message);
      }
    } catch {
      setOauthNotice('Google authentication failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full max-w-md mx-auto py-2"
    >
      {/* Brand Header */}
      <div className="mb-4 flex items-center space-x-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-white shadow-inner">
          <Bot className="h-5 w-5" />
        </div>
        <span className="text-sm font-extrabold tracking-tight text-white uppercase">
          PlacePilot AI
        </span>
      </div>

      <div className="mb-6 space-y-1">
        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Create your PlacePilot AI account
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400">
          Start your personalized AI placement preparation journey.
        </p>
      </div>

      {errors.form && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-xs text-red-300 font-medium"
        >
          {errors.form}
        </motion.div>
      )}

      {oauthNotice && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-start space-x-2.5"
        >
          <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <span>{oauthNotice}</span>
        </motion.div>
      )}

      {/* Google Social Auth Only */}
      <div className="mb-4">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={handleGoogleAuth}
          isLoading={isGoogleLoading}
          className="w-full text-xs sm:text-sm font-semibold border-neutral-800 bg-neutral-900/70 hover:bg-neutral-800 text-white flex items-center justify-center py-2.5"
        >
          {!isGoogleLoading && (
            <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.3-.8-.5-1.7-.5-2.7z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
          )}
          <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </Button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-4">
        <div className="border-t border-neutral-800 w-full" />
        <span className="bg-neutral-950 px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
          OR
        </span>
        <div className="border-t border-neutral-800 w-full" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* Full Name Field */}
        <div className="space-y-1">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
            disabled={isLoading}
            autoComplete="name"
            rightIcon={<User className="h-4 w-4" />}
          />
        </div>

        {/* Email Field */}
        <div className="space-y-1">
          <Label htmlFor="register-email">Email Address</Label>
          <Input
            id="register-email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={isLoading}
            autoComplete="email"
            rightIcon={<Mail className="h-4 w-4" />}
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password (min. 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={isLoading}
            autoComplete="new-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-white transition-colors focus:outline-none"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            disabled={isLoading}
            autoComplete="new-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="hover:text-white transition-colors focus:outline-none"
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full text-sm font-semibold tracking-wide flex items-center justify-center space-x-2"
            isLoading={isLoading}
          >
            <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
            {!isLoading && <ArrowRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </form>

      {/* Switch to Login */}
      <div className="mt-5 text-center text-xs text-neutral-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-white hover:underline transition-all inline-flex items-center ml-1"
        >
          Log in
        </Link>
      </div>

      {/* Terms & Privacy Policy Disclaimer */}
      <p className="mt-4 text-[11px] text-center text-neutral-500 leading-normal">
        By creating an account, you agree to our{' '}
        <span className="underline cursor-pointer hover:text-neutral-400">Terms</span> &{' '}
        <span className="underline cursor-pointer hover:text-neutral-400">Privacy Policy</span>.
      </p>
    </motion.div>
  );
};
