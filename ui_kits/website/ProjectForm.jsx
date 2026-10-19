'use client';
// The one project-intake form ("Start Your Next Project →"), used on Contact,
// in the homepage's final CTA, in the quote drawer, and (compact) at the end
// of each service page. It posts straight to UBC's Zoho CRM Web-to-Lead form
// (ZohoLeadForm.jsx), which creates a Lead with the drawings attached.
import React from 'react';
import { Button } from '../../components/core/Button.jsx';
import { FormField } from '../../components/forms/FormField.jsx';
import { Input } from '../../components/forms/Input.jsx';
import { Select } from '../../components/forms/Select.jsx';
import { UBC_DATA } from './data.js';
import { ZohoLeadForm, ZOHO_SERVICES } from './ZohoLeadForm.jsx';

const MACHINES = (UBC_DATA.home && UBC_DATA.home.machineOptions) || [];
const ACCEPT = '.pdf,.dwg,.rvt,.ifc';

const FILE_HINT = 'PDF, DWG, RVT or IFC: up to three files, 20 MB in total. Larger models can follow once we reply.';

// `compact` drops the machine field: name, email and drawings only (the
// inline form at the end of each service page, where `service` ticks that
// page's service on the lead).
export function ProjectForm({ defaultMachine = '', source = 'website', dark = false, compact = false, service }) {
  const [machine, setMachine] = React.useState(defaultMachine);
  React.useEffect(() => { setMachine(defaultMachine); }, [defaultMachine]);
  const muted = dark ? 'rgba(255,255,255,.78)' : 'var(--text-muted)';
  const zohoService = service && ZOHO_SERVICES.find((z) => z.id === service);

  const sent = (
    <div role="status">
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 600, color: dark ? 'var(--white)' : 'var(--text-strong)' }}>Your project is with us</div>
      <p style={{ fontSize: 'var(--fs-body-sm)', color: muted, margin: 'var(--s-2) 0 0' }}>
        A detailer will reply with a scope, price and timeline within one working day.
      </p>
    </div>
  );

  // Zoho has no machine field, so the answer travels in the description.
  const extraFields = () => ({
    Description: [machine && 'Machine or software: ' + machine, 'Sent from: ' + source].filter(Boolean).join('\n')
  });

  return (
    <ZohoLeadForm source={source} sent={sent} extraFields={extraFields} style={{ display: 'grid', gap: 'var(--s-4)' }}>
      {({ sending, problem }) => (
        <>
          <div className="ubc-form-pair" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-4)' }}>
            <FormField label="Name" required htmlFor={'pf-name-' + source}><Input id={'pf-name-' + source} name="Last Name" autoComplete="name" maxLength={80} required /></FormField>
            <FormField label="Work email" required htmlFor={'pf-email-' + source}><Input id={'pf-email-' + source} name="Email" type="email" autoComplete="email" maxLength={100} required /></FormField>
          </div>
          {!compact && (
            <FormField label="Machine or software" htmlFor={'pf-machine-' + source}>
              <Select id={'pf-machine-' + source} value={machine} onChange={(e) => setMachine(e.target.value)} placeholder="Select your machine or software" options={MACHINES} />
            </FormField>
          )}
          {zohoService && <input type="hidden" name="LEADCF5" value={zohoService.value} />}
          <FormField label="Drawings and models" htmlFor={'pf-files-' + source} hint={FILE_HINT}>
            <input id={'pf-files-' + source} name="theFile" type="file" multiple accept={ACCEPT}
              style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: dark ? 'var(--white)' : 'var(--text-strong)', minHeight: 44, width: '100%', maxWidth: '100%' }} />
          </FormField>
          {problem && (
            <p role="alert" style={{ fontSize: 'var(--fs-body-sm)', color: dark ? 'var(--white)' : 'var(--danger)', margin: 0 }}>{problem}</p>
          )}
          <div>
            <Button type="submit" disabled={sending}>{sending ? 'Sending…' : 'Start Your Next Project →'}</Button>
          </div>
        </>
      )}
    </ZohoLeadForm>
  );
}
