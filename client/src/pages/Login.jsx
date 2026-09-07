import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiArrowLeft } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import AuthFormInput from "../components/common/AuthFormInput";
import AuthPanel from "../components/common/AuthPanel";
import { useSignInMutation, useLazyGetProfileQuery } from "../store/api/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/slices/authSlice";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState("");
  const [signIn, { isLoading }] = useSignInMutation();
  const [triggerGetProfile] = useLazyGetProfileQuery();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      return setErrors("Email is required.");
    }

    if (!formData.password) {
      return setErrors("Password is required.");
    }

    try {
      const res = await signIn(formData).unwrap();

      toast.success(res.message || "Login Successful!", {
        duration: 3000,
        position: "top-center",
      });

      // Get profile to check role
      const profile = await triggerGetProfile().unwrap();
      const role = profile?.userData?.role;

      // Save credentials in Redux
      dispatch(setCredentials({ user: profile?.userData, token: null }));

      setTimeout(() => {
        if (role === "admin" || role === "host") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 1500);
    } catch (error) {
      console.log(error);
      const errorMsg = error?.data?.message || "Something went wrong. Please check your credentials.";
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
        eyebrow="Welcome back"
        title={"Your next\nplace is waiting"}
        blurb="Pick up where you left off - the homes you saved, the trips you booked and the leases you signed are all here."
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
            Sign in
          </h1>

          <p className="mt-3 text-[13.5px] text-espresso-soft/75">
            No account yet?{" "}
            <Link
              to="/register"
              className="font-medium text-espresso underline decoration-espresso-line underline-offset-4 transition-colors duration-300 hover:text-bronze hover:decoration-bronze"
            >
              Create one
            </Link>
          </p>

          {errors && (
            <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              {errors}
            </p>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleLogin}>
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
              placeholder="Enter your password"
              name="password"
              value={formData.password}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, password: e.target.value }));
                setErrors("");
              }}
            />

            <div className="flex items-center justify-between pt-1">
              <label htmlFor="remember" className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 cursor-pointer rounded border-espresso-line accent-espresso"
                />
                <span className="text-[12.5px] text-espresso-soft/75">Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-[12.5px] text-espresso-soft/75 transition-colors duration-300 hover:text-espresso"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-lg border-none bg-espresso px-6 py-4 text-[13px] font-medium text-linen transition-colors duration-300 hover:bg-espresso-soft disabled:cursor-not-allowed disabled:bg-espresso/40"
            >
              {isLoading ? "Signing in..." : "Sign in"}
              {!isLoading && (
                <FiArrowUpRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;
