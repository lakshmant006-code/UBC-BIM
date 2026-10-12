import { Contact } from '../../ui_kits/website/Contact.jsx';
import { pageMeta } from '../../ui_kits/website/site.js';

export const metadata = pageMeta({
  title: 'Contact UBC BIM | Start Your Next Project',
  description: 'Send your drawings or scope and a detailer replies within one working day. Reach UBC BIM by form, live chat, a 15-minute call, email or WhatsApp.',
  path: '/contact'
});

export default function ContactPage() {
  return <Contact />;
}
