import { z } from "zod";
import { REPORT_STATUSES } from "@/lib/constants";
import { emptyToUndef, objectId } from "@/lib/validators/common";

const pageNum = (name, max, def) =>
  emptyToUndef(z.coerce.number({ invalid_type_error: `${name} must be a number` }).int().min(1).max(max)).transform((v) => v ?? def);
const oneOf = (values, label) => z.enum(values, { errorMap: () => ({ message: `Invalid ${label}` }) });

export const MAX_MESSAGE_LENGTH = 1000;

// ---- User ----
export const startChatSchema = z.object({ userId: objectId("user id") });

export const sendMessageSchema = z.object({
  text: z
    .string({ required_error: "Message is required", invalid_type_error: "Message must be text" })
    .trim()
    .min(1, "Message is required")
    .max(MAX_MESSAGE_LENGTH, `Message must be at most ${MAX_MESSAGE_LENGTH} characters`),
});

export const chatReportSchema = z.object({
  reason: z.string({ required_error: "Please tell us the reason" }).trim().min(3, "Please tell us the reason").max(300, "Reason must be at most 300 characters"),
});

// GET .../messages?before=<messageId>&after=<messageId>&limit=
export const messagesQuery = z.object({
  before: emptyToUndef(objectId("before")),
  after: emptyToUndef(objectId("after")),
  limit: pageNum("limit", 50, 30),
});

// ---- Admin ----
const adminList = { page: pageNum("page", 100000, 1), limit: pageNum("limit", 50, 10) };
export const adminChatsQuery = z.object({
  q: emptyToUndef(z.string().trim().max(80)),
  filter: emptyToUndef(oneOf(["Reported", "Locked"], "filter")),
  ...adminList,
});
export const adminChatReportsQuery = z.object({ status: emptyToUndef(oneOf(REPORT_STATUSES, "status")), ...adminList });
export const adminChatAction = z.object({ action: oneOf(["lock", "unlock"], "action") });
export const adminChatReportAction = z.object({ action: oneOf(["dismiss", "warn", "lock"], "action") });
