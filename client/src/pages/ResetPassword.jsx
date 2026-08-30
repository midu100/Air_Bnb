import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import toast, { Toaster } from "react-hot-toast";
import AuthImageSlider from "../components/common/AuthImageSlider";
import ButtonTwo from "../components/common/ButtonTwo";
import { useResetPasswordMutation } from "../store/api/authApi";

const slides = [
  {
    image: "https://picsum.photos/800/1000?random=12",
    title: "Set A New\nPassword.",
    subtitle: "Enter the code we emailed you along with your new password.",
  }
];

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
      const errorMsg = error?.data?.message || error?.message || "Invalid or expired code.";
      setErrors(errorMsg);
      toast.error(errorMsg, {
        duration: 3000,
        position: "top-center",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[1060px] bg-white/60 backdrop-blur-2xl rounded-[32px] shadow-[0_30px_80px_-20px_rgba(100,60,180,0.15)] overflow-hidden flex flex-col md:flex-row border border-white/70">
        <Toaster />

        {/* Left */}
        <AuthImageSlider slides={slides} minHeight="620px" />

        {/* Right */}
        <div className="w-full md:w-[54%] p-8 sm:p-10 lg:px-14 lg:py-12 flex flex-col justify-center">
          <div className="max-w-[360px] mx-auto w-full">
            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-[33px] font-black text-gray-900 tracking-tight mb-2">
                Reset Password
              </h1>
              <p className="text-[14px] text-gray-400 font-medium leading-relaxed">
                Use at least 6 characters with a letter and a number.
              </p>
            </div>

            {errors && (
              <p className="mb-5 bg-amber-300 rounded-md py-2 text-center text-red-500 font-medium text-xs">
                {errors}
              </p>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={handleReset}>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors("");
                  }}
                  className="w-full bg-white/50 border border-gray-200 text-gray-800 text-sm font-semibold rounded-2xl px-5 py-4 focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 transition-all shadow-xs placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                  Reset Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter the code from your email"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setErrors("");
                  }}
                  className="w-full bg-white/50 border border-gray-200 text-gray-800 text-sm font-semibold rounded-2xl px-5 py-4 focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 transition-all shadow-xs placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrors("");
                  }}
                  className="w-full bg-white/50 border border-gray-200 text-gray-800 text-sm font-semibold rounded-2xl px-5 py-4 focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 transition-all shadow-xs placeholder:text-gray-300"
                />
              </div>

              <div className="pt-2">
                <ButtonTwo name={isLoading ? "Resetting..." : "Reset Password"} />
              </div>
            </form>

            <div className="mt-8 text-center text-xs text-gray-400">
              Back to{" "}
              <Link to="/login" className="font-semibold text-violet-600 hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
