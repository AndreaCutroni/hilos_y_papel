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
            {/* Keep the tagline separate from the two-line mark, with enough
                space below the founder's name and natural word spacing. */}
            <div className="inline-flex flex-col self-start text-paper">
              <BrandMark />
              {/* Full-strength sand. An opacity fade here drops the line to 3.7:1
                  on brick, under AA — subdue it with size, never with opacity. */}
              <p className="mt-5 font-sans text-[0.767em] leading-relaxed tracking-[0.12em] md:text-[0.910em]">
                {brand.tagline}
              </p>
            </div>

            <ul className="flex flex-col gap-1.5 text-label">
              {socials.map(({ key, name, short, href, Icon, external, label }) => (
                <li key={key}>
                  {/* Sand like the wordmark, warming to on-brick on hover, the
                      way the header's nav does. No underline: the colour is the
                      whole signal here. */}
                  <a
                    href={href}
                    aria-label={label}
                    {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    className="inline-flex items-center gap-2.5 text-paper transition-colors duration-200 hover:text-on-brick"
                  >
                    <Icon className="h-[1.3em] w-[1.3em] shrink-0" />
                    <span>{name}</span>
                    <span>{short}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 text-micro text-on-brick/70">
            © {new Date().getFullYear()} {brand.name}
          </p>
        </div>
      </div>
    </footer>
  )
}
