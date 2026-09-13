export type TransactionType = "credit" | "debit";
export type TransactionStatus = "completed" | "pending" | "failed";
export type TransactionCategory =
  | "topup"
  | "cashback"
  | "referral"
  | "order_payment"
  | "refund";

export interface WalletTransaction {
  id: string;
  date: string;
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  category: TransactionCategory;
  orderId?: string;
  referenceId?: string;
}

export interface ReferralFriend {
  id: string;
  name: string;
  phoneOrEmail: string;
  date: string;
  status: "rewarded" | "pending_first_order" | "joined";
  rewardAmount: number;
  orderValue?: number;
}

export interface ReferralAnalytics {
  referralCode: string;
  referralUrl: string;
  totalEarnings: number;
  completedInvites: number;
  pendingInvites: number;
  currentMilestone: {
    tierName: string;
    targetCount: number;
    currentCount: number;
    bonusAmount: number;
    progressPercent: number;
  };
  friends: ReferralFriend[];
}

export interface CouponVoucher {
  code: string;
  title: string;
  description: string;
  type: "percentage" | "flat" | "free_delivery";
  value: number;
  minSubtotal: number;
  maxDiscount?: number;
  expiry: string;
  badge?: string;
  status: "available" | "used" | "expired";
  usedOnDate?: string;
  usedOnOrderId?: string;
  discountSaved?: number;
}
