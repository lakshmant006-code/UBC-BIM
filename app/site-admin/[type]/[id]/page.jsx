import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '../../../../lib/admin/auth.js';
import { TYPES } from '../../../../lib/admin/schema.js';
import { getEntry, storeConnected } from '../../../../lib/admin/store.js';
import { StoreNotice } from '../../StoreNotice.jsx';
import { Editor } from './Editor.jsx';

export default async function AdminEdit({ params }) {
  await requireSession();
  const { type, id } = await params;
  const def = TYPES[type];
  if (!def) notFound();
  const isNew = id === 'new';
  const entry = isNew ? {} : await getEntry(type, id);
  if (!isNew && !entry) notFound();
  const connected = storeConnected();
  return (
    <>
      <p className="adm-eyebrow"><Link href="/site-admin">Admin</Link> / <Link href={'/site-admin/' + type}>{def.label}</Link></p>
      <h1>{isNew ? 'Add ' + def.singular : def.title(entry)}</h1>
      <StoreNotice connected={connected} />
      <Editor type={type} id={isNew ? '' : id} initial={def.fromEntry(entry)} connected={connected} />
    </>
  );
}
