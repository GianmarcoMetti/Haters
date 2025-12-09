export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">User Data Deletion Instructions</h1>

        <div className="space-y-6 text-muted-foreground">
          <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
            <p>
              At Haters, we respect your right to control your personal data. This page explains how you can request
              the deletion of your data collected through our platform, including data obtained via social media
              integrations (Facebook, Instagram, YouTube, TikTok).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">What Data We Store</h2>
            <p className="mb-2">When you use our Service, we store:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Email, name, password (encrypted)</li>
              <li><strong>Social Media Connections:</strong> Connected account information and OAuth tokens</li>
              <li><strong>Comments Data:</strong> Comments ingested from your social media posts/videos</li>
              <li><strong>Flags:</strong> AI-generated flags for potentially problematic comments</li>
              <li><strong>Cases:</strong> Legal case documentation you've created</li>
              <li><strong>Usage Data:</strong> Sync history, timestamps, and interaction logs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">How to Request Data Deletion</h2>

            <div className="bg-card border rounded-lg p-6 my-4">
              <h3 className="text-xl font-semibold text-foreground mb-4">Option 1: Delete From Your Dashboard (Recommended)</h3>
              <p className="mb-2">If you have an active account:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Log in to your account</li>
                <li>Navigate to <a href="/dashboard/settings" className="text-primary hover:underline">Settings</a></li>
                <li>Scroll to "Account Management"</li>
                <li>Click "Delete Account"</li>
                <li>Confirm deletion</li>
              </ol>
              <p className="mt-4 text-sm">
                <strong>Note:</strong> This will immediately and permanently delete all your data, including all connected
                accounts, comments, flags, and cases.
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6 my-4">
              <h3 className="text-xl font-semibold text-foreground mb-4">Option 2: Email Request</h3>
              <p className="mb-2">If you cannot access your account or prefer email:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Send an email to: <a href="mailto:gianmarco.rnetti.design@gmail.com" className="text-primary hover:underline">
                  gianmarco.rnetti.design@gmail.com
                </a></li>
                <li>Use the subject line: "Data Deletion Request"</li>
                <li>Include:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>The email address associated with your account</li>
                    <li>Your full name (as registered)</li>
                    <li>Confirmation that you want all data deleted</li>
                  </ul>
                </li>
              </ol>
              <p className="mt-4 text-sm">
                <strong>Response time:</strong> We will process your request within 30 days and send you a confirmation email.
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6 my-4">
              <h3 className="text-xl font-semibold text-foreground mb-4">Option 3: Disconnect Individual Social Accounts</h3>
              <p className="mb-2">To delete data from specific social media accounts only:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Log in to your account</li>
                <li>Navigate to <a href="/dashboard/accounts" className="text-primary hover:underline">Social Accounts</a></li>
                <li>Click "Disconnect" on the account you want to remove</li>
                <li>Confirm disconnection</li>
              </ol>
              <p className="mt-4 text-sm">
                <strong>Note:</strong> This will delete all comments, flags, and cases associated with that specific social
                account, but your main account will remain active.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">What Gets Deleted</h2>
            <p className="mb-2">When you request complete account deletion, we will permanently remove:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your account credentials and profile information</li>
              <li>All connected social media account data and tokens</li>
              <li>All ingested comments from your social media accounts</li>
              <li>All AI-generated flags for your comments</li>
              <li>All legal cases you've created</li>
              <li>All usage logs and sync history</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Retention After Deletion</h2>
            <p>
              After you delete your data:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Immediate:</strong> Your data is marked for deletion and becomes inaccessible</li>
              <li><strong>30 days:</strong> Data is permanently erased from our databases and backups</li>
              <li><strong>Legal retention:</strong> We may retain certain data if required by law for legal proceedings
              or regulatory compliance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Important Notes</h2>
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900 rounded-lg p-4">
              <ul className="space-y-2">
                <li>⚠️ <strong>Data deletion is permanent and cannot be undone</strong></li>
                <li>⚠️ Active legal cases in progress may require data retention until case completion</li>
                <li>⚠️ Deleting data from Haters does not delete the original comments from social media platforms</li>
                <li>⚠️ You may need to separately revoke app permissions from your social media accounts</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Revoking Social Media App Permissions</h2>
            <p className="mb-2">To completely remove Haters' access to your social media accounts:</p>

            <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Facebook/Instagram:</h3>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Go to Facebook Settings → Security and Login → Apps and Websites</li>
              <li>Find "Haters" and click Remove</li>
            </ol>

            <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">YouTube:</h3>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Go to Google Account → Security → Third-party apps with account access</li>
              <li>Find "Haters" and click Remove Access</li>
            </ol>

            <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">TikTok:</h3>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Go to TikTok Settings → Privacy → Manage Apps</li>
              <li>Find "Haters" and click Revoke</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">GDPR Rights</h2>
            <p>
              If you are in the European Union, under GDPR you also have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Access:</strong> Request a copy of all your personal data</li>
              <li><strong>Rectification:</strong> Correct any inaccurate data</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Object:</strong> Object to certain types of data processing</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, please contact us using the email above.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Questions?</h2>
            <p>
              If you have any questions about data deletion or need assistance, please contact us:
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
