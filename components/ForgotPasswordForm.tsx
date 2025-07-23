"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormField from "./FormField";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const ForgotPasswordForm = () => {
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    try {
      await sendPasswordResetEmail(auth, data.email);
      setEmailSent(true);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      if (error.code === 'auth/user-not-found') {
        // For security, don't reveal if email exists
        setEmailSent(true);
        toast.success("If an account with this email exists, a password reset link has been sent.");
      } else {
        toast.error("Failed to send password reset email. Please try again.");
      }
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Check Your Email
          </h1>
        </div>

        {/* Success Card */}
        <div className="companion-card max-w-lg mx-auto">
          {/* Logo inside form */}
          <div className="flex justify-center mb-8">
            <Image 
              src="/logo2.svg" 
              alt="InterviewPrep AI" 
              width={300} 
              height={300}
            />
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <p className="text-muted-foreground">
              We've sent a password reset link to your email address. 
              Please check your inbox and follow the instructions to reset your password.
            </p>
            
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <Button 
              onClick={() => setEmailSent(false)}
              variant="outline"
              className="w-full"
            >
              Try Another Email
            </Button>
            
            <Link href="/sign-in">
              <Button className="btn-primary w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">
          Reset Your Password
        </h1>
        <p className="text-muted-foreground mt-2">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {/* Form Card */}
      <div className="companion-card max-w-lg mx-auto">
        {/* Logo inside form */}
        <div className="flex justify-center mb-8">
          <Image 
            src="/logo2.svg" 
            alt="InterviewPrep AI" 
            width={300} 
            height={300}
          />
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              label="Email Address"
              placeholder="Enter your email address"
              type="email"
            />

            <Button 
              className="btn-primary w-full py-3 text-lg font-semibold" 
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending Reset Email...
                </div>
              ) : (
                "Send Reset Email"
              )}
            </Button>
          </form>
        </Form>
      </div>

      {/* Footer Section */}
      <div className="text-center">
        <div className="text-sm text-muted-foreground">
          Remember your password?
          <Link
            href="/sign-in"
            className="text-primary hover:text-primary/80 font-semibold ml-1 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm; 