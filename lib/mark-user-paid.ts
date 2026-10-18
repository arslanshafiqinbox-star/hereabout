import { ObjectId } from "mongodb";
import { getUsersCollection } from "@/lib/mongodb";
import { toPublicUser, type PublicUser } from "@/lib/auth";

export async function markUserPaid(
  userId: string,
  stripe?: { customerId?: string | null; subscriptionId?: string | null }
): Promise<PublicUser | null> {
  const users = await getUsersCollection();
  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    {
      $set: {
        paymentStatus: true,
        updated_at: new Date(),
        ...(stripe?.customerId ? { stripeCustomerId: stripe.customerId } : {}),
        ...(stripe?.subscriptionId
          ? { stripeSubscriptionId: stripe.subscriptionId }
          : {}),
      },
    },
    { returnDocument: "after" }
  );

  if (!result) return null;
  return toPublicUser(result);
}
