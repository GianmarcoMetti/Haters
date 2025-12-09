export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="space-y-6 text-muted-foreground">
          <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p>
              Welcome to Haters ("we," "our," or "us"). We are committed to protecting your personal information
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you use our social media monitoring and legal services platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            <p className="mb-2">We collect information that you provide directly to us:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, and password when you register</li>
              <li><strong>Social Media Data:</strong> When you connect social media accounts (Instagram, Facebook, YouTube, TikTok),
              we collect comments and metadata from your posts/videos</li>
              <li><strong>Usage Data:</strong> Information about how you use our platform, including sync history and flag reviews</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
            <p className="mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, operate, and maintain our services</li>
              <li>Analyze comments from your social media accounts for potentially harmful content</li>
              <li>Generate legal documentation for addressing defamatory or illegal comments</li>
              <li>Improve and personalize your experience</li>
              <li>Communicate with you about our services</li>
              <li>Ensure the security and integrity of our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using Supabase (PostgreSQL database) with encryption at rest and in transit.
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Row-level security (RLS) policies ensuring users can only access their own data</li>
              <li>Encrypted OAuth tokens and access credentials</li>
              <li>Secure HTTPS connections for all data transmission</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Third-Party Services</h2>
            <p className="mb-2">We integrate with third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Social Media Platforms:</strong> Instagram, Facebook, YouTube, TikTok (for fetching comments)</li>
              <li><strong>AI Services:</strong> OpenAI (for comment classification)</li>
              <li><strong>Authentication:</strong> Supabase Auth</li>
            </ul>
            <p className="mt-2">
              These services have their own privacy policies. We recommend reviewing them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Retention</h2>
            <p>
              We retain your personal information only for as long as necessary to provide our services and fulfill
              the purposes described in this Privacy Policy. You can request deletion of your data at any time by
              visiting our <a href="/data-deletion" className="text-primary hover:underline">Data Deletion page</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights (GDPR)</h2>
            <p className="mb-2">Under GDPR, you have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Restriction:</strong> Limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Right to Object:</strong> Object to certain data processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal
              information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
              new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
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
