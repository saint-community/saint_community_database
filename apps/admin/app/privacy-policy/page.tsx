const sections = [
  {
    title: '1. Introduction',
    paragraphs: [
      'Welcome to [App Name]. Your privacy is important to us. This Privacy Policy explains how we collect, use, store, protect, and share your personal information when you use our website, web application, services, or related features.',
      'By using [App Name], you agree to the collection and use of your information in accordance with this Privacy Policy.',
    ],
  },
  {
    title: '2. Information We Collect',
    paragraphs: [
      'We may collect personal information that you provide directly to us when you create an account, fill out forms, update your profile, contact us, or use our services.',
      'The information we collect may include:',
    ],
    list: [
      'Full name',
      'Email address',
      'Phone number',
      'Residential or business address',
      'Date of birth or birthday',
      'Contact details',
      'Account login details',
      'Profile information',
      'Any other information you choose to provide',
    ],
    afterList: [
      'We may also collect technical information automatically, such as:',
    ],
    secondList: [
      'IP address',
      'Browser type',
      'Device information',
      'Operating system',
      'Pages visited',
      'Usage activity',
      'Cookies and similar tracking technologies',
    ],
  },
  {
    title: '3. How We Use Your Information',
    paragraphs: ['We use your personal information to:'],
    list: [
      'Create and manage user accounts',
      'Provide access to our web app and services',
      'Verify user identity',
      'Communicate with users',
      'Send important service updates',
      'Provide customer support',
      'Improve our website, app, and user experience',
      'Personalize your experience',
      'Maintain security and prevent fraud',
      'Comply with legal and regulatory requirements',
    ],
    afterList: [
      'We may also use your contact information to send promotional messages, newsletters, or updates, but only where permitted by law or where you have given consent. You may opt out of marketing communications at any time.',
    ],
  },
  {
    title: '4. Cookies and Tracking Technologies',
    paragraphs: [
      'We may use cookies and similar technologies to improve functionality, remember user preferences, analyze usage, and enhance security.',
      'You can disable cookies through your browser settings, but some parts of the web app may not function properly if cookies are disabled.',
    ],
  },
  {
    title: '5. How We Store and Protect Your Information',
    paragraphs: [
      'We take reasonable technical, administrative, and organizational measures to protect your personal information from unauthorized access, loss, misuse, alteration, or disclosure.',
      'These measures may include encryption, secure servers, access controls, authentication systems, and regular security reviews.',
      'However, no method of electronic transmission or storage is completely secure. We cannot guarantee absolute security, but we work to protect your information using reasonable safeguards.',
    ],
  },
  {
    title: '6. Sharing of Information',
    paragraphs: [
      'We do not sell your personal information.',
      'We may share your information with:',
    ],
    list: [
      'Service providers who help us operate our app',
      'Payment processors, where payment features are used',
      'Hosting and cloud infrastructure providers',
      'Email or SMS communication providers',
      'Analytics and security providers',
      'Legal authorities where required by law',
    ],
    afterList: [
      'These third parties are only allowed to use your information as necessary to provide services to us or comply with legal obligations.',
    ],
  },
  {
    title: '7. Data Retention',
    paragraphs: [
      'We keep your personal information only for as long as necessary to provide our services, comply with legal obligations, resolve disputes, enforce agreements, and maintain business records.',
      'When your information is no longer needed, we may delete, anonymize, or securely store it as required by law.',
    ],
  },
  {
    title: '8. Your Rights',
    paragraphs: [
      'Depending on your location and applicable law, you may have the right to:',
    ],
    list: [
      'Access the personal information we hold about you',
      'Request correction of inaccurate information',
      'Request deletion of your personal information',
      'Withdraw consent where processing is based on consent',
      'Object to certain uses of your information',
      'Request restriction of processing',
      'Request a copy of your data',
    ],
    afterList: ['To exercise these rights, contact us at [Contact Email].'],
  },
  {
    title: "9. Children's Privacy",
    paragraphs: [
      'Our web app is not intended for children under the age of [Insert Minimum Age, e.g. 13 or 18].',
      'We do not knowingly collect personal information from children. If we become aware that we have collected information from a child without proper consent, we will take steps to delete it.',
    ],
  },
  {
    title: '10. International Data Transfers',
    paragraphs: [
      'If you access our services from outside the country where our servers or service providers are located, your information may be transferred, stored, or processed in another country.',
      'By using our services, you consent to such transfer and processing, where permitted by applicable law.',
    ],
  },
  {
    title: '11. Third-Party Links',
    paragraphs: [
      'Our web app may contain links to third-party websites or services. We are not responsible for the privacy practices, content, or policies of those third-party services.',
      'We encourage you to review their privacy policies before providing personal information.',
    ],
  },
  {
    title: '12. Changes to This Privacy Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. When we make changes, we will update the effective date at the top of this page.',
      'Your continued use of the web app after changes are posted means you accept the updated Privacy Policy.',
    ],
  },
  {
    title: '13. Contact Us',
    paragraphs: [
      'If you have questions, requests, or concerns about this Privacy Policy or how your data is handled, contact us at:',
      '[Company Name]',
      'Email: [Contact Email]',
      'Address: [Company Address]',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className='min-h-screen bg-white px-5 py-12 text-gray-900'>
      <article className='mx-auto max-w-3xl space-y-8'>
        <header className='border-b border-gray-200 pb-6'>
          <p className='text-sm font-medium text-[#705C2F]'>Saint Community</p>
          <h1 className='mt-2 text-3xl font-semibold'>Privacy Policy</h1>
          <div className='mt-4 space-y-1 text-sm text-gray-500'>
            <p>Effective Date: [Insert Date]</p>
            <p>App Name: [App Name]</p>
            <p>Company/Owner: [Company Name]</p>
          </div>
        </header>

        <div className='space-y-8'>
          {sections.map((section) => (
            <section key={section.title} className='space-y-3'>
              <h2 className='text-lg font-semibold'>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className='text-sm leading-7 text-gray-700'>
                  {paragraph}
                </p>
              ))}
              {section.list ? (
                <ul className='list-disc space-y-2 pl-5 text-sm leading-7 text-gray-700'>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.afterList?.map((paragraph) => (
                <p key={paragraph} className='text-sm leading-7 text-gray-700'>
                  {paragraph}
                </p>
              ))}
              {section.secondList ? (
                <ul className='list-disc space-y-2 pl-5 text-sm leading-7 text-gray-700'>
                  {section.secondList.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
