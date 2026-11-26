import React from 'react';
import { AuthLayout } from '@/components/layout/auth-layout';
import { LoginForm } from '@/components/auth/login-form';

export const Login: React.FC = () => {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
