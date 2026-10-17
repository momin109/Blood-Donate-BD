import BrandHeader from "@/components/BrandHeader";

// Shared by Login & Registration: same branding, spacing and card design
export default function AuthShell({ title, sub, children }) {
  return (
    <div className="relative min-h-screen bg-surface">
      <div className="absolute inset-x-0 top-0 h-64 rounded-b-[2.5rem] bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 sm:h-72" />
      <div className="relative mx-auto w-full max-w-md px-4 pb-10 pt-8 sm:pt-12">
        <div className="mb-6"><BrandHeader /></div>
        <div className="rounded-[2rem] bg-white p-5 shadow-card sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-ink-soft sm:text-base">{sub}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
