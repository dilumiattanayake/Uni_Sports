import { useState } from "react"
import { Link  } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import bgImage from "../assets/registerLogin.jpg"



function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    sport: "",
    password: "",
    confirmPassword: ""
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateEmail = (email) => {
    return email.endsWith("@my.sliit.lk")
  }

  const handleSubmit = async(e) => {
    e.preventDefault()
    setError("");
    setSuccess("");

   
    if (!validateEmail(formData.email)) {
      setError("Please use your SLIIT email (@my.sliit.lk)")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (role === "coach" && formData.sport.trim() === "") {
      setError("Sport field is required for coaches")
      return
    }

    console.log("Register Data:", { role, ...formData })

    setSuccess("Registration successful !")

    const payload = {
              
    name: formData.name,
    email: formData.email, 
    password: formData.password,
    role,
    specialization: role === "coach" ? formData.sport : undefined,
  };

  try {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess("Registration successful!");
      
    } else {
      setError(data.error || "Registration failed");
    }
  } catch (error) {
    setError("Server error");
  }

    setTimeout(() => {
    navigate("/auth/login")
  }, 1000)
    
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-950">
          Create Your Account
        </h2>

        {/* Role Toggle Buttons */}
        <div className="flex mb-6 bg-gray-100 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`w-1/2 py-2 font-medium transition ${
              role === "student"
                ? "bg-indigo-950 text-white"
                : "text-gray-600"
            }`}
          >
            I am a Student
          </button>

          <button
            type="button"
            onClick={() => setRole("coach")}
            className={`w-1/2 py-2 font-medium transition ${
              role === "coach"
                ? "bg-indigo-950 text-white"
                : "text-gray-600"
            }`}
          >
            I am a Coach
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-600 p-2 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">

          {/* Name */}
          <label className="block text-sm font-medium mb-1">
              Name 
            </label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-950"
          />

          {/* Email */}
          <label className="block text-sm font-medium mb-1">
              SLIIT Email
            </label>
          <input
            type="email"
            name="email"
            placeholder="Enter your SLIIT Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-950"
          />

          {/* Sport (Only for Coach) */}
          {role === "coach" && (
          <label className="block text-sm font-medium mb-1">
              Sport
            </label>
          )}
          {role === "coach" && (
            
            <input
              type="text"
              name="sport"
              placeholder="Sport (e.g., Cricket, Football)"
              value={formData.sport}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-950"
            />
          )}

          {/* Password */}
          <label className="block text-sm font-medium mb-1">
              Password
            </label>
          <input
            type="password"
            name="password"
            placeholder="Enter your assword"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-950"
          />

          {/* Confirm Password */}
          <label className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-950"
          /><br></br>
          

          <button
            type="submit"
            className="w-full bg-indigo-950 text-white py-2 rounded-lg hover:bg-indigo-900 transition font-semibold"
          >
            Register
          </button>
        </form>

        {/* Login Link */}
       
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-indigo-900 font-medium hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register