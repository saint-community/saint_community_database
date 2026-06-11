const sections = [
  {
    title: '1. Introduction',
    paragraphs: [
      'These Terms and Conditions govern your access to and use of [App Name], including our website, web application, services, features, and related content.',
      'By creating an account, accessing, or using [App Name], you agree to be bound by these Terms. If you do not agree, you should not use the service.',
    ],
  },
  {
    title: '2. Eligibility',
    paragraphs: [
      'To use [App Name], you must be at least [Insert Minimum Age] years old or have permission from a parent or legal guardian.',
      'By using the service, you confirm that the information you provide is accurate and that you have the legal capacity to enter into these Terms.',
    ],
  },
  {
    title: '3. User Accounts',
    paragraphs: [
      'To access certain features, you may be required to create an account.',
      'You agree to:',
    ],
    list: [
      'Provide accurate and complete information',
      'Keep your login details secure',
      'Update your information when necessary',
      'Accept responsibility for all activity under your account',
      'Notify us immediately of unauthorized account access',
    ],
    afterList: [
      'We reserve the right to suspend or terminate accounts that contain false information, violate these Terms, or are used in a harmful or unlawful way.',
    ],
  },
  {
    title: '4. Collection of Personal Information',
    paragraphs: [
      'By using our service, you understand that we may collect personal information such as your name, email address, phone number, address, birthday, and other contact details.',
      'Our collection and use of personal information is explained in our Privacy Policy.',
    ],
  },
  {
    title: '5. Acceptable Use',
    paragraphs: ['You agree not to use [App Name] to:'],
    list: [
      'Violate any law or regulation',
      'Submit false, misleading, or fraudulent information',
      'Harm, threaten, abuse, or harass others',
      'Attempt to gain unauthorized access to our systems',
      'Upload malware, viruses, or harmful code',
      'Interfere with the security or performance of the app',
      'Copy, modify, or misuse our content or software',
      'Use the service for spam or unauthorized marketing',
      'Collect information about other users without permission',
    ],
    afterList: [
      'We may suspend or terminate access if we believe you have violated these rules.',
    ],
  },
  {
    title: '6. User Content',
    paragraphs: [
      'If the app allows you to submit, upload, or share content, you remain responsible for the content you provide.',
      'You confirm that you have the right to submit such content and that it does not violate the rights of others.',
      'We may remove content that violates these Terms, our policies, or applicable law.',
    ],
  },
  {
    title: '7. Service Availability',
    paragraphs: [
      'We aim to keep [App Name] available and functional, but we do not guarantee that the service will always be uninterrupted, secure, or error-free.',
      'We may update, modify, suspend, or discontinue parts of the service at any time without liability.',
    ],
  },
  {
    title: '8. Intellectual Property',
    paragraphs: [
      'All rights, title, and interest in [App Name], including design, branding, text, graphics, software, features, and content, belong to [Company Name] or its licensors.',
      'You may not copy, reproduce, distribute, modify, sell, or exploit any part of the service without written permission.',
    ],
  },
  {
    title: '9. Payments',
    paragraphs: [
      'If the web app includes paid services, subscriptions, or purchases, you agree to provide accurate payment information and pay all applicable fees.',
      'Payment terms, billing cycles, refunds, and cancellations will be displayed at the point of purchase or in a separate payment policy, where applicable.',
    ],
  },
  {
    title: '10. Termination',
    paragraphs: [
      'We may suspend or terminate your account or access to the service if:',
    ],
    list: [
      'You violate these Terms',
      'You misuse the app',
      'You provide false information',
      'We are required to do so by law',
      'Continued access may cause harm to us, users, or third parties',
    ],
    afterList: ['You may stop using the service at any time.'],
  },
  {
    title: '11. Disclaimer',
    paragraphs: [
      'The service is provided on an "as is" and "as available" basis.',
      'We do not guarantee that the service will meet your expectations, be free from errors, or always be available.',
      'To the maximum extent permitted by law, we disclaim all warranties, whether express or implied.',
    ],
  },
  {
    title: '12. Limitation of Liability',
    paragraphs: [
      'To the maximum extent permitted by law, [Company Name] shall not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the service.',
      'This includes loss of data, loss of profits, service interruptions, unauthorized access, or other damages related to your use of the app.',
    ],
  },
  {
    title: '13. Indemnification',
    paragraphs: [
      'You agree to indemnify and hold harmless [Company Name], its owners, employees, partners, and service providers from claims, losses, damages, liabilities, and expenses arising from:',
    ],
    list: [
      'Your use of the service',
      'Your violation of these Terms',
      'Your violation of any law',
      "Your violation of another person's rights",
    ],
  },
  {
    title: '14. Privacy',
    paragraphs: [
      'Your use of [App Name] is also governed by our Privacy Policy, which explains how we collect, use, store, and protect your personal information.',
    ],
  },
  {
    title: '15. Changes to These Terms',
    paragraphs: [
      'We may update these Terms from time to time. When changes are made, we will update the effective date at the top of this page.',
      'Your continued use of the service after updates means you accept the revised Terms.',
    ],
  },
  {
    title: '16. Governing Law',
    paragraphs: [
      'These Terms shall be governed by the laws of [Insert Jurisdiction], unless otherwise required by applicable law.',
      'Any disputes shall be handled in the courts or dispute resolution bodies located in [Insert Jurisdiction].',
    ],
  },
  {
    title: '17. Contact Us',
    paragraphs: [
      'If you have questions about these Terms, contact us at:',
      '[Company Name]',
      'Email: [Contact Email]',
      'Address: [Company Address]',
    ],
  },
];

export default function TermsPage() {
  return (
    <main className='min-h-screen bg-white px-5 py-12 text-gray-900'>
      <article className='mx-auto max-w-3xl space-y-8'>
        <header className='border-b border-gray-200 pb-6'>
          <p className='text-sm font-medium text-[#705C2F]'>Saint Community</p>
          <h1 className='mt-2 text-3xl font-semibold'>Terms and Conditions</h1>
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
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
