import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}