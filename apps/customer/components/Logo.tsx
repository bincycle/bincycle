import Link from "next/link";

interface LogoProps {
  inverse?: boolean;
  className?: string;
}

export const Logo = ({ inverse = false, className = "" }: LogoProps) => {
  const fg = inverse ? "#F7F5F0" : "#121710";
  const accent = "#C45B38";

  return (
    <Link
      href="/"
      data-testid="brand-logo-link"
      className={`flex items-center gap-2 group ${className}`}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform group-hover:rotate-[18deg]"
      >
        <path
          d="M16 3.5 26 10v12L16 28.5 6 22V10L16 3.5Z"
          stroke={fg}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M11 14.5c1.5-2.5 4-3.5 6-2 2 1.5 2 4.5 0 6-1.5 1-3.5.8-5 0"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="11" cy="18.5" r="1.6" fill={accent} />
      </svg>
      <span
        className="font-display font-black text-xl tracking-tighter"
        style={{ color: fg }}
      >
        bincycle
        <span style={{ color: accent }}>.</span>
      </span>
    </Link>
  );
};

export default Logo;
