import * as React from "react"
import { GraduationCap, User } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/Button"

const Header: React.FC = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("autghToken")
    localStorage.removeItem("role");

    navigate("/login", {replace: true})
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
          <GraduationCap className="h-8 w-8 text-green-600" />
          <span className="text-xl font-bold text-gray-900">Konsultacje AGH</span>
        </div>

        {/* Nawigacja */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link 
            to="/lecturers" 
            className="text-gray-600 hover:text-green-600 transition-colors font-medium"
          >
            Moi wykładowcy
          </Link>

          <Link 
            to="/my-consultations" 
            className="text-gray-600 hover:text-green-600 transition-colors font-medium"
          >
            Moje konsultacje
          </Link>

          <Link 
            to="/schedule" 
            className="text-gray-600 hover:text-green-600 transition-colors font-medium"
          >
            Plan zajęć
          </Link>

          <Link 
            to="/help" 
            className="text-gray-600 hover:text-green-600 transition-colors font-medium"
          >
            Pomoc
          </Link>
        </nav>

        {/* Profil i Wylogowanie */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors">
            <User className="h-5 w-5 text-green-500" />
            <span className="font-semibold">Jan Kowalski</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={handleLogout}
          >
            Wyloguj
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
