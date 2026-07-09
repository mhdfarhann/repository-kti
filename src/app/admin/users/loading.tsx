export default function UsersLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6 border-b border-[#E4E9EF] pb-6">
        <div className="mb-3 h-4 w-40 rounded bg-[#E4E9EF]" />
        <div className="mb-2 h-3 w-24 rounded bg-[#E4E9EF]" />
        <div className="mb-2 h-7 w-80 rounded bg-[#E4E9EF]" />
        <div className="h-4 w-64 rounded bg-[#E4E9EF]" />
      </div>

      {/* Stat cards skeleton */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#E4E9EF] bg-[#F7F9FB] p-4"
          >
            <div className="mb-2 h-4 w-4 rounded bg-[#E4E9EF]" />
            <div className="mb-2 h-6 w-10 rounded bg-[#E4E9EF]" />
            <div className="h-3 w-16 rounded bg-[#E4E9EF]" />
          </div>
        ))}
      </div>

      {/* Search skeleton */}
      <div className="mb-4 h-10 w-full rounded-xl border border-[#E4E9EF] bg-[#F7F9FB]" />

      {/* Tabs skeleton */}
      <div className="mb-6 flex gap-6 border-b border-[#E4E9EF] pb-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-4 w-24 rounded bg-[#E4E9EF]" />
        ))}
      </div>

      {/* User rows skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-[#E4E9EF] bg-white px-5 py-4"
          >
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-4 w-44 rounded bg-[#E4E9EF]" />
                <div className="h-4 w-16 rounded-full bg-[#E4E9EF]" />
              </div>
              <div className="h-3.5 w-72 rounded bg-[#E4E9EF]" />
            </div>
            <div className="flex gap-2">
              <div className="h-7 w-12 rounded-lg bg-[#E4E9EF]" />
              <div className="h-7 w-14 rounded-lg bg-[#E4E9EF]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
