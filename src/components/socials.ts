import { contact } from '@/content/brand'
import { FacebookIcon, InstagramIcon, MailIcon } from './SocialLinks'

/** The three places to reach Chiara, paired with their marks. Kept out of
 *  `SocialLinks.tsx` so that file exports only components and fast refresh
 *  keeps working. */
export const socials = [
  {
    key: 'mail',
    label: 'Scrivi a ' + contact.email,
    short: contact.email,
    href: `mailto:${contact.email}`,
    Icon: MailIcon,
    external: false,
  },
  {
    key: 'instagram',
    label: 'Instagram: ' + contact.instagram.handle,
    short: contact.instagram.handle,
    href: contact.instagram.url,
    Icon: InstagramIcon,
    external: true,
  },
  {
    key: 'facebook',
    label: 'Facebook: ' + contact.facebook.handle,
    short: contact.facebook.handle,
    href: contact.facebook.url,
    Icon: FacebookIcon,
    external: true,
  },
] as const
