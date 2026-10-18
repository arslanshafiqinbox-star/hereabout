"use client";

const sans = "var(--font-bricolage), system-ui, sans-serif";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-xl flex-col justify-center px-6 py-16">
      <h1 className="text-4xl tracking-[-0.04em]" style={{ fontFamily: sans, fontWeight: 650 }}>
        This page could not be loaded.
      </h1>
      <p className="mt-4 text-[16px] leading-relaxed" style={{ fontFamily: sans }}>
        Something failed while rendering. Reload the page, or check the server log for the digest.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 w-fit bg-black px-4 py-2.5 text-[15px] text-white"
        style={{ fontFamily: sans, fontWeight: 600 }}
      >
        Try again
      </button>
    </main>
  );
}
