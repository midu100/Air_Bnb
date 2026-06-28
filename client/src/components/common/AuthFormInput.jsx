
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AuthFormInput = ({
  label,
  type = "text",
  placeholder = "",
  name = "",
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className="space-y-1.5">
      <label className="text-[14px] font-bold text-gray-800 uppercase tracking-widest pl-0.5">
        {label}
      </label>

      <div className="relative">
        <input
          type={
            isPassword
              ? showPassword
                ? "text"
                : "password"
              : type
          }
          name={name}
          placeholder={placeholder}
          onChange={onChange}
          className={`w-full border border-gray-500 bg-white/50 backdrop-blur-sm rounded-xl px-5 py-3.5 text-[14px] outline-none focus:border-violet-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all font-medium placeholder:text-gray-500 text-gray-800 ${
            isPassword ? "pr-12" : ""
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
          >
            {showPassword ? (
              <FaEyeSlash size={17} />
            ) : (
              <FaEye size={17} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthFormInput;

