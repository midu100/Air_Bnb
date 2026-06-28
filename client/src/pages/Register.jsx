import React, { useState } from "react";
import { Link, useNavigate } from "react-router";

import toast, { Toaster } from "react-hot-toast";
import AuthImageSlider from "../components/common/AuthImageSlider";
import AuthFormInput from "../components/common/AuthFormInput";
import AuthButton from "../components/common/AuthButton";
import AuthSocialSection from "../components/common/AuthSocialSection";
import ButtonTwo from "../components/common/ButtonTwo";

const slides = [
  {
    image: "https://picsum.photos/800/1000?random=4",
    title: "Find Your\nPerfect Stay.",
    subtitle:
      "Discover unique homes and experiences around the world, tailored just for you.",
  },
  {
    image: "https://picsum.photos/800/1000?random=5",
    title: "Explore The\nWorld.",
    subtitle:
      "From cozy cabins to luxury villas — your next adventure starts here.",
  },
  {
    image: "https://picsum.photos/800/1000?random=6",
    title: "Travel With\nConfidence.",
    subtitle:
      "Trusted hosts, verified reviews, and seamless booking at your fingertips.",
  },
];

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    if (!formData.name) {
      return setErrors("Full name is required.");
    }

    if (!formData.email) {
      return setErrors("Email is required.");
    }

    if (!formData.password) {
      return setErrors("Password is required.");
    }

    if (formData.password.length < 8) {
      return setErrors("Password must be at least 8 characters.");
    }

    // Fake register success
    toast.success("Account created successfully!", {
      duration: 3000,
      position: "top-center",
    });

    console.log(formData);

    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[1060px] bg-white/60 backdrop-blur-2xl rounded-[32px] shadow-[0_30px_80px_-20px_rgba(100,60,180,0.15)] overflow-hidden flex flex-col md:flex-row border border-white/70">
        <Toaster />

        {/* Left */}
        <AuthImageSlider slides={slides} minHeight="680px" />

        {/* Right */}
        <div className="w-full md:w-[54%] p-8 sm:p-10 lg:px-14 lg:py-12 flex flex-col justify-center">
          {/* Mobile Header */}
          <div className="flex md:hidden justify-between items-center mb-8">
            <Link
              to="/"
              className="text-gray-900 text-lg font-black tracking-tight"
            >
              KAZI'S NATION
            </Link>

            <Link
              to="/"
              className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-900 transition-colors"
            >
              ← Back
            </Link>
          </div>

          <div className="max-w-[360px] mx-auto w-full">
            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-[33px] font-black text-gray-900 tracking-tight mb-2">
                Create Account
              </h1>

              <p className="text-[14px] text-gray-400 font-medium leading-relaxed">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-violet-600 hover:text-violet-700 font-semibold underline underline-offset-4 decoration-violet-300"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {errors && (
              <p className="mb-5 bg-amber-300 rounded-md py-2 text-center text-red-500 font-medium">
                {errors}
              </p>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={handleRegister}>
              <AuthFormInput
                label="Full Name"
                type="text"
                placeholder="John Doe"
                name="name"
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }));
                  setErrors("");
                }}
              />

              <AuthFormInput
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                name="email"
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }));
                  setErrors("");
                }}
              />

              <AuthFormInput
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                name="password"
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }));
                  setErrors("");
                }}
              />

              {/* Terms */}
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-violet-600"
                />

                <label
                  htmlFor="terms"
                  className="text-[12px] text-gray-400 font-medium cursor-pointer select-none leading-relaxed"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-violet-600 hover:text-violet-700 font-semibold"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-violet-600 hover:text-violet-700 font-semibold"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              <div className="pt-2">
                {/* <AuthButton text="Create Account" /> */}
                <ButtonTwo name={'Create Account'}/>
              </div>
            </form>

            <AuthSocialSection dividerText="Or sign up with" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
