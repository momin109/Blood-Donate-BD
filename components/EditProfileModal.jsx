"use client";
import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Avatar, Button, Field, Select } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import { bloodGroups, upazilas } from "@/data";
import { DIVISION_NAMES, districtsOf } from "@/data/locations";
import { toDateInput } from "@/lib/format";
import { IMAGE_ACCEPT, uploadImage } from "@/lib/image";

// নিজের profile বদলানো → PATCH /api/donors/me
export default function EditProfileModal({ onClose }) {
  const { user, updateProfile } = useAuth();
  const [f, setF] = useState({
    name: user.name || "",
    bloodGroup: user.bloodGroup || "",
    division: user.division || "",
    district: user.district || "",
    upazila: user.upazila || "",
    area: user.area || "",
    lastDonationDate: toDateInput(user.lastDonationDate),
  });
  // photo: undefined = অপরিবর্তিত | image id = নতুন ছবি | null = মুছে ফেলা
  const [photo, setPhoto] = useState(undefined);
  const [preview, setPreview] = useState(user.photo || null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const setDivision = (e) => setF((s) => ({ ...s, division: e.target.value, district: "" }));
  const upazilaOptions = [...new Set([...upazilas, user.upazila])].filter(Boolean);
  // আগে সংরক্ষিত মান তালিকায় না থাকলেও select-এ দেখানোর জন্য
  const districtOptions = [...new Set([...districtsOf(f.division), ...(f.division === user.division ? [user.district] : [])])].filter(Boolean);

  async function pickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const d = await uploadImage(file, "avatar");
      setPhoto(d.id);
      setPreview(d.url);
    } catch (err) {
      setError(err.fieldErrors?.file || err.message);
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setErrors({});
    try {
      await updateProfile(photo === undefined ? f : { ...f, photo });
      onClose();
    } catch (err) {
      setError(err.message);
      setErrors(err.fieldErrors || {});
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <form onSubmit={onSubmit} onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-3xl bg-white p-5 shadow-card sm:rounded-3xl sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Edit Profile</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar name={f.name || user.name} src={preview} size="xl" />
            {uploading && <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></span>}
          </div>
          <div className="space-y-2">
            <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} hidden onChange={pickPhoto} />
            <Button type="button" variant="soft" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}><Camera className="h-4 w-4" />ছবি বদলান</Button>
            {preview && <button type="button" onClick={() => { setPhoto(null); setPreview(null); }} className="block text-xs font-semibold text-brand-600 hover:underline">ছবি মুছে ফেলুন</button>}
          </div>
        </div>
        <Field label="Full Name" required value={f.name} onChange={set("name")} error={errors.name} />
        <Select label="Blood Group" required options={bloodGroups} value={f.bloodGroup} onChange={set("bloodGroup")} error={errors.bloodGroup} />
        <Field label="Last Donation Date" type="date" value={f.lastDonationDate} onChange={set("lastDonationDate")} error={errors.lastDonationDate} />
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
          <Select label="Division" required options={DIVISION_NAMES} value={f.division} onChange={setDivision} error={errors.division} />
          <Select label="District" required options={districtOptions} value={f.district} onChange={set("district")} error={errors.district} />
          <Select label="Upazila" required options={upazilaOptions} value={f.upazila} onChange={set("upazila")} error={errors.upazila} />
          <Field label="Village / Area" required value={f.area} onChange={set("area")} error={errors.area} />
        </div>
        {error && <p role="alert" className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy || uploading}>{busy ? "সেভ হচ্ছে…" : "Save"}</Button>
        </div>
      </form>
    </div>
  );
}
