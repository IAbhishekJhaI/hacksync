import React from "react";

export function Tag({ children, className = "" }) {
  return (
    <span
      className={`inline-block bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full mr-2 mb-2 ${className}`}
    >
      {children}
    </span>
  );
}
