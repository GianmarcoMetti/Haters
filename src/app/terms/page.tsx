export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

        <div className="space-y-6 text-muted-foreground">
          <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Haters ("the Service"), you accept and agree to be bound by the terms and
              provisions of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
            <p>
              Haters is a platform that helps social media users identify, flag, and legally address potentially
              defamatory, offensive, or illegal comments on their content. The Service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Social media account integration (Instagram, Facebook, YouTube, TikTok)</li>
              <li>Automated comment ingestion and monitoring</li>
              <li>AI-powered comment classification for potential legal violations</li>
              <li>Legal case documentation generation</li>
              <li>Dashboard for managing flagged content and cases</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-semibold text-foreground mb-2">3.1 Registration</h3>
            <p>
              To use certain features of the Service, you must register for an account. You agree to provide accurate,
              current, and complete information during registration and to update such information to keep it accurate,
              current, and complete.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">3.2 Account Security</h3>
            <p>
              You are responsible for safeguarding your password and for all activities that occur under your account.
              You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Social Media Integration</h2>
            <p>
              By connecting your social media accounts to the Service:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>You authorize us to access and collect comments and metadata from your connected accounts</li>
              <li>You represent that you have the right to grant us access to this data</li>
              <li>You understand that we will store and analyze this data according to our Privacy Policy</li>
              <li>You can disconnect your accounts at any time from your dashboard</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Acceptable Use</h2>
            <h3 className="text-xl font-semibold text-foreground mb-2">5.1 Permitted Use</h3>
            <p>
              You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use
              the Service:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>In any way that violates any applicable law or regulation</li>
              <li>To engage in any conduct that restricts or inhibits anyone's use of the Service</li>
              <li>To impersonate or attempt to impersonate another user or person</li>
              <li>To harass, abuse, or harm another person</li>
              <li>To upload or transmit viruses or any other malicious code</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">5.2 Prohibited Use</h3>
            <p>
              You may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Attempt to gain unauthorized access to the Service or its related systems</li>
              <li>Use the Service to monitor comments on accounts you don't own or have permission to monitor</li>
              <li>Abuse, manipulate, or circumvent the AI classification system</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. AI Classification and Legal Services</h2>
            <h3 className="text-xl font-semibold text-foreground mb-2">6.1 AI-Powered Analysis</h3>
            <p>
              Our Service uses artificial intelligence to classify comments. While we strive for accuracy, the AI
              classification is not perfect and should not be considered legal advice.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">6.2 Not Legal Advice</h3>
            <p>
              The Service provides tools to help you identify and document potentially problematic comments.
              <strong> The Service does not constitute legal advice.</strong> You should consult with qualified legal
              professionals before taking any legal action.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">6.3 User Responsibility</h3>
            <p>
              You are solely responsible for reviewing and approving any flags before creating legal cases. We do not
              guarantee the outcome of any legal proceedings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Fees and Payment</h2>
            <p>
              The Service operates on a success-fee based model. Specific pricing and payment terms will be provided
              separately and may vary based on jurisdiction and case complexity. By using paid features, you agree to
              pay all applicable fees.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by Haters and are protected
              by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
              IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL HATERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior notice or
              liability, for any reason, including if you breach these Terms. Upon termination, your right to use the
              Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Italy, without regard to
              its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
              provide at least 30 days' notice prior to any new terms taking effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">14. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="mt-2">
              Email: <a href="mailto:gianmarco.rnetti.design@gmail.com" className="text-primary hover:underline">
                gianmarco.rnetti.design@gmail.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t">
          <a href="/" className="text-primary hover:underline">← Back to Home</a>
        </div>
      </div>
    </div>
  )
}
