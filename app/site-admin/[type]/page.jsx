import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '../../../lib/admin/auth.js';
import { TYPES } from '../../../lib/admin/schema.js';
import { listEntries, storeConnected } from '../../../lib/admin/store.js';
import { StoreNotice } from '../StoreNotice.jsx';

export default async function AdminList({ params }) {
  await requireSession();
  const { type } = await params;
  const def = TYPES[type];
  if (!def) notFound();
  const entries = await listEntries(type);
  return (
    <>
      <p className="adm-eyebrow"><Link href="/site-admin">Admin</Link> / {def.label}</p>
      <div className="adm-head">
        <h1>{def.label}</h1>
        <Link href={'/site-admin/' + type + '/new'} className="ubc-btn-solid">Add {def.singular} {'→'}</Link>
      </div>
      <StoreNotice connected={storeConnected()} />
      <ul className="adm-list">
        {entries.map((e) => (
          <li key={e.id}>
            <Link href={'/site-admin/' + type + '/' + e.id}>
              <span className="adm-list-title">{def.title(e)}</span>
              <span className="adm-list-meta">{def.meta(e)}</span>
            </Link>
          </li>
        ))}
        {entries.length === 0 && <li className="adm-empty">Nothing here yet.</li>}
      </ul>
    </>
  );
}
