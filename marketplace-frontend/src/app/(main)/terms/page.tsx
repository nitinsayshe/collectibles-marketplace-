const LAST_UPDATED = 'September 2026';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using Collectibles Marketplace ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Platform. We reserve the right to update these terms at any time. Continued use after changes constitutes acceptance.`,
  },
  {
    title: '2. Eligibility',
    body: `You must be at least 18 years old to create an account and use the Platform. By registering, you confirm that all information you provide is accurate and that you are legally permitted to enter into this agreement.`,
  },
  {
    title: '3. User Accounts',
    body: `You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorised use of your account. We are not liable for any loss resulting from unauthorised use of your account caused by your failure to safeguard your credentials.`,
  },
  {
    title: '4. Listings and Content',
    body: `You are solely responsible for the accuracy of your listings. You must not post items that are counterfeit, illegal, or prohibited. Listings must include honest condition grading and accurate descriptions. We reserve the right to remove any listing that violates these terms without prior notice.`,
  },
  {
    title: '5. Transactions',
    body: `The Platform facilitates connections between buyers and sellers. We are not a party to any transaction between users. Payment, delivery, and dispute resolution are the sole responsibility of the parties involved. We strongly recommend using secure, traceable payment methods and documented shipping.`,
  },
  {
    title: '6. Prohibited Conduct',
    body: `You agree not to: use the Platform for any unlawful purpose; post false, misleading, or fraudulent content; harass, threaten, or abuse other users; attempt to circumvent any security or access controls; scrape or copy content without permission; or use automated tools to interact with the Platform.`,
  },
  {
    title: '7. Intellectual Property',
    body: `All content, branding, and software on the Platform is the property of Collectibles Marketplace or its licensors. You may not reproduce, distribute, or create derivative works without our express written permission. You grant us a non-exclusive, royalty-free licence to display content you post on the Platform.`,
  },
  {
    title: '8. Limitation of Liability',
    body: `To the maximum extent permitted by law, Collectibles Marketplace is not liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform, including losses arising from transactions between users, loss of data, or reliance on user-generated content.`,
  },
  {
    title: '9. Termination',
    body: `We may suspend or terminate your account at our discretion if you violate these terms or engage in conduct harmful to other users or the Platform. You may delete your account at any time. Upon termination, your right to use the Platform ceases immediately.`,
  },
  {
    title: '10. Governing Law',
    body: `These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.`,
  },
  {
    title: '11. Contact',
    body: `For questions about these Terms, please contact us at legal@collectibles.market.`,
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Terms & Conditions</h1>
        <p className="text-sm text-gray-400">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-8 leading-relaxed">
          Please read these Terms and Conditions carefully before using the Collectibles Marketplace platform. These terms govern your access to and use of our website and services.
        </p>

        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h2>
              <p className="text-gray-600 leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
