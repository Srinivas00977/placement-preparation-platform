import React from 'react';
import { AuthLayout } from '@/components/layout/auth-layout';
import { RegisterForm } from '@/components/auth/register-form';

export const Register: React.FC = () => {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
