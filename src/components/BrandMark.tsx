import { BrandLockup } from './Wordmark'
import marchio from '@/assets/images/marchio-mano.webp'

/**
 * The round photograph of the work in progress beside the two-line lockup —
 * the brochure cover's arrangement. Shared by the header and the footer so the
 * two cannot drift apart: change it here and both follow.
 *
 * The image is centred on the two lines of type. Anything that belongs under
 * the mark (the footer's line of business) goes outside this component, or it
 * would pull the photograph off that centre.
 */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <img
        src={marchio}
        width={240}
        height={240}
        alt=""
        aria-hidden="true"
        className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-paper/35 md:h-13 md:w-13"
      />
      {/* em, not rem: the mark only ever sits inside `.chrome`, which holds it at
          the reader's default size at every width. A rem here would grow with
          the page and make the bars taller on a wide screen. */}
      <BrandLockup className="text-[1.45em] md:text-[1.75em]" />
    </span>
  )
}
