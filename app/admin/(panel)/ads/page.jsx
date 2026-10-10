"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, MousePointerClick } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import FormDrawer from "@/components/admin/FormDrawer";
import { Button, Card, Field, Select, Status, Switch } from "@/components/ui";
import { adminAds } from "@/data/admin";

export default function AdminAds() {
  const [ads, setAds] = useState(adminAds);
  const [drawer, setDrawer] = useState(null);
  const save = (f) => {
    const v = Object.fromEntries(f.entries());
    const data = {
      ...v,
      every: Number(v.every) || 6,
      active: f.get("active") === "on",
    };
    if (drawer === "new")
      setAds((l) => [
        {
          id: Date.now(),
          impressions: 0,
          clicks: 0,
          tone: "from-brand-600 to-brand-400",
          ...data,
        },
        ...l,
      ]);
    else
      setAds((l) => l.map((a) => (a.id === drawer.id ? { ...a, ...data } : a)));
  };
  const e = drawer && drawer !== "new" ? drawer : {};
  return (
    <>
      <PageHeader
        title="Advertisements"
        description="Ads appear in the home feed after every 5–7 posts"
      >
        <Button onClick={() => setDrawer("new")}>
          <Plus className="h-4 w-4" />
          Create Ad
        </Button>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ads.map((a) => (
          <Card key={a.id} className="flex min-w-0 flex-col overflow-hidden">
            <div className={`bg-gradient-to-br ${a.tone} p-5 text-white`}>
              <p className="text-lg font-extrabold leading-tight">{a.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-white/85">
                {a.text}
              </p>
              <span className="mt-3 inline-flex h-8 items-center rounded-lg bg-white px-3 text-xs font-semibold text-ink">
                {a.cta}
              </span>
            </div>
            <div className="flex-1 space-y-4 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <Status tone={a.active ? "success" : "neutral"}>
                  {a.active ? "Active" : "Paused"}
                </Status>
                <span className="text-xs text-ink-soft">
                  Every {a.every} posts
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-surface p-2.5">
                  <Eye className="mx-auto h-4 w-4 text-ink-soft" />
                  <p className="mt-1 text-sm font-bold">
                    {a.impressions.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-ink-soft">Views</p>
                </div>
                <div className="rounded-xl bg-surface p-2.5">
                  <MousePointerClick className="mx-auto h-4 w-4 text-ink-soft" />
                  <p className="mt-1 text-sm font-bold">
                    {a.clicks.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-ink-soft">Clicks</p>
                </div>
                <div className="rounded-xl bg-surface p-2.5">
                  <p className="text-xs text-ink-soft">CTR</p>
                  <p className="mt-1 text-sm font-bold">
                    {a.impressions
                      ? ((a.clicks / a.impressions) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  on={a.active}
                  onChange={(v) =>
                    setAds((l) =>
                      l.map((x) => (x.id === a.id ? { ...x, active: v } : x)),
                    )
                  }
                />
                <div className="ml-auto flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDrawer(a)}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="soft"
                    aria-label="Delete"
                    onClick={() =>
                      setAds((l) => l.filter((x) => x.id !== a.id))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {!ads.length && (
        <Card className="p-10 text-center text-sm text-ink-soft">
          No ads yet. Create your first ad.
        </Card>
      )}

      <FormDrawer
        open={!!drawer}
        onClose={() => setDrawer(null)}
        title={drawer === "new" ? "Create Ad" : "Edit Ad"}
        subtitle="Static ad shown in the feed"
        submitLabel={drawer === "new" ? "Create Ad" : "Save Changes"}
        onSubmit={save}
      >
        <div key={e.id || "new"} className="space-y-4">
          <Field
            name="title"
            label="Ad Title"
            required
            placeholder="e.g. Health Checkup Package"
            defaultValue={e.title}
          />
          <Field
            as="textarea"
            rows={3}
            name="text"
            label="Description"
            placeholder="Short ad text"
            defaultValue={e.text}
          />
          <div className="grid gap-4 min-[420px]:grid-cols-2">
            <Field
              name="cta"
              label="Button Text"
              placeholder="Learn More"
              defaultValue={e.cta}
            />
            <Select
              name="every"
              label="Show Every"
              options={["5", "6", "7"]}
              defaultValue={String(e.every || 6)}
            />
          </div>
          <Field
            name="link"
            label="Link URL"
            type="url"
            placeholder="https://"
            defaultValue={e.link}
          />
          <div className="grid gap-4 min-[420px]:grid-cols-2">
            <Field
              name="start"
              label="Start Date"
              type="date"
              defaultValue={e.start}
            />
            <Field
              name="end"
              label="End Date"
              type="date"
              defaultValue={e.end}
            />
          </div>
          <label className="flex items-center gap-3 rounded-2xl bg-surface p-3.5 text-sm font-medium">
            <input
              type="checkbox"
              name="active"
              defaultChecked={e.active ?? true}
              className="h-4 w-4 accent-brand-600"
            />
            Active (show this ad in the feed)
          </label>
        </div>
      </FormDrawer>
    </>
  );
}
