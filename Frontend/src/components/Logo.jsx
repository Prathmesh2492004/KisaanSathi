export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="logo">
      <circle cx="16" cy="16" r="16" fill="var(--green-700)" />
      <path
        d="M16 25V13m0 0c0-4 2.6-6.6 7-7-.2 4.6-2.8 7-7 7Zm0 4c0-3.4-2.3-5.7-6.2-6 .2 3.9 2.5 6 6.2 6Z"
        fill="none"
        stroke="var(--wheat)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
