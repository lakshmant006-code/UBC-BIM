/*
  What the admin can edit: projects, blog posts and services, in the same
  shape the site already uses (ui_kits/website/data.js). The editor is
  generated from these field lists, and the server checks every save
  against the same lists (validateEntry), so the two never disagree.

  Field kinds: text, textarea, select, number, date, list (comma separated),
  file (a path under /assets, from an upload or typed), paragraphs (blank
  line between paragraphs), repeater (a list of sub-field groups).

  This file is imported by the browser editor too, so it must not import
  the site's content (that is lib/admin/seed.js, server only).
*/
const sectionFields = (withImage) => [
  { name: 'heading', label: 'Heading', kind: 'text', max: 120 },
  { name: 'body', label: 'Paragraphs', kind: 'paragraphs', hint: 'Leave a blank line between paragraphs.' },
  ...(withImage ? [
    { name: 'image', label: 'Image', kind: 'file', accept: 'image/*', hint: 'Shown beside the first paragraph.' },
    { name: 'caption', label: 'Image caption', kind: 'text', max: 160 }
  ] : [])
];

export const TYPES = {
  projects: {
    label: 'Projects', singular: 'project', idFrom: 'name',
    title: (e) => e.name,
    meta: (e) => [e.type, e.system].filter(Boolean).join(' · '),
    fields: [
      { name: 'name', label: 'Project name', kind: 'text', required: true, max: 90, hint: 'A generic name. Never a client or street name.' },
      { name: 'type', label: 'Building type', kind: 'select', required: true, options: ['Residential', 'Commercial', 'Multi-Family', 'Modular', 'Bathroom Pods', 'ADUs'] },
      { name: 'system', label: 'Framing system', kind: 'select', required: true, options: ['Light-gauge steel', 'Wood frame', 'Mixed construction'] },
      { name: 'size', label: 'Size', kind: 'text', max: 90 },
      { name: 'units', label: 'Units', kind: 'text', max: 90 },
      { name: 'location', label: 'Location', kind: 'text', max: 90 },
      { name: 'delivered', label: 'What was delivered', kind: 'text', max: 120 },
      { name: 'software', label: 'Software', kind: 'list', hint: 'Separate with commas.' },
      { name: 'modelSrc', label: '3D model (.glb)', kind: 'file', accept: '.glb', hint: 'Compressed GLB. IFC files are converted to GLB first (tools/ifc_to_glb.py).' },
      { name: 'modelRadius', label: 'Model radius', kind: 'number', hint: 'Sets the camera distance. Try 10 and adjust.' }
    ],
    // The editor works on flat fields; the site stores model as { src, radius }.
    toEntry: (f) => {
      const { modelSrc, modelRadius, ...rest } = f;
      // Keep any other model settings (hotspots, finish) already on the entry.
      return { ...rest, ...(modelSrc ? { model: { ...(rest.model || {}), src: modelSrc, radius: Number(modelRadius) || 10 } } : {}) };
    },
    fromEntry: (e) => ({ ...e, modelSrc: (e.model && e.model.src) || '', modelRadius: (e.model && e.model.radius) || '' })
  },
  blogs: {
    label: 'Blog posts', singular: 'blog post', idFrom: 'title',
    title: (e) => e.title,
    meta: (e) => e.date || 'No date',
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true, max: 140 },
      { name: 'shortTitle', label: 'Short title', kind: 'text', max: 60, hint: 'Used in links and the footer.' },
      { name: 'seoTitle', label: 'Search title', kind: 'text', max: 60, hint: 'Shown in Google. Up to 60 characters; the site name is added.' },
      { name: 'date', label: 'Publish date', kind: 'date', hint: 'Only set a date once the post is actually published.' },
      { name: 'excerpt', label: 'Summary', kind: 'textarea', max: 300 },
      { name: 'tags', label: 'Tags', kind: 'list', hint: 'Separate with commas.' },
      { name: 'image', label: 'Cover image', kind: 'file', accept: 'image/*' },
      { name: 'sections', label: 'Sections', kind: 'repeater', item: 'section', fields: sectionFields(true) }
    ],
    toEntry: (f) => f,
    fromEntry: (e) => e
  },
  services: {
    label: 'Services', singular: 'service', idFrom: 'title',
    title: (e) => e.title,
    meta: (e) => (e.page && e.page.updated) || '',
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true, max: 90 },
      { name: 'slug', label: 'Page address', kind: 'text', max: 60, hint: 'The part after /services/. Leave empty to use the id.' },
      { name: 'label', label: 'Label', kind: 'text', max: 90, hint: 'The small line above the title.' },
      { name: 'summary', label: 'Summary', kind: 'textarea', max: 300, hint: 'Two sentences that define the service.' },
      { name: 'meta', label: 'Search description', kind: 'textarea', min: 140, max: 155, hint: 'Shown in Google: 140 to 155 characters.' },
      { name: 'regions', label: 'Regions served', kind: 'list', hint: 'Separate with commas.' },
      { name: 'updated', label: 'Last updated', kind: 'date', hint: 'Shown on the page as "Updated".' },
      { name: 'sections', label: 'Sections', kind: 'repeater', item: 'section', fields: sectionFields(false) },
      { name: 'faqs', label: 'Questions and answers', kind: 'repeater', item: 'question', fields: [
        { name: 'q', label: 'Question', kind: 'text', max: 160 },
        { name: 'a', label: 'Answer', kind: 'textarea', max: 600, hint: 'Answer from facts that are already on the site.' }
      ] }
    ],
    toEntry: (f) => {
      const { meta, updated, faqs, ...rest } = f;
      return { ...rest, page: { ...(rest.page || {}), meta, updated, faqs } };
    },
    fromEntry: (e) => ({ ...e, meta: (e.page && e.page.meta) || '', updated: (e.page && e.page.updated) || '', faqs: (e.page && e.page.faqs) || [] })
  }
};

