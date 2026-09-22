'use client';
/*
  QuoteDrawer: moved verbatim (behaviourally) from ui_kits/website/index.html's
  trailing inline script, where it lived alongside the old App() component.

  NOTE (preserved as-is, not fixed here — see the migration plan's Phase 5):
  this form has no real submission. onSubmit just flips local state to the
  "sent" view; there is no fetch/XHR anywhere, despite the success copy below
  claiming the enquiry was "Logged to the CRM". Wiring a real destination
  needs an endpoint the user hasn't supplied yet, so that success copy stays
  exactly as misleading as it already was before this migration, rather than
  quietly being made honest (or quietly being made true) in a PR that isn't
  about the CRM at all.
*/
import React from 'react';
import { SectionHeading } from '../components/core/SectionHeading.jsx';
import { Button } from '../components/core/Button.jsx';
import { Icon } from '../components/core/Icon.jsx';
import { FormField } from '../components/forms/FormField.jsx';
import { Input } from '../components/forms/Input.jsx';
import { Select } from '../components/forms/Select.jsx';
import { Textarea } from '../components/forms/Textarea.jsx';
import { UBC_DATA } from '../ui_kits/website/data.js';

export function QuoteDrawer({ open, onClose }) {
  const [sent, setSent] = React.useState(false);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(16,18,21,.44)', display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 460, maxWidth: '100%', height: '100%', background: 'var(--surface-card)', boxShadow: 'var(--shadow-3)',
        padding: 'var(--s-7)', overflow: 'auto',
        animation: 'none', borderLeft: 'var(--bw-hair) solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--s-4)' }}>
          <SectionHeading eyebrow="Request a quote" title="Tell us about the project" size="sm" />
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><Icon name="x" size={20} /></button>
        </div>
        {sent ? (
          <div style={{ marginTop: 'var(--s-8)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-strong)' }}>Quote request received</div>
            <p style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)', marginTop: 'var(--s-3)' }}>
              Logged to the CRM and tagged Website · Sticky quote. We reply within one working day.
            </p>
            <Button variant="secondary" size="sm" style={{ marginTop: 'var(--s-5)' }} onClick={onClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: 'grid', gap: 'var(--s-4)', marginTop: 'var(--s-6)' }}>
            <FormField label="Name" required><Input placeholder="Your name" required /></FormField>
            <FormField label="Work email" required><Input type="email" placeholder="you@company.com" required /></FormField>
            <FormField label="Building type"><Select placeholder="Select building type" options={['Residential', 'Commercial', 'Multifamily', 'Light-gauge steel', 'Wood']} /></FormField>
            <FormField label="Service"><Select placeholder="Select a service" options={UBC_DATA.services.map((s) => s.title)} /></FormField>
            <FormField label="Scope" hint="Square footage, unit count, what you need modelled."><Textarea rows={4} placeholder="Building type, square footage, what you need modelled." /></FormField>
            <Button type="submit" full>Request a quote</Button>
          </form>
        )}
      </div>
    </div>
  );
}
