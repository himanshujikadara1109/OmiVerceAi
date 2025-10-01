import React from "react";

export const Button = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
