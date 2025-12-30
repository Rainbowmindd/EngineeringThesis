import * as React from "react"
import { GraduationCap, User } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/Button"
import { fetchUserProfile, type UserProfile } from "../../api/auth.ts";
import { useEffect } from "react";

const LecturerHeader: React.FC = () => {
  const navigate = useNavigate()

  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchUserProfile()
        setUserProfile(data)
      } catch (error) {
        console.error("Błąd ładowania profilu użytkownika w Headerze:", error)
        if (error.response && error.response.status === 401) {
             handleLogout();
        }
      }
    }

    // Sprawdź, czy mamy token, zanim spróbujemy pobrać profil
    if (localStorage.getItem("authToken")) {
        loadProfile();
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
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
        <nav className="hidden lg:flex items-center space-x-6">
  <Link
    to="/lecturer-dashboard"
    className="text-gray-900 font-semibold hover:text-green-600 transition-colors"
  >
    Mój panel
  </Link>

  <Link
    to="/lecturer-calendar" // lub /lecturer-schedule
    className="text-gray-600 hover:text-green-600 transition-colors font-medium"
  >
    Mój harmonogram
  </Link>

  <Link
    to="/lecturer-reservations" // lub /lecturer-students
    className="text-gray-600 hover:text-green-600 transition-colors font-medium"
  >
    Zarządzaj konsultacjami
  </Link>

  <a
    href="https://web.usos.agh.edu.pl/kontroler.php?_action=news/default"
    target="_blank"
    rel="noopener noreferrer"
    className="text-gray-600 hover:text-green-600 transition-colors font-medium"
  >
    Plan zajęć
  </a>

</nav>


        {/* Profil i Wylogowanie */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors">
            <User className="h-5 w-5 text-green-500" />
            <span className="font-semibold">
              {userProfile
                  ? `${userProfile.first_name} ${userProfile.last_name}`
                  :"Ładowanie..."
              }</span>
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

export default LecturerHeader
