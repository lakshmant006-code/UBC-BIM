// The identifiers of UBC's Zoho CRM "Start your project" Web-to-Lead form,
// copied unchanged from the embed code Zoho generates for it. They are
// public by design (they sit in a web page's code); they only tell Zoho
// which form an enquiry belongs to. Shared by the browser form
// (ZohoLeadForm.jsx) and the chat assistant's server-side hand-off.
export const FORM_ID = '701373000010666398';
export const ZOHO = {
  action: 'https://crm.zoho.in/crm/WebToLeadForm',
  hidden: {
    xnQsjsdp: 'd724f37e1cd153679acebb4ee967c6d16b0042055f380cf8632ea6dd3f52033c',
    zc_gad: '',
    xmIwtLD: '339462cb837a08e8900c2ead0cbd34ae053457d10c1af3aeba5f0f4b7b30a415c3c6a46078b9a5e5bf2d7e889680c4e1',
    actionType: 'TGVhZHM=',
    returnURL: 'null',
    // Zoho's form code marks these "Do not remove" (visitor tracking ids).
    ldeskuid: '',
    LDTuvid: ''
  },
  honeypot: 'aG9uZXlwb3Q',
  // Zoho's own web form analytics (views and submissions per form).
  analytics: 'https://crm.zohopublic.in/crm/WebFormAnalyticsServeServlet?rid=853477faa869018734016b0ce3c9fdd4a6a0db95bc4e9083332dc3f8341f22123560e7a125d393bb7113c55893f19759gid961aa72a5dbca93ea872ac565e2f42578747261cc8ab872189d935e9ada91181gida10286e04e29071b31fc3e988701842cf57cc051fc2f7aacdc1e693d2ba844b4gid129559e858da30b391574a7c36e9bb9028638740e0974946917dda10b9bde521&tw=549be92407d3193fbcdc1de021ed70f043ac9511f5a2d56672d9de1b87097b97&version=v2',
  maxFiles: 3,
  maxBytes: 20 * 1024 * 1024
};

