// Says plainly whether changes can be saved yet.
export function StoreNotice({ connected }) {
  if (connected) return null;
  return (
    <div className="adm-note" role="status">
      <strong>No database is connected yet.</strong>
      <p>You can look at everything the site publishes today and fill in the editors. Save and file upload turn on once the company database is connected (lib/admin/store.js). Until then, <strong>Download JSON</strong> gives a developer exactly what to add to the site through GitHub.</p>
    </div>
  );
}
