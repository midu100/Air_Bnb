import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiArrowLeft } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import AuthFormInput from "../components/common/AuthFormInput";
import AuthPanel from "../components/common/AuthPanel";
import { useSignUpMutation } from "../store/api/authApi";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState("");
  const [signUp, { isLoading }] = useSignUpMutation();

  const handleRegister = async (e) => {
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

    if (formData.password.length < 6) {
      return setErrors("Password must be at least 6 characters.");
    }

    try {
      const signupData = {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        role: "guest", // Default role matching user model default
      };

      const res = await signUp(signupData).unwrap();
      toast.success(res.message || "Registration successful! OTP sent to your email.", {
        duration: 4000,
        position: "top-center",
      });

      setTimeout(() => {
        navigate("/verify-otp", { state: { email: formData.email } });
      }, 2000);
    } catch (error) {
      console.log(error);
      const errorMsg = error?.data?.message || "Registration failed. Please check your inputs.";
      setErrors(errorMsg);
      toast.error(errorMsg, {
        duration: 3000,
        position: "top-center",
      });
    }
  };

  return (
    <div className="grid min-h-screen bg-linen lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Toaster />

      {/* ====== A home, so the page looks like the platform it belongs to ====== */}
      <AuthPanel
        eyebrow="Create an account"
        title={"Somewhere to stay,\nfor as long as you need"}
        blurb="One account covers all three: a few nights away, a furnished month between contracts, or a home on a proper lease."
      />

      {/* ====== The form ====== */}
      <div className="flex items-center justify-center px-6 py-24 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          <Link
            to="/"
            className="mb-10 inline-flex items-center gap-2 text-[12px] text-espresso-soft/60 transition-colors duration-300 hover:text-espresso lg:hidden"
          >
            <FiArrowLeft size={13} />
            Back to the site
          </Link>

          <h1 className="font-sans text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] text-espresso sm:text-[40px]">
            Create account
          </h1>

          <p className="mt-3 text-[13.5px] text-espresso-soft/75">
            Already have one?{" "}
            <Link
              to="/login"
              className="font-medium text-espresso underline decoration-espresso-line underline-offset-4 transition-colors duration-300 hover:text-bronze hover:decoration-bronze"
            >
              Sign in
            </Link>
          </p>

          {errors && (
            <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              {errors}
            </p>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleRegister}>
            <AuthFormInput
              label="Full name"
              type="text"
              placeholder="Your name"
              name="name"
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                setErrors("");
              }}
            />

            <AuthFormInput
              label="Email address"
              type="email"
              placeholder="you@example.com"
              name="email"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                setErrors("");
              }}
            />

            <AuthFormInput
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              name="password"
              value={formData.password}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, password: e.target.value }));
                setErrors("");
              }}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-lg border-none bg-espresso px-6 py-4 text-[13px] font-medium text-linen transition-colors duration-300 hover:bg-espresso-soft disabled:cursor-not-allowed disabled:bg-espresso/40"
            >
              {isLoading ? "Creating account..." : "Create account"}
              {!isLoading && (
                <FiArrowUpRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              )}
            </button>

            <p className="pt-1 text-[11.5px] leading-relaxed text-espresso-soft/55">
              We will email you a one-time code to confirm the address before the account is active.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
