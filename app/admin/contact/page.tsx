import { redirect } from "next/navigation";
import { ContactQueryManager, type ContactQueryRow } from "@/components/admin/ContactQueryManager";
import { getAdminSession } from "@/lib/admin-auth";
import { getContactQueriesCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function formatWhen(value: Date) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminContactPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const queries = await getContactQueriesCollection();
  const docs = await queries.find({}).sort({ created_at: -1 }).toArray();
  const rows: ContactQueryRow[] = docs.map((doc) => ({
    id: String(doc._id),
    businessName: doc.business_name,
    businessEmail: doc.business_email,
    subject: doc.subject,
    message: doc.message,
    answered: doc.answered === true,
    when: formatWhen(new Date(doc.created_at)),
  }));

  return <ContactQueryManager rows={rows} />;
}
