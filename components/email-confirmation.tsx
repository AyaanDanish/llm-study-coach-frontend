"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Mail, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

type EmailConfirmationProps = {
  email: string
  onResendConfirmation: () => Promise<void>
  onBackToLanding: () => void
}

export default function EmailConfirmation({ email, onResendConfirmation, onBackToLanding }: EmailConfirmationProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendCount, setResendCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Create a broadcast channel to listen for email confirmation
    const channel = new BroadcastChannel("email_confirmation")

    // Listen for the confirmation message
    channel.onmessage = async (event) => {
      if (event.data === "email_confirmed") {
        // Get the current session to check if user needs onboarding
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("completedonboarding")
            .eq("id", session.user.id)
            .single()

          router.push("/")
        }
      }
    }

    // Clean up the channel when component unmounts
    return () => {
      channel.close()
    }
  }, [router])

  const handleResend = async () => {
    if (resendCount >= 3) {
      alert("Maximum resend attempts reached. Please try again later.")
      return
    }

    setIsResending(true)
    try {
      await onResendConfirmation()
      setResendCount((prev) => prev + 1)
    } catch (error) {
      console.error("Resend error:", error)
    } finally {
      setIsResending(false)
    }
  }

  // Check if using placeholder Supabase
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder")

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center justify-center p-4 relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/50 relative z-10">
        <div className="flex items-center mb-8">
          <button
            onClick={onBackToLanding}
            className="p-2 rounded-full hover:bg-indigo-50 transition text-indigo-600"
            type="button"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center mx-auto pr-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-lg mr-2">
              <Mail size={20} />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Study Coach
            </h1>
          </div>
        </div>

        {isPlaceholder && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Development Mode</p>
                <p>You're using placeholder Supabase credentials. Email confirmation is disabled.</p>
                <button onClick={onBackToLanding} className="mt-2 text-yellow-700 underline hover:text-yellow-900">
                  Go back and continue without email confirmation
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="text-indigo-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-4">We've sent a confirmation link to:</p>
          <p className="text-indigo-600 font-semibold bg-indigo-50 px-4 py-2 rounded-lg">{email}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Next Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Check your email inbox</li>
                  <li>Click the confirmation link</li>
                  <li>Return to this window</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Troubleshooting:</p>
              <ul className="list-disc list-inside space-y-1 text-amber-700">
                <li>Check your spam/junk folder</li>
                <li>Make sure {email} is correct</li>
                <li>Wait a few minutes for delivery</li>
                <li>Check if your email provider blocks automated emails</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">Still no email?</p>
            <button
              onClick={handleResend}
              disabled={isResending || resendCount >= 3}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <RefreshCw className="animate-spin mr-2" size={16} />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2" size={16} />
                  Resend Email {resendCount > 0 && `(${resendCount}/3)`}
                </>
              )}
            </button>
          </div>

          {resendCount >= 3 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-800 text-sm">
                Maximum resend attempts reached. Please try again later or contact support.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <button onClick={onBackToLanding} className="text-indigo-600 hover:text-indigo-800 font-medium">
              Go back to home
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
