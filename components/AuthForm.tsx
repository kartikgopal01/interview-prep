"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { z } from "zod"
import FormField from "./FormField"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import {auth} from "@/firebase/client"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { signIn, signUp } from "@/lib/actions/auth.action"
import { useState } from "react"

type FormType = "sign-in" | "sign-up";

const authFormSchema = (type : FormType) => {
    return z.object({
        name:type === 'sign-up' ? z.string().min(3) :z.string().optional(),
        email: z.string().email(),
        password: z.string().min(8).max(32),
    })
}


const AuthForm = ({type}:{type:FormType}) => {

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const formSchema = authFormSchema(type);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try{
            if(type === "sign-in"){
                const {email,password} = values;

                const userCredentials = await signInWithEmailAndPassword(auth,email,password);
                const idToken = await userCredentials.user.getIdToken();

                if(!idToken){
                    toast.error("Failed to sign in")
                    return;
                }
                const signInResult = await signIn({
                    email,
                    idToken,
                })
                
                if (!(signInResult?.success ?? false)) {
                    toast.error(signInResult?.message ?? "Failed to sign in")
                    return;
                }

                toast.success("Signed in successfully")
                // Add a delay to allow cookie to be set before redirect
                setTimeout(() => {
                    router.push("/")
                }, 1000);
            }else{
                const {name,email,password} =values;

                const userCredentials = await createUserWithEmailAndPassword(auth,email,password);
                

                const result = await signUp({
                    uid: userCredentials.user.uid,
                    name:name!,
                    email,
                    password,
                })
                if(!(result?.success ?? false)){
                    toast.error(result?.message ?? "An unknown error occurred")
                    return;
                }
                toast.success("Account Created Successfully")
                // Redirect to sign-in page after successful registration
                router.push("/sign-in");
            }

        }
        catch (error: any) {
            console.log(error);
            let errorMessage = "An unknown error occurred";
            
            // Handle Firebase auth errors
            if (error?.code === 'auth/user-not-found' || error?.code === 'auth/wrong-password') {
                errorMessage = "Invalid email or password";
            } else if (error?.code === 'auth/email-already-in-use') {
                errorMessage = "Email already in use";
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            toast.error(`Error: ${errorMessage}`);
        }
        finally {
            setIsLoading(false);
        }
    }

    const isSignIn = type === "sign-in";
    return (
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-14 px-10">
                <div className="flex flex-row gap-2 justify-center"><Image src="/logo.svg" alt="logo" width={38} height={32} />

                    <h2 className="text-primary-100">InterviewPrep</h2>
                </div>

                <h3>Practice Job Interviews</h3>


                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 ">
                        {!isSignIn && <FormField control={form.control} name="name" label="Name" placeholder="Your name" type="text" />}

                        <FormField control={form.control} name="email" label="Email" placeholder="Your email" type="email" />
                        <FormField control={form.control} name="password" label="Password" placeholder="Enter Your password" type="password" />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Processing..." : (isSignIn ? "Sign In" : "Create an account")}
                        </Button>
                    </form>
                </Form>

                <p className="text-sm text-muted-foreground text-center">
                    {isSignIn?"Don't have an account?":"Already have an account?"}

                  <Link href={isSignIn?"/sign-up":"/sign-in"} className="font-bold text-user-primary ml-1">{isSignIn?"Create an account":"Sign In"}</Link>
                </p>
            </div>
        </div>
    )
}

export default AuthForm
