export type ContactFields = {
  business_name: string;
  business_email: string;
  subject: string;
  message: string;
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
  };
  if (!fields.business_name || !fields.business_email || !fields.subject || !fields.message) {
    return { error: "Business name, business email, subject, and message are required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.business_email)) {
    return { error: "Enter a valid business email." };
  }
  if (
    fields.business_name.length > 120 ||
    fields.business_email.length > 160 ||
    fields.subject.length > 160 ||
    fields.message.length > 4000
  ) {
    return { error: "One of those fields is too long." };
  }
  return { fields };
}
