"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { CheckCircle, Loader2, X } from "lucide-react"

function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [errorMessage, setErrorMessage] = useState<string>("")

    useEffect(() => {
        const handleEmailConfirmation = async () => {
            try {
                // Try to get the session directly first
                const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession()

                if (existingSession?.user?.email_confirmed_at) {
                    setStatus("success")
                    // Broadcast confirmation to other tabs
                    const channel = new BroadcastChannel("email_confirmation")
                    channel.postMessage("email_confirmed")
                    channel.close()
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
                // Broadcast confirmation to other tabs
                const channel = new BroadcastChannel("email_confirmation")
                channel.postMessage("email_confirmed")
                channel.close()
            } catch (error) {
                setStatus("error")
                setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred")
            }
        }

        handleEmailConfirmation()
    }, [router, searchParams])

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center justify-center p-4 relative">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-4000"></div>
            </div>

            {status === "loading" && (
                <>
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                        <Loader2 className="text-indigo-600 animate-spin" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirming Your Email</h2>
                    <p className="text-gray-600">Please wait while we verify your email address...</p>
                </>
            )}

            {status === "success" && (
                <>
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="text-green-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Confirmed!</h2>
                    <p className="text-gray-600 mb-4">Your email has been successfully verified.</p>
                    <div className="flex items-start">
                        <X className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" size={20} />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">You can now:</p>
                            <ol className="list-decimal list-inside space-y-1 text-blue-700">
                                <li>Close this tab</li>
                                <li>Return to the original window</li>
                                <li>Your account will be automatically updated</li>
                            </ol>
                        </div>
                    </div>
                </>
            )}

            {status === "error" && (
                <>
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-100 to-rose-100 rounded-full flex items-center justify-center mb-4">
                        <svg
                            className="text-red-600"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
                    <p className="text-gray-600 mb-4">{errorMessage}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
                    >
                        Return to Home
                    </button>
                </>
            )}
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