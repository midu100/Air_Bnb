import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiArrowLeft } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import AuthFormInput from "../components/common/AuthFormInput";
import AuthPanel from "../components/common/AuthPanel";
import { useResetPasswordMutation } from "../store/api/authApi";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultEmail = location.state?.email || "";

  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState("");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email) {
      return setErrors("Email is required.");
    }
    if (!otp) {
      return setErrors("Reset code is required.");
    }
    if (!newPassword) {
      return setErrors("New password is required.");
    }

    try {
      const res = await resetPassword({ email, otp, newPassword }).unwrap();
      toast.success(res.message || "Password reset successfully.", {
        duration: 3000,
        position: "top-center",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.log(error);
      const errorMsg = error?.data?.message || error?.message || "Invalid or expired code.";
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

      <AuthPanel
        eyebrow="Almost there"
        title={"Set a new\npassword"}
        blurb="Use the code we just emailed you. If it has expired, ask for another from the previous step."
      />

      <div className="flex items-center justify-center px-6 py-24 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          <Link
            to="/forgot-password"
            className="mb-10 inline-flex items-center gap-2 text-[12px] text-espresso-soft/60 transition-colors duration-300 hover:text-espresso"
          >
            <FiArrowLeft size={13} />
            Ask for another code
          </Link>

          <h1 className="font-sans text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] text-espresso sm:text-[40px]">
            New password
          </h1>

          <p className="mt-3 text-[13.5px] text-espresso-soft/75">
            Enter the code and the password you want to use from now on.
          </p>

          {errors && (
            <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              {errors}
            </p>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleReset}>
            <AuthFormInput
              label="Email address"
              type="email"
              placeholder="you@example.com"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors("");
              }}
            />

            <AuthFormInput
              label="Reset code"
              type="text"
              placeholder="The code from your email"
              name="otp"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setErrors("");
              }}
            />

            <AuthFormInput
              label="New password"
              type="password"
              placeholder="At least 6 characters"
              name="newPassword"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setErrors("");
              }}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-lg border-none bg-espresso px-6 py-4 text-[13px] font-medium text-linen transition-colors duration-300 hover:bg-espresso-soft disabled:cursor-not-allowed disabled:bg-espresso/40"
            >
              {isLoading ? "Saving..." : "Save new password"}
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

export default ResetPassword;
