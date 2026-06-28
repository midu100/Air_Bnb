import React from "react";

const SocialButton = ({
  provider,
  icon,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex w-full items-center justify-center gap-3
        rounded-2xl
        border border-gray-200/80
        bg-white/70 backdrop-blur-sm
        px-6 py-3.5
        text-[13px] font-semibold text-gray-700
        transition-all
        hover:bg-white
        hover:border-gray-300
        hover:shadow-md
        active:scale-[0.98]
        outline-none
        cursor-pointer
      "
    >
      {icon}
      <span>{provider}</span>
    </button>
  );
};

export default SocialButton;

