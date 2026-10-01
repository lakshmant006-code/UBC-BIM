'use client';
// The one project-intake form ("Send Your Project →"), used inline in the
// homepage's final CTA and inside the quote drawer every other conversion
// button opens. Posts to app/api/project/route.js, which forwards to Zoho
// once PROJECT_WEBHOOK_URL is configured; until then the form reports that
// it could not send rather than claiming the enquiry was received.
import React from 'react';
import Link from 'next/link';
import { Button } from '../../components/core/Button.jsx';
import { FormField } from '../../components/forms/FormField.jsx';
import { Input } from '../../components/forms/Input.jsx';
import { Select } from '../../components/forms/Select.jsx';
import { UBC_DATA } from './data.js';

const MACHINES = (UBC_DATA.home && UBC_DATA.home.machineOptions) || [];
const ACCEPT = '.pdf,.dwg,.rvt,.ifc';

function trackConversion(machine, source) {
  if (typeof window === 'undefined') return;
  const payload = { event: 'send_your_project', machine: machine || 'unspecified', source };
  if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
  if (typeof window.gtag === 'function') window.gtag('event', 'send_your_project', { machine: payload.machine, source });
}

export function ProjectForm({ defaultMachine = '', source = 'website', dark = false }) {
  const [status, setStatus] = React.useState('idle'); // idle | sending | sent | error
  const [machine, setMachine] = React.useState(defaultMachine);
  const [files, setFiles] = React.useState([]);
  React.useEffect(() => { setMachine(defaultMachine); }, [defaultMachine]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = new FormData();
    body.set('name', fd.get('name') || '');
    body.set('email', fd.get('email') || '');
    body.set('machine', machine);
    body.set('source', source);
    files.forEach((f) => body.append('fileNames', f.name));
    trackConversion(machine, source);
    setStatus('sending');
    try {
      const res = await fetch('/api/project', { method: 'POST', body });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const muted = dark ? 'rgba(255,255,255,.78)' : 'var(--text-muted)';

  if (status === 'sent') {
    return (
      <div role="status">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 600, color: dark ? 'var(--white)' : 'var(--text-strong)' }}>Your project is with us</div>
        <p style={{ fontSize: 'var(--fs-body-sm)', color: muted, margin: 'var(--s-2) 0 0' }}>
          A detailer will reply with a scope, price and timeline{files.length ? ', and a link to upload the files you selected' : ''}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <div className="ubc-form-pair" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-4)' }}>
        <FormField label="Name" required htmlFor={'pf-name-' + source}><Input id={'pf-name-' + source} name="name" autoComplete="name" required /></FormField>
        <FormField label="Work email" required htmlFor={'pf-email-' + source}><Input id={'pf-email-' + source} name="email" type="email" autoComplete="email" required /></FormField>
      </div>
      <FormField label="Machine or software" htmlFor={'pf-machine-' + source}>
        <Select id={'pf-machine-' + source} value={machine} onChange={(e) => setMachine(e.target.value)} placeholder="Select your machine or software" options={MACHINES} />
      </FormField>
      <FormField label="Drawings and models" htmlFor={'pf-files-' + source} hint="PDF, DWG, RVT or IFC. File names travel with your request; we'll send an upload link for the files themselves.">
        <input id={'pf-files-' + source} type="file" multiple accept={ACCEPT}
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: dark ? 'var(--white)' : 'var(--text-strong)', minHeight: 44, width: '100%', maxWidth: '100%' }} />
      </FormField>
      {status === 'error' && (
        <p role="alert" style={{ fontSize: 'var(--fs-body-sm)', color: dark ? 'var(--white)' : 'var(--danger)', margin: 0 }}>
          We couldn't send this just now. Please <Link href="/contact" style={{ color: 'inherit' }}>book a call</Link> instead and we'll pick it up from there.
        </p>
      )}
      <div>
        <Button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send Your Project →'}</Button>
      </div>
    </form>
  );
}
