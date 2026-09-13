import { brand } from '@/content/brand'
import { BrandMark } from '@/components/BrandMark'
import { socials } from '@/components/socials'

export function Footer() {
  return (
    <footer className="relative mt-16 bg-brick text-on-brick">
      {/* Split like the header: the column widens with the page on a wide
          screen, the bar inside it holds the reader's default size (.chrome). */}
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="chrome py-6 md:py-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="text-paper">
              {/* The same mark as the header, then the line of business under the
                  name — kept outside the mark so the photograph stays centred on
                  the two lines exactly as it is up top. Sized in em against the
                  lockup so it runs to the same measure as the name above it. */}
              <BrandMark />
              {/* The size sits on the paragraph, not on a span inside a 1.75em line:
                  a small span still inherits that line's height, which opened a tall
                  gap above the tagline. */}
              <div className="mt-1 pl-14 text-[1.45em] md:pl-16 md:text-[1.75em]">
                {/* Full-strength sand. An opacity fade here drops the line to 3.7:1
                    on brick, under AA — subdue it with size, never with opacity. */}
                <p className="font-sans leading-tight" style={{ fontSize: '0.505em' }}>
                  {brand.tagline}
                </p>
              </div>
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
                    <Icon className="h-[1.3em] w-[1.3em] shrink-0 opacity-80 transition-opacity duration-200 group-hover:opacity-100" />
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
      </div>
    </footer>
  )
}
