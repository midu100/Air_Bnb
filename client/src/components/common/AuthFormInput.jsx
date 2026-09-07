import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

const AuthFormInput = ({
  label,
  type = "text",
  placeholder = "",
  name = "",
  value,
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-medium uppercase tracking-[0.16em] text-espresso-soft/60">
        {label}
      </label>

      <div className="relative">
        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full rounded-lg border border-espresso-line bg-white px-4 py-3.5 text-[14px] text-espresso outline-none transition-all duration-300 placeholder:text-espresso-soft/40 focus:border-espresso focus:ring-2 focus:ring-espresso/10 ${
            isPassword ? "pr-12" : ""
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer border-none bg-transparent p-0 text-espresso-soft/50 transition-colors hover:text-espresso"
          >
            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthFormInput;
