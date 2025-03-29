"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { z } from "zod"
import FormField from "./FormField"
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



const authFormSchema = (type : FormType) => {
    return z.object({
        name:type === 'sign-up' ? z.string().min(3) :z.string().optional(),
        email: z.string().email(),
        password: z.string().min(8).max(32),
    })
}


const AuthForm = ({type}:{type:FormType}) => {

    const router = useRouter();

    const formSchema =authFormSchema(type);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        try{
            if(type === "sign-in"){
                toast.success("Sign in successfully")
                router.push("/")
            }else{
                toast.success("Account Created Successfully")
                router.push("/sign-in")
            }

        }
        catch (error) {
            console.log(error);
            toast.error("Something went wrong ${error}");
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
                        <Button type="submit">{isSignIn?"Sign In":"Create an account"}</Button>
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
