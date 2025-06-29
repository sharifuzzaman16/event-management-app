import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    photoURL: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await axios.post(
      "https://event-management-app-production-f733.up.railway.app/api/auth/register",
      form
    );

    console.log("Full response from backend:", res.data);

    const token = res.data.token;
    const user = res.data.user;

    if (user && token) {
      login(user, token);
      navigate("/events");
    } else {
      throw new Error("User or token missing in response");
    }
  } catch (err) {
    console.error("Registration error:", err);
    setError(err.response?.data?.message || err.message || "Registration failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Register</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {loading && <Loader />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full px-4 py-2 border rounded"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded"
          value={form.password}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="photoURL"
          placeholder="Photo URL"
          className="w-full px-4 py-2 border rounded"
          value={form.photoURL}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
