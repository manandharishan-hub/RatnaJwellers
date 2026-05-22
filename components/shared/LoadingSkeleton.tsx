export function LoadingSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-[2rem] border border-slate-200 bg-slate-100 p-6" />
      ))}
    </div>
  );
}
