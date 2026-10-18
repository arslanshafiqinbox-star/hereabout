export type PaymentDetails = {
  paymentStatus: boolean;
  plan: string | null;
  amount: number | null;
  currency: string | null;
  interval: string | null;
  subscriptionStatus: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
};

export const ADMIN_EMAILS = ["mk0906145@gmail.com"] as const;
export const SUPER_ADMIN_EMAILS = ["mk0906145@gmail.com"] as const;

export function isAdminEmail(email: string) {
  return ADMIN_EMAILS.includes(
    email.trim().toLowerCase() as (typeof ADMIN_EMAILS)[number]
  );
}

export function isSuperAdminEmail(email: string) {
  return SUPER_ADMIN_EMAILS.includes(
    email.trim().toLowerCase() as (typeof SUPER_ADMIN_EMAILS)[number]
  );
}

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  businessName: string;
  businessEmail: string | null;
  paymentStatus: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  payment: PaymentDetails;
  createdAt: string;
};

export function emptyPayment(paymentStatus = false): PaymentDetails {
  return {
    paymentStatus,
    plan: null,
    amount: null,
    currency: null,
    interval: null,
    subscriptionStatus: null,
    cancelAtPeriodEnd: false,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    canceledAt: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
  };
}
