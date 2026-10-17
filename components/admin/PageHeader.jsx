export default function PageHeader({ title, description, children }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0"><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>{description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}</div>
      {children && <div className="flex flex-wrap gap-2.5">{children}</div>}
    </div>
  );
}
