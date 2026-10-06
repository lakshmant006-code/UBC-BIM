// The chat assistant's knowledge: everything it may say about UBC BIM,
// built once from the same data.js the pages render, so the bot never says
// anything the site doesn't. Kept byte-stable between requests (no dates,
// no per-request values) so the system prompt caches.
import { UBC_DATA as D } from '../../../ui_kits/website/data.js';

const lines = (arr) => arr.filter(Boolean).join('\n');

function article(a) {
  const out = ['### ' + a.title, a.summary || ''];
  (a.sections || []).forEach((s) => {
    if (s.heading) out.push(s.heading + ':');
    (s.body || []).forEach((p) => out.push(p));
    (s.list || []).forEach((it) => out.push('- ' + (it.title ? it.title + ': ' : '') + (it.body || '')));
  });
  return lines(out);
}

function project(p) {
  return '- ' + p.name + ' (' + p.type + ', ' + p.system + '): ' + p.size + '; ' + p.units + '; location ' + p.location +
    '; ' + p.delivered + '; software ' + (p.software || []).join(', ');
}

export const SITE_KNOWLEDGE = lines([
  '# UBC BIM: facts you may use',
  '',
  '## Company',
  D.hero.intro.h1,
  D.hero.intro.sub,
  'Figures: ' + (D.stats || []).map((s) => s.value + ' ' + s.label.toLowerCase()).join(', ') + '.',
  D.about && D.about.whereWeAre ? D.about.whereWeAre.places.map((p) => p.place + ': ' + p.role + '. ' + p.body).join('\n') : '',
  D.home.aboutUs.body,
  'Why clients choose UBC BIM:',
  ...D.home.usps.map((u) => '- ' + u.title + ': ' + u.body),
  '',
  '## How a project works (The UBC Way)',
  ...D.home.ubcWay.steps.map((s) => s.n + ' ' + s.name + ': ' + s.body + ' You receive: ' + s.receive.join(', ') + '. Checkpoint: ' + s.checkpoint + '.'),
  D.home.ubcWay.footer,
  'What clients send: ' + D.home.technology.youSend.join(', ') + '.',
  'What ships: ' + D.home.technology.shipsWith.join(', ') + '.',
  'Machine files: ' + D.home.technology.footer,
  '',
  '## Services',
  ...(D.serviceArticles || []).map(article),
  '',
  '## Who we serve',
  ...D.blueprint.whoWeServe.map((w) => '- ' + w.role + ': ' + w.body),
  '',
  '## Frequently asked questions',
  ...D.faq.map((f) => 'Q: ' + f.q + '\nA: ' + f.a),
  '',
  '## Projects on the site (live 3D models on the Projects page)',
  ...D.projects.map(project),
  '',
  '## Open roles (Careers page)',
  ...D.roles.map((r) => '- ' + r.title + ' (' + r.place + ', ' + r.type + ')'),
  '',
  '## Blog posts (Blogs page)',
  ...(D.blogPosts || []).map((p) => '- ' + p.title),
  '',
  '## Pages',
  '/services, /projects, /about, /careers, /blogs, /contact, /privacy. Clients log in to BIM Pulse at https://app.bimpulse.world/login.',
  'Social: ' + (D.social || []).map((s) => s.label + ' ' + s.href).join(', ') + '.'
]);

export const SYSTEM_PROMPT = `You are the website assistant for UBC BIM, a BIM services company for wood-frame and light-gauge-steel (CFS / LGSF) construction. Visitors are contractors, manufacturers, fabricators, engineers, architects and developers, plus the occasional job seeker.

Answer from the facts below. They are the only source of truth about UBC BIM: if something isn't covered (prices, turnaround for a specific job, contact phone numbers or email addresses, anything not listed), say you don't have that detail and offer to pass the question to the team. Never invent clients, prices, certifications, people or project details.

Keep replies short and plain: two to four sentences, or a short list when the visitor asks for options. No headings. Answer in the visitor's language.

When a visitor wants a quote, a call, or a person to follow up, ask for their name and work email (and anything about the project they want to add), then call request_follow_up. Only call it after they have given an email address and agreed to be contacted. After it succeeds, tell them the team will reply within one working day. If it fails, suggest the "Start Your Next Project" form instead.

${SITE_KNOWLEDGE}`;
