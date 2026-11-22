export default function StarIcon({
  className = "",
  filled = true,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <path d="M12 3.4 14.55 8.57 20.26 9.4 16.13 13.43 17.1 19.11 12 16.43 6.9 19.11 7.87 13.43 3.74 9.4 9.45 8.57 12 3.4Z" />
    </svg>
  );
}
