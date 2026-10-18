import { DatabaseNotice } from "@/components/DatabaseNotice";
import DirectoryView from "@/components/DirectoryView";
import { listDirectorySponsors } from "@/lib/directory-sponsors";
import { listPublicPlaces } from "@/lib/public-places";

export const dynamic = "force-dynamic";

export default async function VillagesPage() {
  try {
  const [places, { main, sponsors }] = await Promise.all([
    listPublicPlaces("Village"),
    listDirectorySponsors(),
  ]);

  return (
    <main>
      <DirectoryView places={places} main={main} sponsors={sponsors} focus="Village" />
    </main>
  );
  } catch (error) {
    console.error(error);
    return <DatabaseNotice />;
  }
}
