import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:8000/api/auth/password/reset/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.email?.[0] || "Wystąpił błąd przy wysyłaniu maila")
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-500 mb-4">
            {submitted ? (
              <CheckCircle className="w-6 h-6 text-white" />
            ) : (
              <Mail className="w-6 h-6 text-white" />
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {submitted ? "Email wysłany" : "Resetuj hasło"}
          </h1>

          <p className="text-gray-600">
            {submitted
              ? "Sprawdź swoją skrzynkę odbiorczą, aby zresetować hasło"
              : "Wpisz adres email, aby otrzymać link do resetowania hasła"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="twoj.email@agh.edu.pl"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Wyślemy Ci link do resetowania hasła
                </p>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
              )}

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-500 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:opacity-50"
              >
                {loading ? "Wysyłanie..." : "Wyślij link resetowania"}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">
                Wysłaliśmy link na adres: <span className="font-semibold">{email}</span>
              </p>

              <p className="text-sm text-gray-500">
                Jeśli nie widzisz maila, sprawdź spam
              </p>
            </div>
          )}
        </div>

        {/* Back to login */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do logowania
          </Link>
        </div>
      </div>
    </div>
  )
}
