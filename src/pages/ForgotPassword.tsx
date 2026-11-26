import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, Bot } from 'lucide-react';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.requestPasswordReset(email);
      if (res.success) {
        navigate('/reset-password');
      } else {
        setError(res.message || 'Failed to initiate password reset.');
      }
    } catch {
      setError('An error occurred. Please try again.');
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

        <div className="mb-6 space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Reset your password
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Enter your email address to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1">
            <Label htmlFor="reset-email">Email Address</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              disabled={isLoading}
              autoComplete="email"
              rightIcon={<Mail className="h-4 w-4" />}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full text-sm font-semibold tracking-wide flex items-center justify-center space-x-2"
              isLoading={isLoading}
            >
              <span>{isLoading ? 'Processing...' : 'Continue'}</span>
              {!isLoading && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-400">
          <Link
            to="/login"
            className="font-medium text-neutral-300 hover:text-white transition-all inline-flex items-center space-x-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            <span>Back to Login</span>
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  );
};

export default ForgotPassword;
