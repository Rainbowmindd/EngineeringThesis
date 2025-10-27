import React, { useState } from "react";
import { register } from "../api/auth";
import { AxiosError } from "axios";

const Register = () => {
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
        const error = err as AxiosError<{ [key: string]: string[] }>;
      console.error("Registration failed:", error.response?.data || error.message);
      setMessage("Registration failed. Please try again.");
    }
  };
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
};

export default Register;
