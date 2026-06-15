import { Suspense } from "react";
import AccountClient from "./AccountClient";

// useSearchParams() inside AccountClient requires a Suspense boundary.
// Next.js will statically render this page shell and stream in the
// client component once the JS bundle hydrates. Without Suspense,
// Next.js throws at build time:
//   "useSearchParams() should be wrapped in a suspense boundary"

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 sm:px-8 lg:px-14 py-6 sm:py-10 lg:py-12">
          <div className="h-8 w-48 rounded-sm bg-[#EDE9DC] animate-pulse mb-4" />
          <div className="h-12 w-64 rounded-sm bg-[#EDE9DC] animate-pulse" />
        </div>
      }
    >
      <AccountClient />
    </Suspense>
  );
}
