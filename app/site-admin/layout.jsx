import Link from 'next/link';
import { getSession } from '../../lib/admin/auth.js';
import { SignOut } from './SignOut.jsx';
import './admin.css';

// The admin never appears in search: noindex here, a Disallow in robots.js,
// and it is left out of the sitemap.
export const metadata = { title: 'Admin | UBC BIM', robots: { index: false, follow: false } };

export default async function AdminLayout({ children }) {
  const session = await getSession();
  return (
    <div className="adm">
      <header className="adm-bar">
        <div className="adm-bar-in">
          <Link href="/site-admin" className="adm-brand" aria-label="UBC BIM admin home">
            <img src="/assets/brand/ubc-logo.webp" alt="UBC BIM" width={114} height={20} />
            <span>Admin</span>
          </Link>
          {session && (
            <nav aria-label="Admin" className="adm-nav">
              <Link href="/site-admin/projects">Projects</Link>
              <Link href="/site-admin/blogs">Blog posts</Link>
              <Link href="/site-admin/services">Services</Link>
              <a href="/" target="_blank" rel="noopener noreferrer">View site<span className="ubc-visually-hidden"> (opens in a new tab)</span></a>
              <SignOut />
            </nav>
          )}
        </div>
      </header>
      <main id="main" className="adm-main">{children}</main>
    </div>
  );
}
