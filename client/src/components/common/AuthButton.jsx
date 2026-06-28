import React from "react";

const AuthButton = ({
  text,
  onClick,
  type = "submit",
  icon,
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="
        relative group flex w-full items-center justify-center gap-3
        overflow-hidden rounded-2xl
        bg-gradient-to-r from-black via-red-500 to-black
        px-6 py-4 text-[13px] font-bold text-white
        shadow-[0_8px_30px_rgba(139,92,246,0.35)]
        transition-all duration-300
        hover:shadow-[0_12px_40px_rgba(139,92,246,0.5)]
        hover:scale-[1.01]
        active:scale-[0.98]
        disabled:opacity-70
        disabled:cursor-not-allowed
        border-0 outline-none cursor-pointer
      "
    >
      {/* Light Sweep Animation */}
      <div
        className="
          absolute inset-0 flex h-full w-full justify-center
          [transform:skew(-12deg)_translateX(-150%)]
          group-hover:duration-1000
          group-hover:[transform:skew(-12deg)_translateX(150%)]
        "
      >
        <div className="relative h-full w-10 bg-white/25" />
      </div>

      {/* Button Text */}
      <span className="relative z-10 tracking-widest uppercase">
        {text}
      </span>

      {/* Optional Icon */}
      {icon && (
        <span className="relative z-10">
          {icon}
        </span>
      )}
    </button>
  );
};

export default AuthButton;

