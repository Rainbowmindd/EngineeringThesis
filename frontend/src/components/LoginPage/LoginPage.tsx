import { useState } from "react";
import axios, {AxiosError} from "axios";
import { useNavigate, Link } from "react-router-dom";
import { login, register, fetchUserProfile } from "../../api/auth";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus
} from "lucide-react";
// import {GoogleLogin as GoogleOAuthLogin} from "@react-oauth/google";

interface LoginPageProps {
  isRegisterPage: boolean;
}

export function LoginPage({ isRegisterPage }: LoginPageProps) {
  const navigate = useNavigate();


  const [emailLogin, setEmailLogin] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "lecturer">("student");
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");



  const handleSubmitLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const data = await login(emailLogin,password);
      console.log("Login successful:", data);
      localStorage.setItem("authToken", data.access);

      const userProfile= await fetchUserProfile();
      const role = userProfile.role as "student" | "lecturer";
      if (role === "lecturer") {
        navigate("/lecturer-dashboard"); }
      else if(role === "student") {
        navigate("/student-dashboard")
      } else {
        navigate("/");
      }} catch (err) {
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError;

      if (axiosError.response?.status === 401) {
        setError("Nieprawidłowe dane logowania. Spróbuj ponownie.");
        return;
      }

      if (axiosError.response?.data) {
        const errorData = axiosError.response.data as any;

        if (typeof errorData === "string") {
          setError(errorData);
          return;
        }

        if (typeof errorData === "object") {
          const messages = Object.values(errorData).flat().join(" ");
          setError("❌ " + messages);
          return;
        }
      }
    }

    setError(" Wystąpił błąd podczas logowania.");
  }

  };

  // Registration page state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const data = await register({ username, email, password1, password2, role ,first_name:firstName, last_name: lastName});
      console.log("Rejestracja udana:", data);
      setMessage(
        "Rejestracja zakończona sukcesem! Za chwilę nastąpi przekierowanie do strony logowania.");
          setTimeout(() => {
            navigate("/login");
          },2000
      );
    } catch (err) {
      console.error(err);
      // Obsługa szczegółowych komunikatów przy rejestracji
      if (axios.isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data as any;

        if (typeof errorData === "string") {
          setError(errorData);
          return;
        }

           if (typeof errorData === "object") {
        // Wyciągamy wszystkie komunikaty błędów i łączymy w jeden string
        const messages = Object.values(errorData)
          .flat()
          .map((msg) => msg.toString())
          .join(" \n ");
        setError(messages);
        return;
      }
    }
    setError("Rejestracja nie powiodła się. Sprawdź podane dane i spróbuj ponownie.");
    }
  };

