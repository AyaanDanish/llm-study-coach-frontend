"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { CheckCircle, Loader2, X } from "lucide-react"

function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [errorMessage, setErrorMessage] = useState<string>("")
    const hasBroadcastRef = useRef(false)

    useEffect(() => {
        const handleEmailConfirmation = async () => {
            try {
                // Try to get the session directly first
                const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError) {
                    throw sessionError
                }

                if (existingSession?.user?.email_confirmed_at) {
                    setStatus("success")
                    // Only broadcast if we haven't already
                    if (!hasBroadcastRef.current) {
                        const channel = new BroadcastChannel("email_confirmation")
                        channel.postMessage("email_confirmed")
                        channel.close()
                        hasBroadcastRef.current = true
                    }
                    return
                }

                // If no existing session, try to exchange the token
                const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(
                    window.location.hash.substring(1)
                )

                if (exchangeError) {
                    throw exchangeError
                }

                if (!session?.user?.email_confirmed_at) {
                    throw new Error("Email confirmation failed - email not confirmed after verification")
                }

                setStatus("success")
                // Only broadcast if we haven't already
                if (!hasBroadcastRef.current) {
                    const channel = new BroadcastChannel("email_confirmation")
                    channel.postMessage("email_confirmed")
                    channel.close()
                    hasBroadcastRef.current = true
                }

            } catch (error: any) {
                console.error("Email confirmation error:", error)
                setStatus("error")
                setErrorMessage(error.message || "Failed to confirm email")
            }
        }

        handleEmailConfirmation()
    }, [router])

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
                <div className="text-center text-white">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Confirming your email...</p>
                </div>
            </div>
        )
    }

    if (status === "success") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
                <div className="text-center text-white">
                    <CheckCircle className="h-8 w-8 mx-auto mb-4 text-green-400" />
                    <p>Email confirmed successfully!</p>
                    <p className="text-sm mt-2">You can close this tab and return to the original window.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
            <div className="text-center text-white">
                <X className="h-8 w-8 mx-auto mb-4 text-red-400" />
                <p>Error: {errorMessage}</p>
                <button
                    onClick={() => router.push("/")}
                    className="mt-4 px-4 py-2 bg-white text-indigo-600 rounded-full font-medium hover:bg-indigo-50 transition"
                >
                    Return to Home
                </button>
            </div>
        </div>
    )
}

export default function AuthCallback() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center justify-center">
                <Loader2 className="text-indigo-600 animate-spin" size={32} />
                <p className="mt-4 text-gray-600">Loading...</p>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    )
} 