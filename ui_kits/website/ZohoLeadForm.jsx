'use client';
/*
  ZohoLeadForm: every project enquiry on the site (ProjectForm,
  QuoteRequestForm) posts straight to UBC's Zoho CRM Web-to-Lead form
  ("Start your project", form 701373000010666398), which creates a Lead
  with the attached files. No server route or API keys are involved.

  It renders the site's own fields (children) inside a real <form> whose
  action is Zoho's, plus the hidden fields Zoho's form code requires. The
  post goes to a hidden iframe so the visitor stays on the page; once
  Zoho's reply loads there, the form shows the site's own confirmation.

  Zoho's field names: 'Last Name' (required), 'Email', 'Phone', 'LEADCF1'
  (Type of Project), 'LEADCF5' (Services, one value per entry),
  'Description' and 'theFile' (up to 3 files, 20 MB in total).
  `extraFields(form)` returns values computed at submit time (e.g. extra
  answers folded into { Description }); they are added to the form as
  plain inputs just before the browser sends it, outside React (a hidden
  input React renders would be reset by the re-render the submit causes).
*/
import React from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

import { ZOHO, FORM_ID } from './zoho-config.js';
export { ZOHO };

// The CRM's picklist values, with the labels the site shows for them.
export const PROJECT_TYPES = [
  { value: 'Light Gauge Steel Building', label: 'Light-gauge steel (LGSF / CFS)' },
  { value: 'Wood Framed building', label: 'Wood frame' },
  { value: 'Hybrid Building', label: 'Hybrid (steel and wood)' }
];
export const ZOHO_SERVICES = [
  { value: 'Drafting & Architectural', label: 'Drafting & Architectural', id: 'drafting-architectural' },
  { value: 'Bill of Materials & Estimation', label: 'Bill of Material & Estimation', id: 'bom-estimation' },
  { value: 'Permit Sets', label: 'Permit Sets', id: 'permit-sets' },
  { value: 'Modeling & Detailing', label: 'Modeling & Detailing', id: 'modeling-detailing' },
  { value: 'Engineering Services', label: 'Engineering', id: 'engineering' },
  { value: 'Stamping by EOR', label: 'Stamping by EOR' },
  { value: 'Others', label: 'Manufacturing or other', id: 'manufacturing' }
];

const fileProblem = (input) => {
  const files = Array.from((input && input.files) || []);
  if (files.length > ZOHO.maxFiles) return 'You can attach up to three files. Send the rest once we reply.';
  if (files.reduce((n, f) => n + f.size, 0) > ZOHO.maxBytes) return 'Attachments can be 20 MB in total. Send larger models once we reply.';
  return '';
};

// The GA4 conversion fires once on /thank-you/ (app/thank-you/LeadConversion.jsx),
// which reads this flag; reloading that page does not count a second lead.
export const LEAD_FLAG = 'ubc-lead-source';

// `conversion` (default true): a sales enquiry goes on to /thank-you and counts
// as a lead in analytics. A careers application passes false: it stays on the
// page, shows its own `sent` message, and is not counted as a sales lead.
export function ZohoLeadForm({ source, className, style, extraFields, sent, conversion = true, children }) {
  const [status, setStatus] = React.useState('idle'); // idle | sending | sent
  const [problem, setProblem] = React.useState('');
  const sink = 'zoho-lead-' + source;
  const sending = React.useRef(false);
  const router = useRouter();

  const onSubmit = (e) => {
    const form = e.currentTarget;
    const msg = fileProblem(form.elements.theFile);
    if (msg) { e.preventDefault(); setProblem(msg); return; }
    setProblem('');
    form.querySelectorAll('input[data-zoho-extra]').forEach((el) => el.remove());
    Object.entries((extraFields && extraFields(form)) || {}).forEach(([name, value]) => {
      const el = document.createElement('input');
      el.type = 'hidden'; el.name = name; el.value = value; el.dataset.zohoExtra = '';
      form.appendChild(el);
    });
    sending.current = true;
    setStatus('sending');
  };
  // Zoho's reply landing in the hidden frame means the lead was accepted.
  const onSinkLoad = () => {
    if (!sending.current) return;
    sending.current = false;
    setStatus('sent');
    if (!conversion) return;
    try { window.sessionStorage.setItem(LEAD_FLAG, source); } catch (e) { /* storage blocked: lead still recorded */ }
    router.push('/thank-you/');
  };

  return (
    <>
      {status === 'sent' ? sent : (
        <form action={ZOHO.action} method="POST" encType="multipart/form-data" acceptCharset="UTF-8" target={sink}
          name={'WebToLeads' + FORM_ID} onSubmit={onSubmit} className={className} style={style}>
          {Object.entries(ZOHO.hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
          {/* Spam trap: people never see or fill it. */}
          <input type="text" name={ZOHO.honeypot} defaultValue="" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: 'none' }} />
          {children({ sending: status === 'sending', problem })}
        </form>
      )}
      <iframe name={sink} title="Form submission" onLoad={onSinkLoad} tabIndex={-1} aria-hidden="true" style={{ display: 'none' }} />
      <Script id="wf_anal" src={ZOHO.analytics} strategy="lazyOnload" />
    </>
  );
}
