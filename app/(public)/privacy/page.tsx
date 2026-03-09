import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | TrackMate",
};

export default function PrivacyPage() {
  return (
    <main className="flex flex-col items-center bg-background px-4 pt-16 pb-12">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-primary hover:underline"
        >
          ← Back
        </Link>
        <h1 className="mb-6 text-2xl font-semibold text-foreground">
          Privacy Policy
        </h1>
        <div className="space-y-6 text-sm text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <section>
            <h2 className="mb-2 font-medium text-foreground">
              Information we collect
            </h2>
            <p>
              We collect your email, name, and workout data you choose to log.
              This data is stored securely and used only to provide the service.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-medium text-foreground">How we use it</h2>
            <p>
              Your data powers your personal dashboard, stats, and buddy features.
              We do not sell or share your data with third parties.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-medium text-foreground">Cookies</h2>
            <p>
              We use session cookies for authentication and theme preference.
              These are essential for the app to function.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-medium text-foreground">Contact</h2>
            <p>
              Questions? Email{" "}
              <a
                href="mailto:dpthk2024@gmail.com"
                className="text-primary hover:underline"
              >
                dpthk2024@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
