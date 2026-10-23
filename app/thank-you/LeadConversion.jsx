'use client';
import React from 'react';
import { LEAD_FLAG } from '../../ui_kits/website/ZohoLeadForm.jsx';

// Fires the GA4 generate_lead conversion once per successful submission: the
// form leaves a flag in sessionStorage, which is cleared as it is read.
export function LeadConversion() {
  React.useEffect(() => {
    let source = null;
    try { source = window.sessionStorage.getItem(LEAD_FLAG); window.sessionStorage.removeItem(LEAD_FLAG); } catch (e) { return; }
    if (!source) return;
    if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: 'generate_lead', source });
    if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { source });
  }, []);
  return null;
}
