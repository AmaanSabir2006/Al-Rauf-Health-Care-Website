import React from "react";

interface WhatsAppAvatarProps {
  className?: string;
}

/**
 * Authentic WhatsApp default profile icon (person without DP)
 * Background: #DFE5E7
 * Foreground silhouette: #FFFFFF
 */
export default function WhatsAppAvatar({ className = "w-full h-full" }: WhatsAppAvatarProps) {
  return (
    <svg
      viewBox="0 0 212 212"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Default doctor profile avatar"
    >
      <rect width="212" height="212" fill="#DFE5E7" />
      <g fill="#FFFFFF">
        <circle cx="106" cy="80" r="34" />
        <path d="M106 128C76 128 42 142 36 172C48 190 76 204 106 204C136 204 164 190 176 172C170 142 136 128 106 128Z" />
      </g>
    </svg>
  );
}
