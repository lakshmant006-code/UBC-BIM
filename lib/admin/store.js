/*
  Where admin changes are kept: not connected yet.

  UBC will connect its own database later, so the admin talks to storage
  only through the small interface below, and nothing else in the admin
  knows which database it is. Until a store is connected, the admin can
  list what the site publishes today and "Download JSON" for any entry
  (a developer then adds it to ui_kits/website/data.js through GitHub), but
  Save and file upload say plainly that no database is connected: nothing
  is pretended to be saved.

  To connect a database, write a module that returns this shape and return
  it from getStore():

    {
      name: 'Company database',
      async list(type)              -> [{ id, ...entry }]        // type: projects | blogs | services
      async get(type, id)           -> entry | null
      async save(type, id, entry)   -> void                      // create or replace
      async remove(type, id)        -> void
      async putFile(name, bytes, contentType) -> '/assets/...' or full URL
    }

  Entries are already validated by the time they reach the store
  (lib/admin/schema.js validateFields), and every call comes from a
  signed-in admin only.
*/
import { seedEntries } from './seed.js';

export function getStore() {
  return null;
}

export const storeConnected = () => getStore() !== null;

// The list the admin shows: the store's entries when connected, otherwise
// what the site publishes today.
export async function listEntries(type) {
  const store = getStore();
  if (store) return store.list(type);
  return seedEntries(type);
}

export async function getEntry(type, id) {
  const store = getStore();
  if (store) return store.get(type, id);
  return seedEntries(type).find((e) => e.id === id) || null;
}
