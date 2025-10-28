import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../../api/auth";

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
      navigate("/");
    } catch (err) {
      console.error(err);
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
        "Registration successful! Please check your email to verify your account."
      );
    } catch (err) {
      console.error(err);
      setError(
        "Registration failed. Please check your credentials and try again."
      );
    }
  };

  if (!isRegisterPage) {
    return (
      <div className="bg-sky-400">
        <h2>Login</h2>
        <form onSubmit={handleSubmitLogin}>
          <div>
            <label>Email:</label>

            <input
              type="email"
              value={emailLogin}
              onChange={(e) => setEmailLogin(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-2 border-amber-300 border-solid"
            />
          </div>
          {error && <p>{error}</p>}

          <button type="submit">Login</button>
        </form>
      </div>
    );
  } else {
    return (
      <div className="p-4 max-w-sm mx-auto">
        <h2 className="text-xl font-bold mb-4">Register</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password1}
            onChange={(event) => setPassword1(event.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={password2}
            onChange={(event) => setPassword2(event.target.value)}
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Register
          </button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    );
  }
}
