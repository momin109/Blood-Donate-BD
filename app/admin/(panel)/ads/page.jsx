"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, MousePointerClick } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import FormDrawer from "@/components/admin/FormDrawer";
import { Button, Card, Field, Select, Status, Switch } from "@/components/ui";
import { AD_TONES } from "@/lib/constants";
import { api } from "@/lib/client";
import { toDateInput } from "@/lib/format";

const TONE_NAMES = Object.keys(AD_TONES);

export default function AdminAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState(null);

  // GET /api/admin/ads
  const load = useCallback(async () => {
    try {
      const d = await api("/api/admin/ads");
      setAds(d.items);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  // POST /api/admin/ads, PATCH /api/admin/ads/:id
  const save = async (f) => {
    const body = {
      title: f.get("title"),
      text: f.get("text"),
      cta: f.get("cta"),
      link: f.get("link"),
      every: Number(f.get("every")) || 6,
      tone: f.get("tone"),
      start: f.get("start"),
      end: f.get("end"),
      active: f.get("active") === "on",
    };
    if (drawer === "new") await api("/api/admin/ads", { method: "POST", body });
    else await api(`/api/admin/ads/${drawer.id}`, { method: "PATCH", body });
    load();
  };
  const run = async (fn) => {
    setError("");
    try {
      await fn();
      load();
    } catch (e) {
      setError(e.message);
    }
  };
  const toggle = (a, active) => run(() => api(`/api/admin/ads/${a.id}`, { method: "PATCH", body: { active } }));
  const remove = (a) => window.confirm(`Delete the ad "${a.title}"?`) && run(() => api(`/api/admin/ads/${a.id}`, { method: "DELETE" }));

  const e = drawer && drawer !== "new" ? drawer : {};
  return (
    <>
      <PageHeader title="Advertisements" description="Ads appear in the home feed after every 5–7 posts">
        <Button onClick={() => setDrawer("new")}>
          <Plus className="h-4 w-4" />
          Create Ad
        </Button>
      </PageHeader>
      {error && <p role="alert" className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ads.map((a) => (
          <Card key={a.id} className="flex min-w-0 flex-col overflow-hidden">
            <div className={`bg-gradient-to-br ${AD_TONES[a.tone] || AD_TONES.brand} p-5 text-white`}>
              <p className="text-lg font-extrabold leading-tight">{a.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-white/85">{a.text}</p>
              <span className="mt-3 inline-flex h-8 items-center rounded-lg bg-white px-3 text-xs font-semibold text-ink">{a.cta}</span>
            </div>
            <div className="flex-1 space-y-4 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <Status tone={a.active ? "success" : "neutral"}>{a.active ? "Active" : "Paused"}</Status>
                <span className="text-xs text-ink-soft">Every {a.every} posts</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-surface p-2.5">
                  <Eye className="mx-auto h-4 w-4 text-ink-soft" />
                  <p className="mt-1 text-sm font-bold">{a.impressions.toLocaleString()}</p>
                  <p className="text-[11px] text-ink-soft">Views</p>
                </div>
                <div className="rounded-xl bg-surface p-2.5">
                  <MousePointerClick className="mx-auto h-4 w-4 text-ink-soft" />
                  <p className="mt-1 text-sm font-bold">{a.clicks.toLocaleString()}</p>
                  <p className="text-[11px] text-ink-soft">Clicks</p>
                </div>
                <div className="rounded-xl bg-surface p-2.5">
                  <p className="text-xs text-ink-soft">CTR</p>
                  <p className="mt-1 text-sm font-bold">{a.impressions ? ((a.clicks / a.impressions) * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch on={a.active} onChange={(v) => toggle(a, v)} />
                <div className="ml-auto flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setDrawer(a)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button size="sm" variant="soft" aria-label="Delete" onClick={() => remove(a)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {!ads.length && (
        <Card className="p-10 text-center text-sm text-ink-soft">{loading ? "Loading…" : "No ads yet. Create your first ad."}</Card>
      )}

      <FormDrawer
        open={!!drawer}
        onClose={() => setDrawer(null)}
        title={drawer === "new" ? "Create Ad" : "Edit Ad"}
        subtitle="Sponsored card shown in the home feed"
        submitLabel={drawer === "new" ? "Create Ad" : "Save Changes"}
        onSubmit={save}
      >
        <div key={e.id || "new"} className="space-y-4">
          <Field name="title" label="Ad Title" required placeholder="e.g. Health Checkup Package" defaultValue={e.title} />
          <Field as="textarea" rows={3} name="text" label="Description" placeholder="Short ad text" defaultValue={e.text} />
          <div className="grid gap-4 min-[420px]:grid-cols-2">
            <Field name="cta" label="Button Text" placeholder="Learn More" defaultValue={e.cta} />
            <Select name="every" label="Show Every" options={["5", "6", "7"]} defaultValue={String(e.every || 6)} />
          </div>
          <Field name="link" label="Link URL" type="url" required placeholder="https://" defaultValue={e.link} />
          <Select name="tone" label="Color" options={TONE_NAMES} defaultValue={e.tone || "brand"} />
          <div className="grid gap-4 min-[420px]:grid-cols-2">
            <Field name="start" label="Start Date" type="date" defaultValue={toDateInput(e.start)} />
            <Field name="end" label="End Date" type="date" defaultValue={toDateInput(e.end)} />
          </div>
          <label className="flex items-center gap-3 rounded-2xl bg-surface p-3.5 text-sm font-medium">
            <input type="checkbox" name="active" defaultChecked={e.active ?? true} className="h-4 w-4 accent-brand-600" />
            Active (show this ad in the feed)
          </label>
        </div>
      </FormDrawer>
    </>
  );
}
