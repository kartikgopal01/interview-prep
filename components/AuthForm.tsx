"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        await signIn({
          email,
          idToken,
        });

        toast.success("Signed in successfully.");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">
          {isSignIn ? "Welcome Back" : "Create Account"}
        </h1>
      </div>

      {/* Auth Form Card */}
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
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Full Name"
                placeholder="Enter your full name"
                type="text"
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email Address"
              placeholder="Enter your email address"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button 
              className="btn-primary w-full py-3 text-lg font-semibold" 
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isSignIn ? "Signing In..." : "Creating Account..."}
                </div>
              ) : (
                isSignIn ? "Sign In" : "Create Account"
              )}
            </Button>
          </form>
        </Form>
      </div>

      {/* Footer Section */}
      <div className="text-center">
        <div className="text-sm text-muted-foreground">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="text-primary hover:text-primary/80 font-semibold ml-1 transition-colors"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;