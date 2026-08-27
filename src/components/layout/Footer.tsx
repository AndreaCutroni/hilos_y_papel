import { brand } from '@/content/brand'
import { BrandLockup } from '@/components/Wordmark'
import { socials } from '@/components/socials'
import marchio from '@/assets/images/marchio-mano.webp'

export function Footer() {
  return (
    <footer className="relative mt-16 bg-brick text-on-brick">
      <div className="mx-auto max-w-6xl px-6 py-6 md:px-8 md:py-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          {/* the same round mark the header carries */}
          <div className="flex items-center gap-3">
            <img
              src={marchio}
              width={240}
              height={240}
              alt=""
              aria-hidden="true"
              className="h-13 w-13 shrink-0 rounded-full object-cover ring-1 ring-paper/35"
            />
            <BrandLockup tagline className="text-[1.5rem] text-paper" />
          </div>

          <ul className="flex flex-col gap-1.5 text-label">
            {socials.map(({ key, name, short, href, Icon, external, label }) => (
              <li key={key}>
                <a
                  href={href}
                  aria-label={label}
                  {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="group inline-flex items-center gap-2.5 underline-offset-4 transition-colors duration-200 hover:text-paper hover:underline"
                >
                  <Icon className="h-[17px] w-[17px] shrink-0 opacity-80 transition-opacity duration-200 group-hover:opacity-100" />
                  <span>{name}</span>
                  <span>{short}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-micro text-on-brick/70">
          © {new Date().getFullYear()} {brand.name}
        </p>
      </div>
    </footer>
  )
}
