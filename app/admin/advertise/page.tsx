import { redirect } from "next/navigation";
import { ContactQueryManager, type ContactQueryRow } from "@/components/admin/ContactQueryManager";
import { getAdminSession } from "@/lib/admin-auth";
import { queryKind } from "@/lib/contact-query";
import { getContactQueriesCollection, type ContactQueryDoc } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function formatWhen(value: Date) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function toRow(doc: ContactQueryDoc): ContactQueryRow {
  return {
    id: String(doc._id),
    businessName: doc.business_name,
    yourName: doc.your_name ?? "",
    businessEmail: doc.business_email,
    subject: doc.subject,
    businessType: doc.business_type ?? "",
    place: doc.place ?? "",
    message: doc.message,
    answered: doc.answered === true,
    when: formatWhen(new Date(doc.created_at)),
  };
}

export default async function AdminAdvertisePage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const queries = await getContactQueriesCollection();
  const docs = await queries.find({}).sort({ created_at: -1 }).toArray();
  const rows = docs.filter((doc) => queryKind(doc) === "advertise").map(toRow);

  return <ContactQueryManager rows={rows} kind="advertise" />;
}
