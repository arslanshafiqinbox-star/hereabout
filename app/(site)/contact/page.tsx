import ContactMessageForm from "@/components/ContactMessageForm";
import { listPublicPlaces } from "@/lib/public-places";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  let places: string[] = [];
  try {
    const rows = await listPublicPlaces();
    places = rows.map((place) => place.name).sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error(error);
  }
  return <ContactMessageForm places={places} />;
}
