// Browser-side API helper — সব frontend fetch এই ফাইল দিয়ে যায়।
// Backend response: { success, message, data } | { success:false, message, errors:[{field,message}] }
export class ApiClientError extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
    // { phone: "…", password: "…" } — form-এর field-এর নিচে দেখানোর জন্য
    this.fieldErrors = Object.fromEntries(errors.filter((e) => e.field).map((e) => [e.field, e.message]));
  }
}

export async function api(path, { method = "GET", body, params } = {}) {
  let url = path;
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    });
    const s = qs.toString();
    if (s) url += (url.includes("?") ? "&" : "?") + s;
  }

  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  let res;
  try {
    res = await fetch(url, {
      method,
      // FormData (ছবি আপলোড) হলে browser নিজেই Content-Type বসায়
      headers: body && !isForm ? { "Content-Type": "application/json" } : undefined,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
      cache: "no-store",
      credentials: "same-origin",
    });
  } catch {
    throw new ApiClientError(0, "নেটওয়ার্ক সমস্যা। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।");
  }

  let json = null;
  try {
    json = await res.json();
  } catch {}
  if (!res.ok || json?.success === false) {
    throw new ApiClientError(res.status, json?.message || "কিছু একটা ভুল হয়েছে", json?.errors);
  }
  return json?.data ?? null;
}
