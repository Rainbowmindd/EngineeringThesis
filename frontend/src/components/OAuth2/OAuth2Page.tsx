import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token"); // backend powinien wysłać token jako query param

    if (token) {
      localStorage.setItem("authToken", token);

      axios.get("http://localhost:8000/api/users/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        const role = res.data.role;
        if (role === "lecturer") navigate("/lecturer-dashboard");
        else if (role === "student") navigate("/student-dashboard");
        else navigate("/");
      })
      .catch(() => navigate("/login"));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <p>Logowanie przez Google…</p>;
}
