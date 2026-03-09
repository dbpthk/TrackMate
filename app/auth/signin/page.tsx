import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { SignInForm } from "./SignInForm";

export const metadata = {
  title: "Sign in | TrackMate",
};

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/profile");
  }
  return <SignInForm />;
}
