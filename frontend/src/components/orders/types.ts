export type OrderStatus =
  | "Processing"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled"
  | "Return Requested"
  | "Exchanged";

export interface OrderItem {
  productId: number;
  name: string;
  variant?: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface OrderTimelineStep {
  title: string;
  time: string;
  location: string;
  done: boolean;
  current?: boolean;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CustomerOrder {
  id: string;
  number: string;
  date: string;
  isoDate: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  transactionId: string;
  address: OrderAddress;
  courier: string;
  awb: string;
  expectedDelivery: string;
  timeline: OrderTimelineStep[];
  cancellationReason?: string;
  cancelledAt?: string;
  refundMethod?: string;
  refundStatus?: string;
  returnReason?: string;
  returnPickupSlot?: string;
  returnStatus?: string;
  exchangeReason?: string;
  exchangeReplacementItem?: string;
  exchangeStatus?: string;
}
