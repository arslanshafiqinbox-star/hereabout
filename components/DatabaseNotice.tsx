const sans = "var(--font-bricolage), system-ui, sans-serif";

export function DatabaseNotice() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-xl flex-col justify-center px-6 py-16">
      <h1 className="text-4xl tracking-[-0.04em]" style={{ fontFamily: sans, fontWeight: 650 }}>
        This page could not be loaded.
      </h1>
      <p className="mt-4 text-[16px] leading-relaxed" style={{ fontFamily: sans }}>
        The database did not respond. On the host, set MONGODB_URI and redeploy.
      </p>
    </main>
  );
}
