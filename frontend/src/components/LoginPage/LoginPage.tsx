import { useState } from "react";
import axios, {AxiosError} from "axios";
import { useNavigate, Link } from "react-router-dom";
import { login, register } from "../../api/auth";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus
} from "lucide-react";

interface LoginPageProps {
  isRegisterPage: boolean;
}

export function LoginPage({ isRegisterPage }: LoginPageProps) {
  const navigate = useNavigate();

  // Login page state
  const [emailLogin, setEmailLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmitLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const data = await login({ username: emailLogin, password: password });
      console.log("Login successful:", data);
      localStorage.setItem("authToken", data.key);
      navigate("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError;
        console.error("Blad rejestracji (Axios):",axiosError);

        if(axiosError.response && err.response && err.response.data){
          console.log("Response data:", err.response.data);
          const errorData = axiosError.response.data as Record<string, string[]>;
                let errorMessage = "Rejestracja nieudana: ";
                for (const key in errorData) {
                    errorMessage += `${errorData[key].join(' ')} `;
                }
                setError(errorMessage.trim());
        }
      }

      console.error(err.response.data);
      setError("Login failed. Please check your credentials and try again.");
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
    try {
      const data = await register({ username, email, password1, password2 });
      console.log("Registration successful:", data);
      setMessage(
        "Registration successful! Redirecting to login page...");
          setTimeout(() => {
            navigate("/login");
          },2000
      );
    } catch (err) {
      console.error(err);
      setError(
        "Registration failed. Please check your credentials and try again."
      );
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

        {/* --- Formularz Logowania --- */}
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
          </form>
        )}

        {/* --- Formularz Rejestracji --- */}
        {isRegisterPage && (
          <form onSubmit={handleSubmit} className="space-y-4">

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

        {/* Stopka z przełącznikiem trybu (Card Footer) */}
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
