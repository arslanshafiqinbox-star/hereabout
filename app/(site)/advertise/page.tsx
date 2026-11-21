import ContactForm from "@/components/ContactForm";
import { listPublicPlaces } from "@/lib/public-places";

export const dynamic = "force-dynamic";

export default async function AdvertisePage() {
  let places: string[] = [];
  try {
    const rows = await listPublicPlaces();
    places = rows.map((place) => place.name).sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error(error);
  }
  return <ContactForm places={places} />;
}
