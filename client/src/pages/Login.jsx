import React, { useState } from "react";
import { Link, useNavigate } from "react-router";

import toast, { Toaster } from "react-hot-toast";
import AuthImageSlider from "../components/common/AuthImageSlider";
import AuthFormInput from "../components/common/AuthFormInput";
import AuthButton from "../components/common/AuthButton";
import AuthSocialSection from "../components/common/AuthSocialSection";
import ButtonOne from "../components/common/ButtonOne";
import ButtonTwo from "../components/common/ButtonTwo";

const slides = [
  {
    image: "https://picsum.photos/800/1000?random=1",
    title: "Elevate Your\nWardrobe Today.",
    subtitle:
      "Experience the pinnacle of fashion with tailored recommendations and exclusive collections.",
  },
  {
    image: "https://picsum.photos/800/1000?random=2",
    title: "Discover New\nCollections.",
    subtitle:
      "Explore curated styles handpicked by our fashion experts for every season.",
  },
  {
    image: "https://picsum.photos/800/1000?random=3",
    title: "Style Meets\nComfort.",
    subtitle:
      "Premium quality meets everyday comfort. Dress to impress, effortlessly.",
  },
];
const SignIn = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!formData.email) {
      return setErrors("Email is required.");
    }

    if (!formData.password) {
      return setErrors("Password is required.");
    }

    // Fake login success
    toast.success("Login Successful!", {
      duration: 3000,
      position: "top-center",
    });

    console.log(formData);

    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[1060px] bg-white/60 backdrop-blur-2xl rounded-[32px] shadow-[0_30px_80px_-20px_rgba(100,60,180,0.15)] overflow-hidden flex flex-col md:flex-row border border-white/70">
        <Toaster />

        {/* Left */}
        <AuthImageSlider slides={slides} minHeight="620px" />

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
                Welcome Back
              </h1>

              <p className="text-[14px] text-gray-400 font-medium leading-relaxed">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-violet-600 hover:text-violet-700 font-semibold underline underline-offset-4 decoration-violet-300"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {errors && (
              <p className="mb-5 bg-amber-300 rounded-md py-2 text-center text-red-500 font-medium">
                {errors}
              </p>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={handleLogin}>
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
                placeholder="Enter your password"
                name="password"
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }));
                  setErrors("");
                }}
              />

              {/* Remember */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded border-gray-300 accent-violet-600"
                  />

                  <label
                    htmlFor="remember"
                    className="text-[12px] text-gray-400 font-medium cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-[12px] font-semibold text-violet-600 hover:text-violet-700"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="pt-2">
                {/* <AuthButton text="Sign In" /> */}
                <ButtonTwo name={'Login'}/>
              </div>
            </form>

            <AuthSocialSection dividerText="Or continue with" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;