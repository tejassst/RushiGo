export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12">
        <h1 className="text-4xl font-bold mb-6 text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">
          Last updated: January 20, 2026
        </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-4">
          Welcome to RushiGo ("we," "our," or "us"). We respect your privacy and
          are committed to protecting your personal data. This privacy policy
          explains how we collect, use, and safeguard your information when you
          use our deadline management application.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          2. Information We Collect
        </h2>
        <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Email address (for account creation and login)</li>
          <li>Name (optional, for personalization)</li>
          <li>Password (encrypted and stored securely)</li>
        </ul>

        <h3 className="text-xl font-semibold mb-2">Deadline Information</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Deadline titles, descriptions, and due dates</li>
          <li>Course or project information</li>
          <li>Priority levels and estimated completion time</li>
        </ul>

        <h3 className="text-xl font-semibold mb-2">Google Calendar Data</h3>
        <p className="mb-4">
          If you choose to connect your Google Calendar, we access and store:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>OAuth tokens to access your calendar (stored encrypted)</li>
          <li>
            Calendar event data (only for deadlines you create in RushiGo)
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          3. How We Use Your Information
        </h2>
        <ul className="list-disc pl-6 mb-4">
          <li>To provide and maintain our deadline management service</li>
          <li>To sync your deadlines with your Google Calendar (if enabled)</li>
          <li>
            To send you email notifications about upcoming or overdue deadlines
          </li>
          <li>To improve our service and develop new features</li>
          <li>To communicate with you about updates or important changes</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          4. Google Calendar Integration
        </h2>
        <p className="mb-4">
          When you connect your Google Calendar to RushiGo:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>We request permission to read and write calendar events</li>
          <li>
            We only create, update, or delete events that you explicitly create
            through RushiGo
          </li>
          <li>
            We do not access any other calendar events or personal information
          </li>
          <li>
            You can disconnect your calendar at any time from the Settings page
          </li>
          <li>
            When disconnected, we immediately delete all stored calendar tokens
          </li>
        </ul>
        <p className="mb-4">
          <strong>
            RushiGo's use of information received from Google APIs adheres to
            the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </strong>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
        <p className="mb-4">
          We implement appropriate security measures to protect your data:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>All data transmissions are encrypted using HTTPS/TLS</li>
          <li>Passwords are hashed using industry-standard algorithms</li>
          <li>OAuth tokens are encrypted before storage</li>
          <li>Access to our database is restricted and monitored</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
        <p className="mb-4">
          We retain your information for as long as your account is active. When
          you delete your account:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>All personal information is permanently deleted</li>
          <li>All deadlines and associated data are removed</li>
          <li>Calendar tokens are immediately revoked and deleted</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
        <p className="mb-4">You have the right to:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your account and data</li>
          <li>Export your data</li>
          <li>Disconnect third-party integrations (Google Calendar)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Third-Party Services</h2>
        <p className="mb-4">RushiGo integrates with:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>
            <strong>Google Calendar API</strong> - For calendar synchronization
          </li>
          <li>
            <strong>Gmail API</strong> - For sending email notifications
          </li>
        </ul>
        <p className="mb-4">
          These services have their own privacy policies. We only share data
          necessary for the specific functionality you've enabled.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          9. Changes to This Policy
        </h2>
        <p className="mb-4">
          We may update this privacy policy from time to time. We will notify
          you of any changes by posting the new policy on this page and updating
          the "Last updated" date.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
        <p className="mb-4">
          If you have questions about this privacy policy or our data practices,
          please contact us at:
        </p>
        <p className="mb-4">
          <strong>Email:</strong> reminder.rushigo@gmail.com
        </p>
      </section>
      </div>
    </div>
  );
}
