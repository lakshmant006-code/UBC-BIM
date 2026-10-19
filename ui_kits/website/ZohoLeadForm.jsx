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

const FORM_ID = '701373000010666398';
export const ZOHO = {
  action: 'https://crm.zoho.in/crm/WebToLeadForm',
  hidden: {
    xnQsjsdp: 'd724f37e1cd153679acebb4ee967c6d16b0042055f380cf8632ea6dd3f52033c',
    zc_gad: '',
    xmIwtLD: '339462cb837a08e8900c2ead0cbd34ae053457d10c1af3aeba5f0f4b7b30a415c3c6a46078b9a5e5bf2d7e889680c4e1',
    actionType: 'TGVhZHM=',
    returnURL: 'null',
    // Zoho's form code marks these "Do not remove" (visitor tracking ids).
    ldeskuid: '',
    LDTuvid: ''
  },
  honeypot: 'aG9uZXlwb3Q',
  // Zoho's own web form analytics (views and submissions per form).
  analytics: 'https://crm.zohopublic.in/crm/WebFormAnalyticsServeServlet?rid=853477faa869018734016b0ce3c9fdd4a6a0db95bc4e9083332dc3f8341f22123560e7a125d393bb7113c55893f19759gid961aa72a5dbca93ea872ac565e2f42578747261cc8ab872189d935e9ada91181gida10286e04e29071b31fc3e988701842cf57cc051fc2f7aacdc1e693d2ba844b4gid129559e858da30b391574a7c36e9bb9028638740e0974946917dda10b9bde521&tw=549be92407d3193fbcdc1de021ed70f043ac9511f5a2d56672d9de1b87097b97&version=v2',
  maxFiles: 3,
  maxBytes: 20 * 1024 * 1024
};

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

function track(source) {
  if (typeof window === 'undefined') return;
  if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: 'generate_lead', source });
  if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { source });
}

export function ZohoLeadForm({ source, className, style, extraFields, sent, children }) {
  const [status, setStatus] = React.useState('idle'); // idle | sending | sent
  const [problem, setProblem] = React.useState('');
  const sink = 'zoho-lead-' + source;
  const sending = React.useRef(false);

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
    track(source);
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
