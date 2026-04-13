import { InputHTMLAttributes, forwardRef } from "react";

interface ZenInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const ZenInput = forwardRef<HTMLInputElement, ZenInputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-earth-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-3 bg-sand-50 border rounded-xl
            text-earth-900 placeholder:text-earth-400
            focus:outline-none focus:ring-2 focus:ring-sage-400/30 focus:border-sage-400
            transition-all duration-200
            disabled:bg-sand-200 disabled:text-earth-500
            ${error ? "border-red-300 focus:ring-red-300/30 focus:border-red-400" : "border-sand-300"}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600/80">{error}</p>}
      </div>
    );
  }
);

ZenInput.displayName = "ZenInput";
export default ZenInput;
