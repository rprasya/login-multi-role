/* eslint-disable @typescript-eslint/no-unused-vars */
"use server"

import { RegisterSchema, SignInSchema } from "@/lib/zod"
import { hashSync } from "bcrypt-ts"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AuthError } from "next-auth"
import { signIn } from "@/lib/auth"

// sign up credentcial saction
export const signUpCredentials = async (prevState: unknown, formData: FormData) => {
    const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()))
    
    if(!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors
        }
    }
    
    const {name, email, password} = validatedFields.data
    const hashedPassword = hashSync(password, 10)
    
    try {
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })
    } catch (error) {
        return{message: "Failed to register user"}
    }
    redirect("/login")
}

// sign in credentcial saction
export const signInCredentials = async (prevState: unknown, formData: FormData) => {
    const validatedFields = SignInSchema.safeParse(Object.fromEntries(formData.entries()))
    
    if(!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors
        }
    }
    
    const {email, password} = validatedFields.data;

    try {
        await signIn("credentials", {email, password, redirectTo: "/dashboard"})
    } catch (error) {
        if(error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return {message: "Invalid Credentials."}
                default:
                    return {message: "Something went wrong."}
            }
        }
        throw error;
    }
}