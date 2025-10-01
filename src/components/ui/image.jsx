import React from "react";

export const Image = ({ src, alt, className = "", ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-lg ${className}`}
      {...props}
    />
  );
};
