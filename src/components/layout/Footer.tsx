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
            {/* The same mark as the header, then the line of business under it —
                kept outside the mark so the photograph stays centred on the two
                lines exactly as it is up top. The column hugs the mark, so the
                line can run the mark's whole measure, from the photograph's left
                edge to the end of the wordmark: it is sized just under that
                width (in em, tuned to this string in Nunito) and justified, so
                it lands flush however wide Amiri sets the wordmark on the
                reader's machine. Re-measure if either string changes. */}
            {/* self-start, or the column stretches to the footer's width on a
                phone and the line would run past the wordmark. */}
            <div className="inline-flex flex-col self-start text-paper">
              <BrandMark />
              {/* Full-strength sand. An opacity fade here drops the line to 3.7:1
                  on brick, under AA — subdue it with size, never with opacity. */}
              {/* Small and tracked out, like a stamped line, rather than large:
                  the letter-spacing carries it across the measure, and the sizes
                  are picked so one tracking value fills it at both widths. The
                  trailing letter-space is dropped at the end of a justified
                  line, so the last letter lands on the wordmark's edge with no
                  compensation — measured, not assumed. */}
              <p className="mt-1.5 w-full text-justify font-sans text-[0.767em] leading-tight tracking-[0.19em] [text-align-last:justify] md:text-[0.910em]">
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

          <p className="mt-4 text-micro text-on-brick/70">
            © {new Date().getFullYear()} {brand.name}
          </p>
        </div>
      </div>
    </footer>
  )
}
