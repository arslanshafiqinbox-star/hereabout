import DirectoryView from "@/components/DirectoryView";
import { listDirectorySponsors } from "@/lib/directory-sponsors";
import { listPublicPlaces } from "@/lib/public-places";

export const dynamic = "force-dynamic";

export default async function DirectoryPage() {
  const [places, { main, sponsors }] = await Promise.all([listPublicPlaces(), listDirectorySponsors()]);

  return (
    <main>
      <DirectoryView places={places} main={main} sponsors={sponsors} />
    </main>
  );
}
