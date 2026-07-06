export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      <div className="mb-8 flex items-end justify-between gap-4 border-b border-[#E4E9EF] pb-6">
        <div>
          <div className="mb-2 h-3 w-24 rounded bg-[#E4E9EF]" />
          <div className="h-7 w-56 rounded bg-[#E4E9EF]" />
        </div>
        <div className="h-10 w-40 rounded-lg bg-[#E4E9EF]" />
      </div>

      <div className="mb-6 flex gap-6 border-b border-[#E4E9EF] pb-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-4 w-24 rounded bg-[#E4E9EF]" />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[#E4E9EF] bg-white p-5">
            <div className="mb-2 flex items-start justify-between gap-4">
              <div className="h-4 w-72 rounded bg-[#E4E9EF]" />
              <div className="h-5 w-20 rounded-full bg-[#E4E9EF]" />
            </div>
            <div className="h-3.5 w-96 rounded bg-[#E4E9EF]" />
          </div>
        ))}
      </div>
    </div>
  );
}