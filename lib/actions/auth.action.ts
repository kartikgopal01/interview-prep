'use server'

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

interface SignUpParams {
    uid: string;
    name: string;
    email: string;
    password: string;
}

interface SignInParams {
    email: string;
    idToken: string;
}

export async function signUp(params:SignUpParams){
    const{ uid, name, email} = params;

    try{
        const userRecord = await db.collection('users').doc(uid).get();
        if(userRecord.exists){
            return{
                success:false,
                message:'user already exists',
            }
        }

        await db.collection('users').doc(uid).set({
            name,
            email
        })

        return{
            success:true,
            message:'user created successfully',
        }

    }
    catch(error :any){
        console.log('error creating user',error);

        if(error.code === 'auth/email-already-exists'){
            throw new Error('Email already in use')
        }

        return{
            success:false,
            message:'failed to create user',
        }
    }
}

export async function signIn(params:SignInParams){
    const {email, idToken} = params;
    try{
        const userRecord = await auth.getUserByEmail(email);
        if(!userRecord){
            return{
                success:false,
                message:'user does not exist. Please sign up'
            }
        }
        await setSessionCookie(idToken);
        
        return {
            success: true,
            message: 'Signed in successfully'
        };
    }
    catch(error:any){
        console.log('error signing in',error);
        if(error.code === 'auth/user-not-found'){
            return {
                success: false,
                message: 'User not found'
            };
        }
        return{
            success:false,
            message: error.message || 'failed to sign in',
        }
    }
}

export async function setSessionCookie(idToken:string){
    try {
    const sessionCookie = await auth.createSessionCookie(idToken, {
            expiresIn: 60 * 60 * 24 * 7 * 1000, // 1 week
        });
   
        // Set cookie with properly formatted options
        const cookieStore = await cookies();
cookieStore.set("session", sessionCookie, {
            maxAge: 60 * 60 * 24 * 7, // 1 week in seconds (note: not milliseconds)
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax"
        });
        
        console.log("Session cookie set successfully");
        return { success: true };
    } catch (error: any) {
        console.error("Error setting session cookie:", error);
        return { 
            success: false, 
            message: error.message || "Failed to set session cookie" 
        };
    }
}

export async function getCurrentUser(): Promise<User | null>{
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('session');
        console.log("Session check:", !!session?.value);
        
        if(!session?.value){
            console.log("No session cookie found");
            return null;
        }

        try{
            const decodedClaims = await auth.verifySessionCookie(session.value, true);
            console.log("Decoded claims:", decodedClaims.uid);
            
            const userRecord = await db.collection('users').doc(decodedClaims.uid).get();
            console.log("User record exists:", userRecord.exists);
            
            if(!userRecord.exists){
                console.log("User record not found in database");
                return null;
            }

            return {
                ...userRecord.data(),
                id: userRecord.id,
            } as User;

        }
        catch(error:any){
            console.log('Session verification error:', error.message);
            // Clear invalid session cookie
            cookieStore.delete("session");
            return null;
        }
    } catch (error: any) {
        console.log('Error getting current user:', error.message);
        return null;
    }
}

export async function isAuthenticated() {
    try {
        // Get the session cookie
        const cookieStore = await cookies();
        const session = cookieStore.get('session');
        
        console.log("Session cookie exists:", !!session?.value);
        
        if (!session?.value) {
            return false;
        }
        
        try {
            // Verify the session cookie
            const decodedClaims = await auth.verifySessionCookie(session.value);
            console.log("Session verified, user ID:", decodedClaims.uid);
            return true;
        } catch (error: any) {
            console.error("Session verification failed:", error.message);
            return false;
        }
    } catch (error: any) {
        console.error("Error in authentication check:", error.message);
        return false;
    }
}

export async function signOut() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("session");
        return { success: true };
    } catch (error: any) {
        console.error("Error signing out:", error);
        return { 
            success: false, 
            message: error.message || "Failed to sign out" 
        };
    }
}

// Add the User type if missing
interface User {
    id: string;
    name: string;
    email: string;
    [key: string]: any;
}