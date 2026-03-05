import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import bgImage from "../assets/registerLogin.jpg"

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-md">

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-indigo-950 mb-6">
          Login to UniSports
        </h2>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              SLIIT Email
            </label>
            <input
              type="email"
              placeholder="example@sliit.lk"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-950"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-950"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-indigo-950 text-white py-2 rounded-lg hover:bg-indigo-900 transition font-semibold"
          >
            Login
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm mt-4">
          Don’t have an account?{" "}
          <Link
            to="/auth/register"
            className="text-indigo-950 font-semibold hover:underline"
          >
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
}