'use client';
/*
  Quote request form, opened by the floating "Request Quote" button. It
  asks for what a detailer needs to price a job (who you are, then the
  building type, framing system, services, size and timing) and posts to
  app/api/project/route.js with source 'quote', which creates a Lead in
  Zoho CRM with every answer in it. Like the project form, it only says
  the request was received when that request actually succeeded.
*/
import React from 'react';
import Link from 'next/link';
import { Button } from '../../components/core/Button.jsx';
import { FormField } from '../../components/forms/FormField.jsx';
import { Input } from '../../components/forms/Input.jsx';
import { Select } from '../../components/forms/Select.jsx';
import { Textarea } from '../../components/forms/Textarea.jsx';
import { UBC_DATA } from './data.js';

const BUILDING = ['Residential', 'Commercial', 'Multi-level', 'Other'];
const FRAMING = ['Light-gauge steel (LGSF / CFS)', 'Wood frame', 'Both / not sure'];
const SERVICES = (UBC_DATA.serviceArticles || []).map((a) => a.title);
const TIMELINE = ['As soon as possible', 'Within a month', '1–3 months', 'Just pricing for now'];

function Toggles({ label, options, value, onChange }) {
  return (
    <fieldset className="ubc-qr-group">
      <legend>{label}</legend>
      <div>
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button key={o} type="button" aria-pressed={on}
              onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}>{o}</button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function QuoteRequestForm() {
  const [status, setStatus] = React.useState('idle'); // idle | sending | sent | error
  const [services, setServices] = React.useState([]);
  const [files, setFiles] = React.useState([]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = new FormData();
    ['name', 'email', 'company', 'phone', 'buildingType', 'framing', 'size', 'timeline', 'message'].forEach((k) => body.set(k, String(fd.get(k) || '').trim()));
    services.forEach((s) => body.append('services', s));
    files.forEach((f) => body.append('fileNames', f.name));
    body.set('source', 'quote');
    setStatus('sending');
    try {
      const res = await fetch('/api/project', { method: 'POST', body });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div role="status" className="ubc-qr-sent">
        <div className="ubc-qr-sent-title">Quote request received</div>
        <p>A detailer will review it and reply with a scope, price and timeline within one working day{files.length ? ', plus a link to upload your files' : ''}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="ubc-qr">
      <div className="ubc-qr-pair">
        <FormField label="Name" required htmlFor="qr-name"><Input id="qr-name" name="name" autoComplete="name" required /></FormField>
        <FormField label="Work email" required htmlFor="qr-email"><Input id="qr-email" name="email" type="email" autoComplete="email" required /></FormField>
      </div>
      <div className="ubc-qr-pair">
        <FormField label="Company" htmlFor="qr-company"><Input id="qr-company" name="company" autoComplete="organization" /></FormField>
        <FormField label="Phone" htmlFor="qr-phone"><Input id="qr-phone" name="phone" type="tel" autoComplete="tel" /></FormField>
      </div>
      <div className="ubc-qr-pair">
        <FormField label="Building type" htmlFor="qr-building">
          <Select id="qr-building" name="buildingType" defaultValue="" placeholder="Select" options={BUILDING} />
        </FormField>
        <FormField label="Framing system" htmlFor="qr-framing">
          <Select id="qr-framing" name="framing" defaultValue="" placeholder="Select" options={FRAMING} />
        </FormField>
      </div>
      <Toggles label="Services you need" options={SERVICES} value={services} onChange={setServices} />
      <div className="ubc-qr-pair">
        <FormField label="Approximate size" htmlFor="qr-size" hint="Square feet, units or storeys">
          <Input id="qr-size" name="size" placeholder="e.g. 2,400 sq ft, 2 storeys" />
        </FormField>
        <FormField label="Timeline" htmlFor="qr-timeline">
          <Select id="qr-timeline" name="timeline" defaultValue="" placeholder="Select" options={TIMELINE} />
        </FormField>
      </div>
      <FormField label="Anything else" htmlFor="qr-message">
        <Textarea id="qr-message" name="message" rows={3} placeholder="Machine or software, codes, deadlines, special details." />
      </FormField>
      <FormField label="Drawings and models" htmlFor="qr-files" hint="PDF, DWG, RVT or IFC. File names travel with your request; we'll send an upload link for the files themselves.">
        <input id="qr-files" type="file" multiple accept=".pdf,.dwg,.rvt,.ifc" onChange={(e) => setFiles(Array.from(e.target.files || []))} className="ubc-qr-file" />
      </FormField>
      {status === 'error' && (
        <p role="alert" className="ubc-qr-error">
          We couldn't send this just now. Please try again, or use the <Link href="/contact">contact page</Link>.
        </p>
      )}
      <div>
        <Button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Request Quote →'}</Button>
      </div>
    </form>
  );
}
