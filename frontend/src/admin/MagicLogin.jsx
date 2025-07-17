import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const MagicLogin = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    const verifyToken = async () => {
      try {
        const res = await axios.post(
          "http://localhost:4000/api/auth/magic-login",
          {
            token,
          }
        );

        // ✅ ONLY if response is valid, login user
        if (res.status === 200 && res.data.user && res.data.token) {
          setUser(res.data.user);
          setToken(res.data.token);
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          navigate("/host/dashboard");
        } else {
          throw new Error("Invalid response from server.");
        }
      } catch (err) {
        console.error("Magic login failed", err);

        const serverError =
          err.response?.data?.error || err.response?.data?.message;

        if (serverError?.includes("jwt expired")) {
          setError("⚠️ This magic link has already been used or has expired.");
        } else if (serverError) {
          setError(`⚠️ ${serverError}`);
        } else {
          setError("⚠️ Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError("⚠️ No token provided in the URL.");
      setLoading(false);
    }
  }, [navigate, setUser, setToken]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
      {loading ? (
        <p className="text-lg font-medium">Logging you in...</p>
      ) : error ? (
        <>
          <p className="text-red-600 text-lg font-semibold">{error}</p>
          <p className="text-sm mt-2 text-gray-600">
            Please request a new approval link from the Ghumakad team if needed.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            Go Back to Home
          </button>
        </>
      ) : null}
    </div>
  );
};

export default MagicLogin;
