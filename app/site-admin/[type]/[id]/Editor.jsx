'use client';
/*
  The add/edit form for one project, blog post or service, generated from
  lib/admin/schema.js. Anything the form has no field for (a section's bullet
  list, a project's model hotspots...) is carried through untouched, so
  editing never silently drops content. Save and Upload need a connected
  store (lib/admin/store.js); Download JSON always works.
*/
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../components/core/Button.jsx';
import { FormField } from '../../../../components/forms/FormField.jsx';
import { Input } from '../../../../components/forms/Input.jsx';
import { Select } from '../../../../components/forms/Select.jsx';
import { Textarea } from '../../../../components/forms/Textarea.jsx';
import { TYPES, slugify, validateFields } from '../../../../lib/admin/schema.js';

// Entry values -> what the inputs hold (text), and back.
const toUi = (fields, v) => {
  const out = { _orig: v };
  fields.forEach((fd) => {
    const x = v[fd.name];
    if (fd.kind === 'list') out[fd.name] = Array.isArray(x) ? x.join(', ') : (x || '');
    else if (fd.kind === 'paragraphs') out[fd.name] = Array.isArray(x) ? x.join('\n\n') : (x || '');
    else if (fd.kind === 'repeater') out[fd.name] = (Array.isArray(x) ? x : []).map((row) => toUi(fd.fields, row));
    else out[fd.name] = x == null ? '' : String(x);
  });
  return out;
};
const fromUi = (fields, ui) => {
  const out = { ...(ui._orig || {}) };
  fields.forEach((fd) => {
    const x = ui[fd.name];
    let val;
    if (fd.kind === 'list') val = String(x || '').split(',').map((t) => t.trim()).filter(Boolean);
    else if (fd.kind === 'paragraphs') val = String(x || '').split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
    else if (fd.kind === 'repeater') val = (x || []).map((row) => fromUi(fd.fields, row)).filter((row) => fd.fields.some((f) => { const r = row[f.name]; return Array.isArray(r) ? r.length : r; }));
    else val = String(x == null ? '' : x).trim();
    const empty = val === '' || (Array.isArray(val) && val.length === 0);
    if (empty) delete out[fd.name]; else out[fd.name] = val;
  });
  return out;
};

const REASONS = {
  'no-store': 'No database is connected yet, so nothing was saved. Use Download JSON.',
  auth: 'Your session has ended. Sign in again.',
  origin: 'The request was refused. Reload the page and try again.',
  'store-error': 'The database did not accept this. Nothing was changed.',
  type: 'That file type is not allowed. Use GLB, WebP, JPG, PNG, PDF or MP4.',
  size: 'That file is over 25 MB.'
};

function FileField({ fd, value, onChange, connected, id }) {
  const [msg, setMsg] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const upload = async (file) => {
    if (!file) return;
    setBusy(true); setMsg('');
    const body = new FormData(); body.set('file', file);
    try {
      const res = await fetch('/api/site-admin/upload', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.path) onChange(data.path); else setMsg(REASONS[data.reason] || 'The upload failed.');
    } catch { setMsg('The upload failed. Check your connection.'); }
    setBusy(false);
  };
  return (
    <div className="adm-file">
      <div className="adm-file-row">
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="/assets/…" />
        <label className={'adm-upload' + (connected && !busy ? '' : ' is-off')}>
          {busy ? 'Uploading…' : 'Upload'}
          <input type="file" accept={fd.accept} disabled={!connected || busy} onChange={(e) => upload(e.target.files && e.target.files[0])} />
        </label>
      </div>
      {!connected && <span className="adm-hint">Upload turns on when the database is connected. You can type the path of a file that is already on the site.</span>}
      {msg && <span role="alert" className="adm-error">{msg}</span>}
    </div>
  );
}

function Field({ fd, value, onChange, connected, id }) {
  const common = { id, value, onChange: (e) => onChange(e.target.value) };
  let control;
  if (fd.kind === 'select') control = <Select {...common} placeholder="Select" options={fd.options} />;
  else if (fd.kind === 'textarea') control = <Textarea {...common} rows={3} />;
  else if (fd.kind === 'paragraphs') control = <Textarea {...common} rows={8} />;
  else if (fd.kind === 'file') control = <FileField fd={fd} value={value} onChange={onChange} connected={connected} id={id} />;
  else if (fd.kind === 'number') control = <Input {...common} type="number" step="any" />;
  else if (fd.kind === 'date') control = <Input {...common} type="date" />;
  else control = <Input {...common} />;
  const count = (fd.max || fd.min) && typeof value === 'string' ? value.length + (fd.max ? ' / ' + fd.max : '') : '';
  return (
    <FormField label={fd.label} required={fd.required} htmlFor={id} hint={[fd.hint, count && count + ' characters'].filter(Boolean).join(' · ') || undefined}>
      {control}
    </FormField>
  );
}

