import AuthForm from '@/components/AuthForm'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Sign In | InterviewPrep AI',
  description: 'Sign in to continue your AI-powered interview practice sessions',
}

const SignInPage = () => {
  return <AuthForm type="sign-in"/>
}

export default SignInPage
