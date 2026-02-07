import React from "react";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * OTPInput
 *
 * Props:
 * - length = 6
 * - onComplete(code)
 * - isLoading
 * - error
 */
export default function OTPInput({
  length = 6,
  onComplete,
  isLoading = false,
  error,
}) {
  const [values, setValues] = useState(
    Array(length).fill("")
  );

  const inputsRef = useRef([]);

  // Autofocus first input
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...values];
    updated[index] = value;
    setValues(updated);

    // Move to next input
    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    // Completed OTP
    if (updated.every(Boolean)) {
      onComplete?.(updated.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!pasted) return;

    const updated = pasted
      .split("")
      .concat(Array(length).fill(""))
      .slice(0, length);

    setValues(updated);

    const lastIndex = updated.findIndex((v) => !v);
    const focusIndex =
      lastIndex === -1 ? length - 1 : lastIndex;

    inputsRef.current[focusIndex]?.focus();

    if (updated.every(Boolean)) {
      onComplete?.(updated.join(""));
    }
  };

  return (
    <div className="space-y-4">
      {/* OTP boxes */}
      <div
        className="flex justify-center gap-3"
        onPaste={handlePaste}
        role="group"
        aria-label="One-time password input"
      >
        {values.map((value, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value}
            disabled={isLoading}
            onChange={(e) =>
              handleChange(index, e.target.value)
            }
            onKeyDown={(e) =>
              handleKeyDown(index, e)
            }
            aria-label={`OTP digit ${index + 1}`}
            className={`
              h-12 w-12 rounded-lg border text-center text-lg font-semibold
              transition focus:outline-none
              ${
                error
                  ? "border-red-400 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }
              ${isLoading ? "bg-gray-100" : "bg-white"}
              focus:ring-2
            `}
          />
        ))}
      </div>

      {/* Helper / error */}
      <div className="min-h-[18px] text-center">
        {error ? (
          <p
            role="alert"
            className="text-sm text-red-600"
          >
            {error}
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Enter the 6-digit code sent to your email
          </p>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
}