return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

      {}
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg border border-gray-200">

        {/*header card*/}
        <div className="text-center mb-6">
          <GraduationCap className="h-10 w-10 text-green-600 mx-auto mb-2" />
          <h2 className="text-3xl font-bold text-gray-900">
            {isRegisterPage ? "Załóż Konto Studenta" : "Logowanie do systemu"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isRegisterPage ? "Wypełnij dane, aby uzyskać dostęp." : "Użyj swoich danych AGH."}
          </p>
        </div>

        {/*Messages */}
        {error && (
            <p className="text-sm font-medium text-red-700 bg-red-100 p-3 rounded-lg border border-red-300 mb-4">
              {error}
            </p>
          )}
        {message && (
          <p className="text-sm font-medium text-green-700 bg-green-100 p-3 rounded-lg border border-green-300 mb-4">
            {message}
          </p>
        )}

        {!isRegisterPage && (
          <form onSubmit={handleSubmitLogin} className="space-y-4">

            {/* Pole Email */}
            <div className="relative">
              <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                placeholder="Email (Nazwa użytkownika)"
                value={emailLogin}
                onChange={(e) => setEmailLogin(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              />
            </div>

            {/* Pole Hasło */}
            <div className="relative">
              <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                placeholder="Hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              />
            </div>

            {/* Przycisk Logowania */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 ease-in-out shadow-md flex items-center justify-center space-x-2"
            >
              <LogIn className="h-5 w-5" />
              <span>Zaloguj się</span>
            </button>

    {/*/!* --- Google OAuth --- *!/*/}
    {/*<div className="mt-2">*/}
    {/*  <GoogleOAuthLogin*/}
    {/*    onSuccess={async credentialResponse => {*/}
    {/*      const token = credentialResponse.credential;*/}
    {/*      try {*/}
    {/*        const { data } = await axios.post(*/}
    {/*          // 'http://localhost:8000/api/auth/social/google/',*/}
    {/*          { access_token: token }*/}
    {/*        );*/}
    {/*        localStorage.setItem('authToken', data.access);*/}

    {/*        const userProfile = await fetchUserProfile();*/}
    {/*        const role = userProfile.role as 'student' | 'lecturer';*/}
    {/*        if (role === 'lecturer') navigate('/lecturer-dashboard');*/}
    {/*        else if (role === 'student') navigate('/student-dashboard');*/}
    {/*        else navigate('/');*/}
    {/*      } catch (error) {*/}
    {/*        console.error(error);*/}
    {/*        setError('Nie udało się zalogować przez Google.');*/}
    {/*      }*/}
    {/*    }}*/}
    {/*    onError={() => setError('Nie udało się zalogować przez Google.')}*/}
    {/*  />*/}
    {/*</div>*/}
            {/* Link do resetowania hasła */}
<div className="mt-2 text-right">
  <Link
    to="/password-reset"
    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition duration-150"
  >
    Zapomniałeś hasła?
  </Link>
</div>
          </form>
        )}

        {/* --- Formularz Rejestracji --- */}
        {isRegisterPage && (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Pole Imię (NOWE) */}
            <div className="relative">
              <User className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Imię"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-600 focus:border-green-600 transition duration-150 ease-in-out"
              />
            </div>

            {/* Pole Nazwisko (NOWE) */}
            <div className="relative">
              <User className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nazwisko" // lub Last Name
                value={lastName} // Użyj nowego stanu
                onChange={(event) => setLastName(event.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-600 focus:border-green-600 transition duration-150 ease-in-out"
              />
            </div>

            {/* Pole Username */}
            <div className="relative">
              <User className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nazwa użytkownika"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-600 focus:border-green-600 transition duration-150 ease-in-out"
              />
            </div>

            {/* Pole Email */}
            <div className="relative">
              <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-600 focus:border-green-600 transition duration-150 ease-in-out"
              />
            </div>

            {/* Pole Hasło 1 */}
            <div className="relative">
              <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                placeholder="Hasło"
                value={password1}
                onChange={(event) => setPassword1(event.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-600 focus:border-green-600 transition duration-150 ease-in-out"
              />
            </div>

            {/* Pole Hasło 2 */}
            <div className="relative">
              <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                placeholder="Potwierdź hasło"
                value={password2}
                onChange={(event) => setPassword2(event.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-600 focus:border-green-600 transition duration-150 ease-in-out"
              />
            </div>
            {/* Pole wybór roli */}
            <div className="relative">
              <label className="text-gray-600 text-sm font-medium mb-1 block">Rola</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "student" | "lecturer")}
                className="w-full pl-2 pr-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="student">Student</option>
                <option value="lecturer">Prowadzący</option>
              </select>

            </div>

            {/* Przycisk Rejestracji */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition duration-200 ease-in-out shadow-md flex items-center justify-center space-x-2"
            >
              <UserPlus className="h-5 w-5" />
              <span>Zarejestruj się</span>
            </button>
          </form>
        )}

        {/* Stopka z przełącznikiem trybu Card Footer*/}
        <div className="mt-6 text-center text-sm border-t pt-4">
          {isRegisterPage ? (
            <p className="text-gray-600">
              Masz już konto?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition duration-150">
                Zaloguj się
              </Link>
            </p>
          ) : (
            <p className="text-gray-600">
              Nie masz konta?{" "}
              <Link to="/register" className="text-green-600 hover:text-green-700 font-medium transition duration-150">
                Zarejestruj się
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
