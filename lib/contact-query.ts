export type QueryKind = "contact" | "advertise";

const contactTopics = new Set([
  "A general question",
  "A correction",
  "Suggest a place",
  "A review I disagree with",
  "Advertising",
]);

export function queryKind(doc: { kind?: string; consent?: boolean; business_type?: string }): QueryKind {
  if (doc.kind === "contact" || doc.kind === "advertise") return doc.kind;
  if (doc.consent === true) return "contact";
  if (doc.business_type && contactTopics.has(doc.business_type)) return "contact";
  return "advertise";
}

export function readQueryKind(body: unknown): QueryKind {
  if (body && typeof body === "object" && (body as { kind?: unknown }).kind === "contact") return "contact";
  return "advertise";
}

export type ContactFields = {
  business_name: string;
  business_email: string;
  subject: string;
  message: string;
  your_name: string;
  business_type: string;
  place: string;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function readContactQuery(body: unknown): { fields: ContactFields } | { error: string } {
  const source = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const fields: ContactFields = {
    business_name: text(source.business_name),
    business_email: text(source.business_email),
    subject: text(source.subject),
    message: text(source.message),
    your_name: text(source.your_name),
    business_type: text(source.business_type),
    place: text(source.place),
  };
  if (!fields.business_name || !fields.business_email || !fields.subject || !fields.message) {
    return { error: "Business name, business email, subject, and message are required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.business_email)) {
    return { error: "Enter a valid business email." };
  }
  if (
    fields.business_name.length > 120 ||
    fields.your_name.length > 120 ||
    fields.business_email.length > 160 ||
    fields.business_type.length > 80 ||
    fields.place.length > 120 ||
    fields.subject.length > 160 ||
    fields.message.length > 4000
  ) {
    return { error: "One of those fields is too long." };
  }
  return { fields };
}
