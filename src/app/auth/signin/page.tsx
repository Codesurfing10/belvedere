import { Suspense } from "react";
import SignInForm from "./SignInForm";

export const metadata = {
  title: "Sign In – Belvedere",
};

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-56px)] flex items-center justify-center text-gray-400">
          Loading…
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
