import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import bgImage from "../assets/registerLogin.jpg"

function Login() {
  const navigate = useNavigate()
  const { login, role } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const validateEmail = (value: string) => value.endsWith("@my.sliit.lk")

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (!validateEmail(email)) {
      setError("Please use your SLIIT email (@my.sliit.lk)")
      return
    }

    if (!password.trim()) {
      setError("Password is required")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      if (result.role === "admin") {
        navigate("/AdminDashboard")
      } 
      else if (result.role === "coach") {
        navigate("/CoachDashboard")
      } 
      else if (result.role === "student") {
        navigate("/StudentDashboard")
      }
    } else {
      setError(result.error ?? "Login failed")
      setLoading(false)
    }
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

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-2 text-sm text-red-600">
            {error}
          </div>
        )}

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-indigo-950 text-white py-2 rounded-lg hover:bg-indigo-900 transition font-semibold disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <Link
            to="/auth/register"
            className="text-indigo-950 font-semibold hover:underline"
          >
            Register here
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login
