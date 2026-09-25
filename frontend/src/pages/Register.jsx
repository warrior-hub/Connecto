import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { setCredentials } from "../redux/authSlice";
import { registerUser } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await registerUser(formData);

      dispatch(
        setCredentials({
          token: data.token,
          user: data.user,
        })
      );

      navigate("/chat");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b141a] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💬</div>

          <h1 className="text-3xl font-bold text-white">
            Connecto
          </h1>

          <p className="text-gray-400 mt-2">
            Create your account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#111b21] border border-gray-800 rounded-2xl p-6 shadow-2xl"
        >
          <h2 className="text-xl font-semibold text-white mb-6">
            Join Connecto
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="text-gray-300 text-sm block mb-2">
              Full Name
            </label>

            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Prince Yadav"
              className="input"
              required
            />
          </div>

          <div className="mb-4">
            <label className="text-gray-300 text-sm block mb-2">
              Username
            </label>

            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="prince"
              className="input"
              required
            />
          </div>

          <div className="mb-4">
            <label className="text-gray-300 text-sm block mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="input"
              required
            />
          </div>

          <div className="mb-4">
            <label className="text-gray-300 text-sm block mb-2">
              Phone
            </label>

            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="9876543210"
              className="input"
            />
          </div>

          <div className="mb-6">
            <label className="text-gray-300 text-sm block mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="input"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-black font-semibold py-3 rounded-lg transition"
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-400 hover:text-green-300"
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}