export const TYPE_KEYS = Object.keys(TYPES);

export const slugify = (s) => String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
export const ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,79}$/;
export const FILE_PATTERN = /^(\/assets\/[A-Za-z0-9._\/-]+|https:\/\/[^\s"'<>]+)$/;

// Returns a list of problems (empty when the entry is fine). `fields` are
// the editor's flat fields (before toEntry).
export function validateFields(type, f, id) {
  const def = TYPES[type]; const bad = [];
  if (!def) return ['Unknown content type.'];
  if (!ID_PATTERN.test(id || '')) bad.push('The id must be lowercase letters, numbers and hyphens.');
  const check = (fields, v, where) => fields.forEach((fd) => {
    const val = v[fd.name];
    const label = where + fd.label;
    if (fd.required && !String(val || '').trim()) bad.push(label + ' is required.');
    if (fd.kind === 'repeater') {
      (Array.isArray(val) ? val : []).forEach((row, i) => check(fd.fields, row, fd.label + ' ' + (i + 1) + ': '));
      return;
    }
    if (val == null || val === '') return;
    if (fd.kind === 'select' && !fd.options.includes(val)) bad.push(label + ' has an unknown value.');
    if (fd.kind === 'file' && !FILE_PATTERN.test(val)) bad.push(label + ' must be a path under /assets.');
    if ((fd.kind === 'text' || fd.kind === 'textarea') && typeof val !== 'string') bad.push(label + ' must be text.');
    if (typeof val === 'string') {
      if (fd.max && val.length > fd.max) bad.push(label + ' is over ' + fd.max + ' characters.');
      if (fd.min && val.length < fd.min) bad.push(label + ' is under ' + fd.min + ' characters.');
    }
    if (fd.kind === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(val)) bad.push(label + ' must be a date.');
    if (fd.kind === 'number' && !Number.isFinite(Number(val))) bad.push(label + ' must be a number.');
  });
  check(def.fields, f || {}, '');
  return bad;
}
