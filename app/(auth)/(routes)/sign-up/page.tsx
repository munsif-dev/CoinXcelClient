"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "@/store/auth/action"; // Adjust the path as needed
import { RootState, AppDispatch } from "@/store/store"; // Adjust the path as needed
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Import useRouter

const Register: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { loading, error, success } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter(); // Initialize the router

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fullname && formData.email && formData.password) {
      dispatch(register(formData)); // Dispatch the register action
    } else {
      alert("Please fill in all fields.");
    }
  };

  // Effect to navigate after successful registration
  useEffect(() => {
    if (success) {
      router.push("/sign-in"); // Navigate to the login page if registration is successful
    }
  }, [success, router]); // Trigger the effect when 'success' changes

  return (
    <div className="flex flex-col md:flex-row h-screen bg-green-50">
      {/* Left Section */}
      <div className="flex-1 bg-green-200 flex flex-col items-center justify-center p-4">
        <Image
          src="/heroimage.png" // Ensure this path is correct
          alt="Illustration"
          width={500}
          height={500}
          className="max-w-md"
        />
        <h2 className="text-2xl font-mono font-bold mt-2 text-black">
          CoinXcel Trading Simulator
        </h2>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex items-center justify-center p-10 bg-white h-full overflow-y-auto">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold text-center text-black mb-6">
            Register
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="fullname"
                className="block text-sm font-medium text-black"
              >
                Full Name
              </label>
              <input
                id="fullname"
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="mt-2 block w-full p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-black"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="mt-2 block w-full p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-black"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter a strong password"
                className="mt-2 block w-full p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Sign Up"}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-black">or</p>
            <button
              type="button"
              className="mt-4 p-3 border text-black border-gray-300 rounded-lg w-full flex items-center justify-center space-x-2"
            >
              <Image
                src="/GoogleIcon.png" // Replace with the correct path
                alt="Google Icon"
                width={20}
                height={20}
                className="mr-2"
              />
              <span>Sign Up with Google</span>
            </button>
          </div>

          <p className="text-sm text-center mt-4 text-black">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-green-500 hover:underline font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
