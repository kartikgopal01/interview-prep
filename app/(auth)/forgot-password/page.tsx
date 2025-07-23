import ForgotPasswordForm from '@/components/ForgotPasswordForm'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Reset Password | InterviewPrep AI',
  description: 'Reset your password to continue your AI-powered interview practice sessions',
}

const ForgotPasswordPage = () => {
  return <ForgotPasswordForm />
}

export default ForgotPasswordPage 