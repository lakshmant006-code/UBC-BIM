'use client';
/*
  QuoteDrawer: the slide-in panel every "Start Your Next Project →" button opens.
  It renders the same ProjectForm as the homepage's final CTA, so both
  submit to the same place (app/api/project/route.js) and neither claims an
  enquiry was received unless that request actually succeeded. `machine`
  pre-selects the form's machine field (the Technology selector passes it).
*/
import React from 'react';
import { SectionHeading } from '../components/core/SectionHeading.jsx';
import { Icon } from '../components/core/Icon.jsx';
import { ProjectForm } from '../ui_kits/website/ProjectForm.jsx';

export function QuoteDrawer({ open, onClose, machine = '' }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(14,19,24,.44)', display: 'flex', justifyContent: 'flex-end' }}>
      <div role="dialog" aria-modal="true" aria-label="Start your next project" onClick={(e) => e.stopPropagation()} style={{
        width: 480, maxWidth: '100%', height: '100%', background: 'var(--surface-card)', boxShadow: 'var(--shadow-3)',
        padding: 'var(--s-7) var(--s-6)', overflow: 'auto', borderLeft: 'var(--bw-hair) solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--s-4)', marginBottom: 'var(--s-6)' }}>
          <SectionHeading eyebrow="Start your next project" title="A detailer replies with scope, price and timeline" size="sm" />
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><Icon name="x" size={20} /></button>
        </div>
        <ProjectForm defaultMachine={machine} source="drawer" />
      </div>
    </div>
  );
}
