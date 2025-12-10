import * as React from "react"
import { GraduationCap } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/Button"

const HomeHeader: React.FC = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("authToken")
  const role = localStorage.getItem("role")

  const handleGoToDashboard = () => {
    if (role === "student") navigate("/student-dashboard")
    else if (role === "lecturer") navigate("/lecturer-dashboard")
    else navigate("/login")
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <GraduationCap className="h-8 w-8 text-green-600" />
          <span className="text-xl font-bold text-gray-900">Konsultacje AGH</span>
        </div>

        {/* Nawigacja */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link
            to="/help"
            className="text-gray-600 hover:text-green-600 transition-colors font-medium"
          >
            Pomoc
          </Link>

          <Link
            to="/about"
            className="text-gray-600 hover:text-green-600 transition-colors font-medium"
          >
            O systemie
          </Link>
        </nav>

        {/* Call To Action */}
        <div>
          {!token ? (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => navigate("/login")}
            >
              Zaloguj się
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="border-green-600 text-green-700 hover:bg-green-50"
              onClick={handleGoToDashboard}
            >
              Przejdź do panelu
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

export default HomeHeader
