export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12">
        <h1 className="text-4xl font-bold mb-6 text-gray-900">Terms of Service</h1>
        <p className="text-sm text-gray-600 mb-8">
          Last updated: January 20, 2026
        </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using RushiGo ("the Service"), you accept and agree
          to be bound by these Terms of Service. If you do not agree to these
          terms, please do not use the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          2. Description of Service
        </h2>
        <p className="mb-4">
          RushiGo is a deadline management application that helps you:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Create and manage deadlines</li>
          <li>Organize tasks by course or project</li>
          <li>Sync deadlines with Google Calendar</li>
          <li>Receive email notifications about upcoming deadlines</li>
          <li>Collaborate with teams on shared deadlines</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
        <h3 className="text-xl font-semibold mb-2">Registration</h3>
        <p className="mb-4">
          To use the Service, you must create an account by providing a valid
          email address and password.
        </p>

        <h3 className="text-xl font-semibold mb-2">Account Security</h3>
        <p className="mb-4">You are responsible for:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Maintaining the confidentiality of your password</li>
          <li>All activities that occur under your account</li>
          <li>Notifying us immediately of any unauthorized access</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          4. Google Calendar Integration
        </h2>
        <p className="mb-4">By connecting your Google Calendar:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>
            You grant RushiGo permission to create, update, and delete calendar
            events on your behalf
          </li>
          <li>
            RushiGo will only modify events that were created through the
            Service
          </li>
          <li>You can disconnect your calendar at any time</li>
          <li>
            You acknowledge that you have read and accept Google's Terms of
            Service
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
        <p className="mb-4">You agree NOT to:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Use the Service for any illegal purpose</li>
          <li>Violate any laws in your jurisdiction</li>
          <li>Infringe upon the rights of others</li>
          <li>Transmit any harmful code, viruses, or malicious software</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>
            Use automated systems to access the Service without permission
          </li>
          <li>Interfere with the proper functioning of the Service</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          6. Intellectual Property
        </h2>
        <p className="mb-4">
          The Service and its original content, features, and functionality are
          owned by RushiGo and are protected by international copyright,
          trademark, and other intellectual property laws.
        </p>
        <p className="mb-4">
          Your content (deadlines, descriptions, etc.) remains yours. By using
          the Service, you grant us a license to store and process your content
          solely for the purpose of providing the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Data and Privacy</h2>
        <p className="mb-4">
          Your use of the Service is also governed by our{" "}
          <a href="/privacy-policy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
          . Please review it to understand how we collect, use, and protect your
          data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Service Availability</h2>
        <p className="mb-4">
          We strive to provide reliable service, but we do not guarantee:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Uninterrupted or error-free operation</li>
          <li>That defects will be corrected</li>
          <li>That the Service is free from viruses or harmful components</li>
        </ul>
        <p className="mb-4">
          We reserve the right to modify or discontinue the Service at any time
          without notice.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          9. Limitation of Liability
        </h2>
        <p className="mb-4">
          To the fullest extent permitted by law, RushiGo shall not be liable
          for any indirect, incidental, special, consequential, or punitive
          damages, or any loss of profits or revenues, whether incurred directly
          or indirectly, or any loss of data, use, goodwill, or other intangible
          losses resulting from:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Your use or inability to use the Service</li>
          <li>Any unauthorized access to or use of our servers</li>
          <li>
            Any bugs, viruses, or the like that may be transmitted through the
            Service
          </li>
          <li>Any errors or omissions in any content</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Account Termination</h2>
        <p className="mb-4">
          We may terminate or suspend your account immediately, without prior
          notice, for any reason, including:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Violation of these Terms of Service</li>
          <li>Request by law enforcement or government agencies</li>
          <li>Extended periods of inactivity</li>
        </ul>
        <p className="mb-4">
          You may also delete your account at any time from the Settings page.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
        <p className="mb-4">
          We reserve the right to modify these terms at any time. We will notify
          users of any material changes by posting the new terms on this page
          and updating the "Last updated" date.
        </p>
        <p className="mb-4">
          Your continued use of the Service after changes constitutes acceptance
          of the new terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
        <p className="mb-4">
          These Terms shall be governed by and construed in accordance with
          applicable laws, without regard to conflict of law provisions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
        <p className="mb-4">
          If you have any questions about these Terms, please contact us at:
        </p>
        <p className="mb-4">
          <strong>Email:</strong> reminder.rushigo@gmail.com
        </p>
      </section>
      </div>
    </div>
  );
}
