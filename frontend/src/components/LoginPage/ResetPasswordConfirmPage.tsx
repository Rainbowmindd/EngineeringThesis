import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

export default function ResetPasswordConfirm() {
  const { uid, token } = useParams()
  const navigate = useNavigate()

  const [password1, setPassword1] = useState("")
  const [password2, setPassword2] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password1 !== password2) {
      setError("Hasła nie są takie same")
      return
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/password/reset/confirm/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          token,
          new_password1: password1,
          new_password2: password2
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.detail || "Błąd resetowania hasła")
      }

      setSuccess(true)

      setTimeout(() => {
        navigate("/login")
      }, 2000)

    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">

        <h1 className="text-xl font-bold mb-4">Ustaw nowe hasło</h1>

        {error && <p className="text-red-500 mb-3">{error}</p>}
        {success && <p className="text-green-600 mb-3">Hasło zmienione! Przekierowanie...</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nowe hasło"
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            className="border w-full p-2 mb-3 rounded"
            required
          />

          <input
            type="password"
            placeholder="Powtórz hasło"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="border w-full p-2 mb-3 rounded"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Zmień hasło
          </button>
        </form>
      </div>
    </div>
  )
}
