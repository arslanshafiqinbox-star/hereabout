import type Stripe from "stripe";
import { ObjectId } from "mongodb";
import { emptyPayment, isAdminEmail, isSuperAdminEmail, type PaymentDetails, type PublicUser } from "@/lib/auth-types";
import { getUsersCollection, type UserDoc } from "@/lib/mongodb";
import { getStripe } from "@/lib/stripe";

function unixToIso(value?: number | null) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function periodTimes(sub: Stripe.Subscription) {
  const item = sub.items?.data?.[0] as
    | { current_period_end?: number; current_period_start?: number }
    | undefined;
  const legacy = sub as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };
  const start = legacy.current_period_start || item?.current_period_start || null;
  const end = legacy.current_period_end || item?.current_period_end || null;
  return { start, end };
}

export function paymentFromSubscription(
  user: UserDoc,
  sub: Stripe.Subscription | null
): PaymentDetails {
  const price = sub?.items?.data?.[0]?.price;
  const times = sub ? periodTimes(sub) : { start: null, end: null };
  const end = times.end;
  const tenureActive = Boolean(end && Date.now() < end * 1000);
  const paymentStatus = tenureActive;

  if (!sub) {
    return {
      ...emptyPayment(user.paymentStatus ?? false),
      stripeCustomerId: user.stripeCustomerId ?? null,
      stripeSubscriptionId: user.stripeSubscriptionId ?? null,
    };
  }

  return {
    paymentStatus,
    plan: "Majlis organisation membership",
    amount: price?.unit_amount != null ? price.unit_amount / 100 : 10,
    currency: price?.currency ?? "gbp",
    interval: price?.recurring?.interval ?? "month",
    subscriptionStatus: sub.status,
    cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
    currentPeriodStart: unixToIso(times.start),
    currentPeriodEnd: unixToIso(end),
    canceledAt: unixToIso(sub.canceled_at),
    stripeCustomerId:
      typeof sub.customer === "string"
        ? sub.customer
        : sub.customer?.id ?? user.stripeCustomerId ?? null,
    stripeSubscriptionId: sub.id,
  };
}

export async function loadStripeSubscription(user: UserDoc) {
  if (!user.stripeSubscriptionId) return null;
  try {
    return await getStripe().subscriptions.retrieve(user.stripeSubscriptionId);
  } catch {
    return null;
  }
}

export async function syncUserPayment(user: UserDoc): Promise<{
  user: UserDoc;
  payment: PaymentDetails;
  publicUser: PublicUser;
}> {
  const sub = await loadStripeSubscription(user);
  const payment = paymentFromSubscription(user, sub);

  if (
    user.paymentStatus !== payment.paymentStatus ||
    user.stripeCustomerId !== payment.stripeCustomerId ||
    user.stripeSubscriptionId !== payment.stripeSubscriptionId
  ) {
    const users = await getUsersCollection();
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          paymentStatus: payment.paymentStatus,
          stripeCustomerId: payment.stripeCustomerId,
          stripeSubscriptionId: payment.stripeSubscriptionId,
          updated_at: new Date(),
        },
      }
    );
    user.paymentStatus = payment.paymentStatus;
    user.stripeCustomerId = payment.stripeCustomerId;
    user.stripeSubscriptionId = payment.stripeSubscriptionId;
  }

  return {
    user,
    payment,
    publicUser: toPublicUserWithPayment(user, payment),
  };
}

export function toPublicUserWithPayment(
  user: UserDoc,
  payment?: PaymentDetails
): PublicUser {
  const next = payment ?? emptyPayment(user.paymentStatus ?? false);
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    businessName: user.businessName,
    businessEmail: user.businessEmail,
    paymentStatus: next.paymentStatus,
    isAdmin: Boolean(user.isAdmin) || isAdminEmail(user.email) || isSuperAdminEmail(user.email),
    isSuperAdmin: Boolean(user.isSuperAdmin) || isSuperAdminEmail(user.email),
    payment: {
      ...next,
      stripeCustomerId: next.stripeCustomerId ?? user.stripeCustomerId ?? null,
      stripeSubscriptionId:
        next.stripeSubscriptionId ?? user.stripeSubscriptionId ?? null,
    },
    createdAt: user.created_at.toISOString(),
  };
}

export async function getUserWithPayment(userId: string) {
  const users = await getUsersCollection();
  const user = await users.findOne({ _id: new ObjectId(userId) });
  if (!user) return null;
  return syncUserPayment(user);
}
