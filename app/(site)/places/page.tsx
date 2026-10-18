import { DatabaseNotice } from "@/components/DatabaseNotice";
import PlacesToVisitView from "@/components/PlacesToVisitView";
import { listSiteSponsors } from "@/lib/directory-sponsors";
import { listPublicVisits } from "@/lib/public-visits";

export const dynamic = "force-dynamic";

export default async function PlacesPage() {
  try {
  const [{ main, sponsors }, visits] = await Promise.all([
    listSiteSponsors("place-to-visit"),
    listPublicVisits(),
  ]);

  return (
    <main>
      <PlacesToVisitView visits={visits} main={main} sponsors={sponsors} />
    </main>
  );
  } catch (error) {
    console.error(error);
    return <DatabaseNotice />;
  }
}
