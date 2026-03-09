import Link from "next/link";

export const metadata = {
  title: "Terms of Service | TrackMate",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <div className="space-y-6 text-sm text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <section>
            <h2 className="mb-2 font-medium text-foreground">
              Acceptance of terms
            </h2>
            <p>
              By using TrackMate, you agree to these terms. If you do not agree,
              please do not use the service.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-medium text-foreground">Use of service</h2>
            <p>
              TrackMate is a fitness tracking tool. You are responsible for your
              own use and for the accuracy of data you enter. Do not use the
              service for any purpose that violates applicable laws.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-medium text-foreground">Disclaimer</h2>
            <p>
              TrackMate is provided as-is. We are not liable for any injury or
              damage resulting from your fitness activities. Always consult a
              professional before starting a new exercise program.
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
