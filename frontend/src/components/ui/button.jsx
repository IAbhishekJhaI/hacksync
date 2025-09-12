import React from "react";

export function Button({ children, className = "", variant = "default", ...props }) {
  const base =
    "px-6 py-3 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 transform hover:scale-105 active:scale-95";
  
  const styles = {
    default: "bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 focus:ring-cyan-400/50",
    outline: "bg-gray-800 hover:bg-gray-700 text-cyan-400 border-2 border-cyan-500/50 hover:border-cyan-400 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/20 focus:ring-cyan-400/50",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}