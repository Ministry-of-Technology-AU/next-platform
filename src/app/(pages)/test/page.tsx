// app/page.tsx
function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function Page() {
  // Simulate 5s data fetch
  await wait(5000);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Main Page Loaded ✅</h1>
    </div>
  );
}
