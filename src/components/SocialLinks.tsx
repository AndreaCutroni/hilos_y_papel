import { socials } from './socials'

/**
 * Email, Instagram and Facebook as hand-written inline SVG — the project keeps
 * no icon package, so these are drawn to a common 24-unit box and inherit
 * `currentColor`.
 */

type IconProps = { className?: string }

export function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect
        x="2.75"
        y="5"
        width="18.5"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3.5 7.2l7.53 5.1a1.75 1.75 0 0 0 1.94 0l7.53-5.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" />
    </svg>
  )
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M15.2 8.2h-1.6c-.9 0-1.4.5-1.4 1.4V11h2.8l-.4 2.7h-2.4V21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.6 11h2.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** Icon-only row, for the header. */
export function SocialIcons({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-1 ${className}`}>
      {socials.map(({ key, label, href, Icon, external }) => (
        <li key={key}>
          <a
            href={href}
            aria-label={label}
            title={label}
            {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
            className="flex h-9 w-9 items-center justify-center rounded-sm text-paper transition-colors duration-200 hover:text-on-brick"
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        </li>
      ))}
    </ul>
  )
}
