import { useEffect, useState } from "react";
import api from "../api/axios";

export default function TestConnection() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get("/admin/")
      .then(() => setMessage("Connection successful!"))
      .catch(() => setMessage("Connection failed."));
  }, []);

  return (
    <div className="p-6 test-center">
      <h1 className="text-2xl font-bold mb-4">Test Backend Connection</h1>
      <p>{message}</p>
    </div>
  );
}
