"use client";

import React from "react";

interface CartoonButtonProps {
  label: React.ReactNode;
  color?: string;
  hasHighlight?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  className?: string; // Adding className to allow extra styling
  href?: string;
  target?: string;
}

export function CartoonButton({
  label,
  color = 'bg-orange-400',
  hasHighlight = true,
  disabled = false,
  onClick,
  className = "",
  href,
  target,
}: CartoonButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const baseClasses = `relative w-full flex items-center justify-center h-12 px-6 text-lg md:text-xl rounded-full font-bold border-2 border-neutral-800 transition-all duration-150 overflow-hidden group
        ${color} hover:shadow-[0_4px_0_0_#262626]
        ${disabled ? 'opacity-50 pointer-events-none' : 'hover:-translate-y-1 active:translate-y-0 active:shadow-none'}`;

  const innerContent = (
    <>
      <span className="relative z-10 whitespace-nowrap flex items-center gap-2">{label}</span>
      {hasHighlight && !disabled && (
        <div className="absolute top-1/2 left-[-100%] w-16 h-24 bg-white/50 -translate-y-1/2 rotate-12 transition-all duration-500 ease-in-out group-hover:left-[200%]"></div>
      )}
    </>
  );

  return (
    <div
      className={`inline-block ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {href ? (
        <a href={href} target={target} rel={target === '_blank' ? "noopener noreferrer" : undefined} className={baseClasses}>
          {innerContent}
        </a>
      ) : (
        <button
          disabled={disabled}
          onClick={handleClick}
          className={baseClasses}
        >
          {innerContent}
        </button>
      )}
    </div>
  );
}
