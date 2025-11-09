export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950">
      <main className="max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
