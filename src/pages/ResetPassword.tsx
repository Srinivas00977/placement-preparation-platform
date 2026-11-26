import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, CheckCircle2, ArrowRight, Bot } from 'lucide-react';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string; form?: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      newErrors.newPassword = 'Please enter a new password.';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await authService.resetPassword(newPassword);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrors({ form: res.message || 'Password reset failed.' });
      }
    } catch {
      setErrors({ form: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-md mx-auto py-2"
      >
        <div className="mb-4 flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-white shadow-inner">
            <Bot className="h-5 w-5" />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-white uppercase">
            PlacePilot AI
          </span>
        </div>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-4"
          >
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                Password updated successfully.
              </h2>
              <p className="text-xs text-neutral-400">
                Your password has been changed. Please sign in with your new password.
              </p>
            </div>

            <div className="pt-4">
              <Button
                type="button"
                size="lg"
                onClick={() => navigate('/login')}
                className="w-full text-sm font-semibold tracking-wide"
              >
                Back to Login
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="mb-6 space-y-1">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Create a new password
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400">
                Enter your new password below.
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

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Create new password (min. 8 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={errors.newPassword}
                  disabled={isLoading}
                  autoComplete="new-password"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="hover:text-white transition-colors focus:outline-none"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <Input
                  id="confirm-new-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
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
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-sm font-semibold tracking-wide flex items-center justify-center space-x-2"
                  isLoading={isLoading}
                >
                  <span>{isLoading ? 'Updating...' : 'Reset Password'}</span>
                  {!isLoading && <ArrowRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </AuthLayout>
  );
};

export default ResetPassword;
