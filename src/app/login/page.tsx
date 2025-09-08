import { AuthSection } from "@/components/AuthSection";

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      {/* replace AuthSection with functional LoginForm */}
      {/* <AuthSection /> */}
      {/* use client form component */}
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      {/* render LoginForm */}
      {/* import inline to avoid server/client boundary issues in page file */}
      {/* @ts-expect-error Async Server Component boundary */}
      <LoginFormWrapper />
    </div>
  );
}

function LoginFormWrapper() {
  // This wrapper allows rendering a client component from a server page
  // without converting the page into a client component
  const LoginForm = require("@/components/auth/LoginForm").default
  return <LoginForm />
}