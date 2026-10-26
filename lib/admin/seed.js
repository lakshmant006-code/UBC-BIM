// Server only: what the site publishes today (ui_kits/website/data.js), as the
// admin's starting list while no database is connected.
import { UBC_DATA } from '../../ui_kits/website/data.js';

const SEED = {
  projects: () => UBC_DATA.projects || [],
  blogs: () => UBC_DATA.blogPosts || [],
  services: () => (UBC_DATA.serviceArticles || []).map((a) => ({ ...a, page: (UBC_DATA.servicePages || {})[a.id] }))
};

export const seedEntries = (type) => SEED[type]().map((e) => ({ ...e }));
