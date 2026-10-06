'use client';
/*
  QuoteDrawer: the slide-in panel every "Start Your Next Project →" button opens.
  It renders the same ProjectForm as the homepage's final CTA, so both
  submit to the same place (app/api/project/route.js) and neither claims an
  enquiry was received unless that request actually succeeded. `machine`
  pre-selects the form's machine field (the Technology selector passes it).
  `mode="quote"` (the floating "Request Quote" button) shows the quote
  request form instead: contact details plus the scope, sent to Zoho CRM.
*/
import React from 'react';
import { SectionHeading } from '../components/core/SectionHeading.jsx';
import { Icon } from '../components/core/Icon.jsx';
import { ProjectForm } from '../ui_kits/website/ProjectForm.jsx';
import { QuoteRequestForm } from '../ui_kits/website/QuoteRequestForm.jsx';

export function QuoteDrawer({ open, onClose, machine = '', mode = 'project' }) {
  if (!open) return null;
  const quote = mode === 'quote';
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(14,19,24,.44)', display: 'flex', justifyContent: 'flex-end' }}>
      <div role="dialog" aria-modal="true" aria-label={quote ? 'Request a quote' : 'Start your next project'} onClick={(e) => e.stopPropagation()} style={{
        width: 480, maxWidth: '100%', height: '100%', background: 'var(--surface-card)', boxShadow: 'var(--shadow-3)',
        padding: 'var(--s-7) var(--s-6)', overflow: 'auto', borderLeft: 'var(--bw-hair) solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--s-4)', marginBottom: 'var(--s-6)' }}>
          {quote
            ? <SectionHeading eyebrow="Request a quote" title="Tell us the scope; a detailer replies with a price" size="sm" />
            : <SectionHeading eyebrow="Start your next project" title="A detailer replies with scope, price and timeline" size="sm" />}
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><Icon name="x" size={20} /></button>
        </div>
        {quote ? <QuoteRequestForm /> : <ProjectForm defaultMachine={machine} source="drawer" />}
      </div>
    </div>
  );
}
