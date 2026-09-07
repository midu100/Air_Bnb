import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiArrowLeft } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import AuthFormInput from "../components/common/AuthFormInput";
import AuthPanel from "../components/common/AuthPanel";
import { useForgotPasswordMutation } from "../store/api/authApi";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState("");

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSend = async (e) => {
    e.preventDefault();

    if (!email) {
      return setErrors("Email is required.");
    }

    try {
      const res = await forgotPassword({ email }).unwrap();
      toast.success(res.message || "Reset code sent to your email.", {
        duration: 3000,
        position: "top-center",
      });

      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 1500);
    } catch (error) {
      console.log(error);
      const errorMsg = error?.data?.message || error?.message || "Something went wrong.";
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
        eyebrow="Password reset"
        title={"Locked out of\nyour account"}
        blurb="We will email a one-time code to the address on the account. It is good for a short while, so use it soon after it arrives."
      />

      <div className="flex items-center justify-center px-6 py-24 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          <Link
            to="/login"
            className="mb-10 inline-flex items-center gap-2 text-[12px] text-espresso-soft/60 transition-colors duration-300 hover:text-espresso"
          >
            <FiArrowLeft size={13} />
            Back to sign in
          </Link>

          <h1 className="font-sans text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] text-espresso sm:text-[40px]">
            Reset password
          </h1>

          <p className="mt-3 text-[13.5px] text-espresso-soft/75">
            Tell us the address you signed up with.
          </p>

          {errors && (
            <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              {errors}
            </p>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSend}>
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

            <button
              type="submit"
              disabled={isLoading}
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-lg border-none bg-espresso px-6 py-4 text-[13px] font-medium text-linen transition-colors duration-300 hover:bg-espresso-soft disabled:cursor-not-allowed disabled:bg-espresso/40"
            >
              {isLoading ? "Sending code..." : "Send reset code"}
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

export default ForgotPassword;
