import { ObjectId } from "mongodb";
import { getAdminPlacesCollection, getDirectoryListCollection, type DirectoryListName } from "@/lib/mongodb";

export async function loadDirectoryOptions(kind: DirectoryListName) {
  const rows = await getDirectoryListCollection(kind);
  const docs = await rows.find({}).sort({ name: 1 }).toArray();
  return docs.map((doc) => ({ id: doc.id, name: doc.name }));
}

export async function loadAdminPlace(id: string) {
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const places = await getAdminPlacesCollection();
  return places.findOne({ _id: new ObjectId(id) });
}
