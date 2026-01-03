import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = "", ...props }: InputProps) {
  const inputClasses = `
    w-full px-4 py-2 border rounded-lg transition-colors
    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error ? "border-error focus:ring-error" : "border-gray-300"}
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <input className={inputClasses} {...props} />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}
