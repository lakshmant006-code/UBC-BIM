'use client';
/*
  Quote request form, opened by the floating "Request Quote" button. It
  asks for what a detailer needs to price a job (who you are, then the
  building type, framing system, services, size and timing) and posts
  straight to UBC's Zoho CRM Web-to-Lead form (ZohoLeadForm.jsx). Name,
  email, phone, framing (Type of Project), services and files go to Zoho's
  own fields; company, building type, size, timeline and notes are written
  into the lead's Description.
*/
import React from 'react';
import { Button } from '../../components/core/Button.jsx';
import { FormField } from '../../components/forms/FormField.jsx';
import { Input } from '../../components/forms/Input.jsx';
import { Select } from '../../components/forms/Select.jsx';
import { Textarea } from '../../components/forms/Textarea.jsx';
import { ZohoLeadForm, PROJECT_TYPES, ZOHO_SERVICES } from './ZohoLeadForm.jsx';

const BUILDING = ['Residential', 'Commercial', 'Multi-Family', 'Modular', 'Bathroom pods', 'ADU', 'Other'];
// '-None-' is the CRM's own "no answer" value for its picklist.
const FRAMING = [{ value: '-None-', label: 'Select' }, ...PROJECT_TYPES];
const TIMELINE = ['As soon as possible', 'Within a month', '1–3 months', 'Just pricing for now'];

function Toggles({ label, options, value, onChange }) {
  return (
    <fieldset className="ubc-qr-group">
      <legend>{label}</legend>
      <div>
        {options.map((o) => {
          const on = value.includes(o.value);
          return (
            <button key={o.value} type="button" aria-pressed={on}
              onClick={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}>{o.label}</button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function QuoteRequestForm() {
  const [services, setServices] = React.useState([]);

  const sent = (
    <div role="status" className="ubc-qr-sent">
      <div className="ubc-qr-sent-title">Quote request received</div>
      <p>A detailer will review it and reply with a scope, price and timeline within one working day.</p>
    </div>
  );

  // The answers Zoho has no field for go into the lead's Description.
  const extraFields = (form) => {
    const v = (id) => String((form.querySelector('#' + id) || {}).value || '').trim();
    return { Description: [
      ['Company', v('qr-company')], ['Building type', v('qr-building')], ['Approximate size', v('qr-size')],
      ['Timeline', v('qr-timeline')], ['Notes', v('qr-message')]
    ].filter(([, x]) => x).map(([k, x]) => k + ': ' + x).concat('Sent from: Request Quote').join('\n') };
  };

  return (
    <ZohoLeadForm source="quote" sent={sent} extraFields={extraFields} className="ubc-qr">
      {({ sending, problem }) => (
        <>
          <div className="ubc-qr-pair">
            <FormField label="Name" required htmlFor="qr-name"><Input id="qr-name" name="Last Name" autoComplete="name" maxLength={80} required /></FormField>
            <FormField label="Work email" required htmlFor="qr-email"><Input id="qr-email" name="Email" type="email" autoComplete="email" maxLength={100} required /></FormField>
          </div>
          <div className="ubc-qr-pair">
            <FormField label="Company" htmlFor="qr-company"><Input id="qr-company" autoComplete="organization" /></FormField>
            <FormField label="Phone" htmlFor="qr-phone"><Input id="qr-phone" name="Phone" type="tel" autoComplete="tel" maxLength={30} /></FormField>
          </div>
          <div className="ubc-qr-pair">
            <FormField label="Building type" htmlFor="qr-building">
              <Select id="qr-building" defaultValue="" placeholder="Select" options={BUILDING} />
            </FormField>
            <FormField label="Framing system" htmlFor="qr-framing">
              <Select id="qr-framing" name="LEADCF1" defaultValue="-None-" options={FRAMING} />
            </FormField>
          </div>
          <Toggles label="Services you need" options={ZOHO_SERVICES} value={services} onChange={setServices} />
          {services.map((sv) => <input key={sv} type="hidden" name="LEADCF5" value={sv} />)}
          <div className="ubc-qr-pair">
            <FormField label="Approximate size" htmlFor="qr-size" hint="Square feet, units or storeys">
              <Input id="qr-size" placeholder="e.g. 2,400 sq ft, 2 storeys" />
            </FormField>
            <FormField label="Timeline" htmlFor="qr-timeline">
              <Select id="qr-timeline" defaultValue="" placeholder="Select" options={TIMELINE} />
            </FormField>
          </div>
          <FormField label="Anything else" htmlFor="qr-message">
            <Textarea id="qr-message" rows={3} placeholder="Machine or software, codes, deadlines, special details." />
          </FormField>
          <FormField label="Drawings and models" htmlFor="qr-files" hint="PDF, DWG, RVT or IFC: up to three files, 20 MB in total. Larger models can follow once we reply.">
            <input id="qr-files" name="theFile" type="file" multiple accept=".pdf,.dwg,.rvt,.ifc" className="ubc-qr-file" />
          </FormField>
          {problem && <p role="alert" className="ubc-qr-error">{problem}</p>}
          <div>
            <Button type="submit" disabled={sending}>{sending ? 'Sending…' : 'Request Quote →'}</Button>
          </div>
        </>
      )}
    </ZohoLeadForm>
  );
}
