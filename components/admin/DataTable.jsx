"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import Pagination from "@/components/admin/Pagination";

/**
 * Responsive table: real <table> on md+ screens, stacked cards on mobile.
 * columns: [{ key, label, render?(row), primary?, badge?, hideMobile? }]
 *  - primary: shown as card title on mobile · badge: shown at card top-right on mobile
 */
export default function DataTable({ columns, rows, actions, pageSize = 6, pagination = true, empty = "No records found", flat, server }) {
  // server={{ page, pages, total, pageSize, onChange }} দিলে পেজিনেশন সার্ভার করে; rows ইতিমধ্যে ওই পেজের
  const [localPage, setLocalPage] = useState(1);
  const page = server ? server.page : localPage;
  const setPage = server ? server.onChange : setLocalPage;
  const total = server ? server.total : rows.length;
  const size = server ? server.pageSize : pageSize;
  const pages = server ? server.pages : Math.max(1, Math.ceil(rows.length / pageSize));
  useEffect(() => setLocalPage(1), [rows.length]);
  const view = pagination && !server ? rows.slice((page - 1) * pageSize, page * pageSize) : rows;
  const cell = (c, r) => (c.render ? c.render(r) : r[c.key]);
  const title = columns.find((c) => c.primary) || columns[0];
  const badge = columns.find((c) => c.badge);
  const rest = columns.filter((c) => c !== title && c !== badge && !c.hideMobile);

  const body = !rows.length ? <p className="px-4 py-14 text-center text-sm text-ink-soft">{empty}</p> : (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead><tr className="bg-surface text-xs uppercase tracking-wide text-ink-soft">
            {columns.map((c) => <th key={c.key} className="whitespace-nowrap px-4 py-3 font-semibold">{c.label}</th>)}
            {actions && <th className="px-4 py-3 text-right font-semibold">Actions</th>}
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {view.map((r) => (
              <tr key={r.id} className="hover:bg-surface/60">
                {columns.map((c) => <td key={c.key} className="px-4 py-3.5 align-middle">{cell(c, r)}</td>)}
                {actions && <td className="px-4 py-3.5 text-right">{actions(r)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-gray-100 md:hidden">
        {view.map((r) => (
          <li key={r.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">{cell(title, r)}</div>
              {badge && <div className="shrink-0">{cell(badge, r)}</div>}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              {rest.map((c) => <div key={c.key} className="min-w-0"><dt className="text-xs text-ink-soft">{c.label}</dt><dd className="break-words font-medium">{cell(c, r)}</dd></div>)}
            </dl>
            {actions && <div className="mt-3 flex justify-end border-t border-gray-100 pt-2">{actions(r)}</div>}
          </li>
        ))}
      </ul>
    </>
  );
  return (
    <Card className="overflow-hidden">
      {body}
      {pagination && total > size && <Pagination page={page} pages={pages} total={total} pageSize={size} onChange={setPage} />}
    </Card>
  );
}
