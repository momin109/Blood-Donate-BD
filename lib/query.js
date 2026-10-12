// Query-string ও pagination helper
export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const parseQuery = (req, schema) =>
  schema.parse(Object.fromEntries(new URL(req.url).searchParams));

export const pagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});