function Repeater({ fd, rows, onChange, connected, base }) {
  const set = (i, key, v) => onChange(rows.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= rows.length) return; const n = rows.slice(); [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  return (
    <fieldset className="adm-rep">
      <legend>{fd.label}</legend>
      {rows.map((row, i) => (
        <div key={i} className="adm-rep-row">
          <div className="adm-rep-head">
            <span>{fd.item} {i + 1}</span>
            <span className="adm-rep-tools">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={'Move ' + fd.item + ' ' + (i + 1) + ' up'}>Up</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label={'Move ' + fd.item + ' ' + (i + 1) + ' down'}>Down</button>
              <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} aria-label={'Remove ' + fd.item + ' ' + (i + 1)}>Remove</button>
            </span>
          </div>
          {fd.fields.map((sf) => (
            <Field key={sf.name} fd={sf} value={row[sf.name]} onChange={(v) => set(i, sf.name, v)} connected={connected} id={base + '-' + i + '-' + sf.name} />
          ))}
        </div>
      ))}
      <button type="button" className="adm-add" onClick={() => onChange([...rows, toUi(fd.fields, {})])}>Add {fd.item} {'+'}</button>
    </fieldset>
  );
}

export function Editor({ type, id: initialId, initial, connected }) {
  const def = TYPES[type];
  const router = useRouter();
  const isNew = !initialId;
  const [ui, setUi] = React.useState(() => toUi(def.fields, initial));
  const [id, setId] = React.useState(initialId);
  const [idTouched, setIdTouched] = React.useState(false);
  const [state, setState] = React.useState({ busy: false, problems: [], note: '' });

  const set = (name, v) => {
    setUi((u) => ({ ...u, [name]: v }));
    if (isNew && !idTouched && name === def.idFrom) setId(slugify(v));
  };
  const build = () => def.toEntry(fromUi(def.fields, ui));
  const problems = () => validateFields(type, fromUi(def.fields, ui), id);

  const save = async () => {
    const p = problems();
    if (p.length) { setState({ busy: false, problems: p, note: '' }); return; }
    setState({ busy: true, problems: [], note: '' });
    try {
      const res = await fetch('/api/site-admin/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'save', type, id, fields: fromUi(def.fields, ui) }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { router.push('/site-admin/' + type); router.refresh(); return; }
      setState({ busy: false, problems: data.problems || [REASONS[data.reason] || 'The save failed.'], note: '' });
    } catch { setState({ busy: false, problems: ['The save failed. Check your connection.'], note: '' }); }
  };
  const remove = async () => {
    if (!window.confirm('Delete this ' + def.singular + '? This cannot be undone.')) return;
    setState({ busy: true, problems: [], note: '' });
    const res = await fetch('/api/site-admin/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', type, id }) }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res && res.ok) { router.push('/site-admin/' + type); router.refresh(); return; }
    setState({ busy: false, problems: [REASONS[data.reason] || 'The delete failed.'], note: '' });
  };
  const download = () => {
    const p = problems();
    if (p.length) { setState({ busy: false, problems: p, note: '' }); return; }
    const blob = new Blob([JSON.stringify({ id, ...build() }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = type + '-' + id + '.json';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
    setState({ busy: false, problems: [], note: 'Downloaded ' + a.download + '.' });
  };

  return (
    <form className="adm-form adm-editor" onSubmit={(e) => { e.preventDefault(); save(); }} noValidate>
      <FormField label="Id" required htmlFor="adm-id" hint={isNew ? 'Lowercase letters, numbers and hyphens. It becomes part of the address and cannot change later.' : 'The id cannot change.'}>
        <Input id="adm-id" value={id} readOnly={!isNew} onChange={(e) => { setIdTouched(true); setId(slugify(e.target.value)); }} />
      </FormField>
      {def.fields.map((fd) => fd.kind === 'repeater' ? (
        <Repeater key={fd.name} fd={fd} rows={ui[fd.name]} onChange={(v) => set(fd.name, v)} connected={connected} base={'adm-' + fd.name} />
      ) : (
        <Field key={fd.name} fd={fd} value={ui[fd.name]} onChange={(v) => set(fd.name, v)} connected={connected} id={'adm-' + fd.name} />
      ))}
      {state.problems.length > 0 && (
        <div role="alert" className="adm-error-box">
          <strong>Fix these first:</strong>
          <ul>{state.problems.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </div>
      )}
      {state.note && <p role="status" className="adm-hint">{state.note}</p>}
      <div className="adm-actions">
        <Button pill type="submit" disabled={state.busy || !connected}>{state.busy ? 'Working…' : 'Save'}</Button>
        <Button pill variant="secondary" onClick={download}>Download JSON</Button>
        {!isNew && connected && <Button pill variant="secondary" onClick={remove} disabled={state.busy}>Delete</Button>}
        {!connected && <span className="adm-hint">Save is off until a database is connected.</span>}
      </div>
    </form>
  );
}
