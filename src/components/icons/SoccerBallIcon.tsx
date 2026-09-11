import type { SVGProps } from "react";

/** Lucide has no soccer ball glyph, so this is hand-drawn to match its stroke style. */
export function SoccerBallIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7 16.76 10.46 14.94 16.05 9.06 16.05 7.24 10.46Z" />
      <path d="M12 7 12 2M16.76 10.46 21.51 8.91M14.94 16.05 17.88 20.09M9.06 16.05 6.12 20.09M7.24 10.46 2.49 8.91" />
    </svg>
  );
}
