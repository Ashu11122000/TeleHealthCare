import React from "react";
import { useMemo } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

/**
 * PasswordStrength
 *
 * Design principles (healthcare UX):
 * - Inform, never scare
 * - Guide, never block
 * - Visible security, calm language
 */
export default function PasswordStrength({ password = "" }) {
  const analysis = useMemo(() => {
    if (!password) return null;

    const rules = {
      length8: password.length >= 8,
      length12: password.length >= 12,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    };

    const score = Object.values(rules).filter(Boolean).length;

    if (score <= 2) {
      return {
        level: "Weak",
        color: "red",
        percent: 30,
        message:
          "This password is easy to guess. Adding more length and variety will improve security.",
        rules,
      };
    }

    if (score <= 4) {
      return {
        level: "Moderate",
        color: "yellow",
        percent: 65,
        message:
          "This password is acceptable. A bit more complexity will make it stronger.",
        rules,
      };
    }

    return {
      level: "Strong",
      color: "green",
      percent: 100,
      message:
        "Strong password. Your account will be well protected.",
      rules,
    };
  }, [password]);

  if (!analysis) return null;

  const colorMap = {
    red: {
      text: "text-red-600",
      bar: "bg-red-500",
      ring: "focus:ring-red-500",
    },
    yellow: {
      text: "text-yellow-600",
      bar: "bg-yellow-500",
      ring: "focus:ring-yellow-500",
    },
    green: {
      text: "text-green-600",
      bar: "bg-green-500",
      ring: "focus:ring-green-500",
    },
  };

  const c = colorMap[analysis.color];

  return (
    <div
      className="space-y-3"
      role="status"
      aria-live="polite"
      aria-label="Password strength indicator"
    >
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">
          Password strength
        </span>
        <span className={`font-medium ${c.text}`}>
          {analysis.level}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full ${c.bar} transition-all duration-500 ease-out`}
          style={{ width: `${analysis.percent}%` }}
        />
      </div>

      {/* Message */}
      <p className="text-xs text-gray-600">
        {analysis.message}
      </p>

      {/* Rule checklist */}
      <ul className="grid grid-cols-2 gap-2 text-xs">
        <RuleItem
          ok={analysis.rules.length8}
          label="At least 8 characters"
        />
        <RuleItem
          ok={analysis.rules.upper}
          label="Uppercase letter"
        />
        <RuleItem
          ok={analysis.rules.lower}
          label="Lowercase letter"
        />
        <RuleItem
          ok={analysis.rules.number}
          label="Number"
        />
        <RuleItem
          ok={analysis.rules.symbol}
          label="Symbol"
        />
        <RuleItem
          ok={analysis.rules.length12}
          label="12+ characters"
          optional
        />
      </ul>
    </div>
  );
}

/**
 * RuleItem – small, calm, non-judgmental feedback
 */
function RuleItem({ ok, label, optional }) {
  return (
    <li className="flex items-center gap-1.5 text-gray-600">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-gray-400" />
      )}
      <span>
        {label}
        {optional && (
          <span className="text-gray-400"> (optional)</span>
        )}
      </span>
    </li>
  );
}
