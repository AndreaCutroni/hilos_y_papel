import { brand, contact } from '@/content/brand'
import { FounderName, Wordmark } from '@/components/Wordmark'
import { ThreadDivider } from '@/components/motifs/ThreadDivider'

export function Footer() {
  return (
    <footer className="paper-grain paper-grain-dark relative mt-16 bg-brick text-on-brick">
      <ThreadDivider color="var(--color-paper)" animate={false} className="opacity-70" />
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-h4 leading-none">
              <Wordmark />
            </p>
            <p className="mt-2 text-label text-on-brick/80">
              {brand.tagline} · <FounderName />
            </p>
          </div>

          <ul className="flex flex-col gap-2 text-label">
            <li>
              <FooterLink href={`mailto:${contact.email}`}>{contact.email}</FooterLink>
            </li>
            <li>
              <FooterLink href={contact.instagram.url}>
                Instagram · {contact.instagram.handle}
              </FooterLink>
            </li>
            <li>
              <FooterLink href={contact.facebook.url}>
                Facebook · {contact.facebook.handle}
              </FooterLink>
            </li>
          </ul>
        </div>

        <p className="mt-6 text-micro text-on-brick/70">
          © {new Date().getFullYear()} {brand.name}
        </p>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith('http')
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="decoration-paper underline-offset-4 transition-colors duration-200 hover:text-paper hover:underline"
    >
      {children}
    </a>
  )
}
