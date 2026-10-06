// Privacy policy. Written from what the site actually does (see the comments
// in app/api/project and app/api/chat for the data paths): forms go to Zoho
// CRM, the chat assistant's messages go to Anthropic to generate replies,
// Vercel hosts the site, fonts come from Google Fonts and icons from unpkg.
// No analytics, advertising cookies or browser storage are used.
//
// The company's legal name, registered address and privacy contact are not
// on the site yet; they are marked with <Todo> so they stand out until the
// client supplies them. Retention periods are marked the same way.
import { Page, Section } from '../../ui_kits/website/shared.jsx';

export const metadata = {
  title: 'Privacy Policy | UBC BIM',
  description: 'How UBC BIM collects, uses and protects the information you share through ubcbim.com: project enquiries, careers applications and the chat assistant.',
  alternates: { canonical: '/privacy' }
};

const UPDATED = '6 October 2026';

function Todo({ children }) {
  return <mark className="ubc-todo" title="To be supplied by UBC BIM">{children}</mark>;
}

const H2 = ({ children, id }) => <h2 id={id} className="ubc-legal-h2">{children}</h2>;

export default function PrivacyPage() {
  return (
    <Section>
      <Page>
        <article className="ubc-legal">
          <div className="ubc-legal-eyebrow">Legal</div>
          <h1>Privacy Policy</h1>
          <p className="ubc-legal-meta">Last updated {UPDATED}</p>

          <p>
            This policy explains what information UBC BIM (<Todo>[company legal name]</Todo>, &ldquo;we&rdquo;) collects when you
            use this website, why we collect it, who we share it with and the choices you have. It covers the website only;
            project work we carry out for clients is governed by our contract with each client.
          </p>

          <H2 id="who">Who we are</H2>
          <p>
            UBC BIM provides BIM modelling, detailing, engineering and documentation services for wood-frame and
            light-gauge-steel construction. For the purposes of data protection law we are the controller of the personal
            information described here. Registered address: <Todo>[registered address]</Todo>. Privacy contact:{' '}
            <Todo>[privacy@ email address]</Todo>.
          </p>

          <H2 id="collect">What we collect</H2>
          <ul>
            <li><strong>Project enquiries</strong> (the Contact page and the &ldquo;Start Your Next Project&rdquo; panel): your name,
              work email, the machine or software you use, and the names of any files you select. The files themselves are not
              uploaded through the website; we send you a separate upload link.</li>
            <li><strong>Careers applications</strong>: your name, email, the role you are applying for, your note and any work-sample
              link you include.</li>
            <li><strong>Chat assistant</strong>: the messages you type. If you choose to give your name and email in the chat and ask
              us to follow up, those details are sent to us as an enquiry.</li>
            <li><strong>Technical information</strong>: like any website, our hosting provider records basic request data (IP address,
              browser type, pages requested and the time) to deliver the site and keep it secure.</li>
          </ul>
          <p>
            We do not use analytics tools, advertising cookies or tracking pixels, and the site does not store anything in your
            browser to track you.
          </p>

          <H2 id="use">How we use it</H2>
          <ul>
            <li>To reply to your enquiry and prepare a scope, price and timeline.</li>
            <li>To consider your application for a role with us.</li>
            <li>To answer your questions in the chat assistant.</li>
            <li>To operate, secure and fix the website.</li>
          </ul>
          <p>
            Where the GDPR or UK GDPR applies, we rely on our legitimate interest in responding to people who contact us, on taking
            steps at your request before entering into a contract, and, for job applications, on your request to be considered.
            We do not use your information for automated decisions that affect you, and we do not sell it.
          </p>

          <H2 id="share">Who we share it with</H2>
          <p>We use a small number of service providers who process information on our behalf:</p>
          <ul>
            <li><strong>Zoho Corporation</strong> (Zoho CRM): stores project enquiries and applications so our team can follow up.</li>
            <li><strong>Anthropic</strong>: processes chat assistant messages to generate replies. Under its commercial terms,
              Anthropic does not use these messages to train its models.</li>
            <li><strong>Vercel Inc.</strong>: hosts the website and records the technical request data described above.</li>
            <li><strong>Google Fonts</strong> and <strong>unpkg</strong>: deliver the site&rsquo;s fonts and icons; your browser
              requests these files directly, so these providers see your IP address.</li>
          </ul>
          <p>
            We may also disclose information if the law requires it, or to protect our rights, our clients or the public.
          </p>

          <H2 id="transfers">International transfers</H2>
          <p>
            Our team and our providers work in several countries, including the United States and India, so your information may be
            processed outside the country where you live. Where the law requires it, we rely on safeguards such as the European
            Commission&rsquo;s Standard Contractual Clauses.
          </p>

          <H2 id="retention">How long we keep it</H2>
          <ul>
            <li>Project enquiries: for as long as we are discussing or working on your project, then for up to{' '}
              <Todo>[number] years</Todo> for our business records.</li>
            <li>Careers applications: up to <Todo>[number] months</Todo> after the role is filled, unless you ask us to keep it longer.</li>
            <li>Chat messages: we do not store chat conversations on our own servers. Anthropic may keep them briefly under its own
              data-retention terms.</li>
            <li>Hosting request data: as set by Vercel&rsquo;s log retention.</li>
          </ul>

          <H2 id="rights">Your rights</H2>
          <p>
            Depending on where you live, you can ask us to give you a copy of your information, correct it, delete it, restrict or
            object to how we use it, or move it to another provider. California residents also have the right to know what we
            collect and to ask us to delete it; we do not sell or share personal information for advertising. To make a request,
            contact <Todo>[privacy@ email address]</Todo>. You can also complain to your local data protection authority.
          </p>

          <H2 id="children">Children</H2>
          <p>This website is for businesses and job applicants and is not directed at children under 16.</p>

          <H2 id="security">Security</H2>
          <p>
            The site is served over HTTPS, and our providers protect stored information with encryption and access controls. No
            method of transmission is completely secure, so please do not send sensitive personal information through the forms
            or the chat.
          </p>

          <H2 id="changes">Changes to this policy</H2>
          <p>
            If we change how we handle information, we will update this page and the date at the top. Significant changes will be
            highlighted on the site.
          </p>

          <H2 id="contact">Contact</H2>
          <p>
            Questions about this policy: <Todo>[privacy@ email address]</Todo>, or write to us at <Todo>[registered address]</Todo>.
          </p>
        </article>
      </Page>
    </Section>
  );
}
