import React from "react";

export function Button({ children, className = "", variant = "default", ...props }) {
  const base =
    "px-4 py-2 rounded-xl font-medium transition shadow-sm focus:outline-none focus:ring-2";
  const styles = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400",
    outline:
      "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-300",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
