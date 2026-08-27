import { brand } from '@/content/brand'
import { FounderName, Wordmark } from '@/components/Wordmark'
import { socials } from '@/components/socials'

export function Footer() {
  return (
    <footer className="relative mt-16 bg-brick text-on-brick">
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-h4 leading-none text-paper">
              <Wordmark />
            </p>
            <p className="mt-2 text-label text-on-brick/80">
              {brand.tagline} · <FounderName />
            </p>
          </div>

          <ul className="flex flex-col gap-2 text-label">
            {socials.map(({ key, short, href, Icon, external, label }) => (
              <li key={key}>
                <a
                  href={href}
                  aria-label={label}
                  {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="group inline-flex items-center gap-2.5 underline-offset-4 transition-colors duration-200 hover:text-paper hover:underline"
                >
                  <Icon className="h-[17px] w-[17px] shrink-0 opacity-80 transition-opacity duration-200 group-hover:opacity-100" />
                  {short}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-micro text-on-brick/70">
          © {new Date().getFullYear()} {brand.name}
        </p>
      </div>
    </footer>
  )
}
