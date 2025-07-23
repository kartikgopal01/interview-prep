import AuthForm from '@/components/AuthForm'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Sign Up | InterviewPrep AI',
  description: 'Create your account and start mastering your interview skills with AI-powered practice sessions',
}

const SignUpPage = () => {
  return <AuthForm type="sign-up"/>
}

export default SignUpPage
