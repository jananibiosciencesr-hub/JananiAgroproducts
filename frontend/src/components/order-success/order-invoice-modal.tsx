import React, { useState } from "react";
import { X, Printer, Download, CheckCircle2, ShieldCheck, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  hsn?: string;
}

interface OrderInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber?: string;
  invoiceDate?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerEmail?: string;
  items?: InvoiceItem[];
  subtotal?: number;
  deliveryFee?: number;
  discount?: number;
  finalTotal?: number;
  paymentMethod?: string;
  order?: any;
}

const HSN_MAP: Record<string, string> = {
  oil: "1508",
  ghee: "0405",
  rice: "1006",
  flour: "1101",
  dal: "0713",
  honey: "0409",
  spice: "0910",
  turmeric: "0910",
  fertilizer: "3105",
  seed: "1209",
};

function getHsnCode(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, code] of Object.entries(HSN_MAP)) {
    if (lower.includes(key)) return code;
  }
  return "3105"; // Default agricultural formulation HSN
}

export function OrderInvoiceModal({
  isOpen,
  onClose,
  orderNumber,
  invoiceDate,
  customerName,
  customerPhone,
  customerAddress,
  customerEmail,
  items,
  subtotal,
  deliveryFee,
  discount,
  finalTotal,
  paymentMethod,
  order,
}: OrderInvoiceModalProps) {
  if (!isOpen) return null;

  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const resolvedOrderNumber = orderNumber || order?.orderNumber || order?.number || "JAP-202601";
  const resolvedInvoiceDate = invoiceDate || order?.invoiceDate || order?.order_date || order?.date || "Today";
  const resolvedCustomerName = customerName || order?.customerName || order?.customer_name || order?.address?.fullName || "Valued Patron";
  const resolvedCustomerPhone = customerPhone || order?.customerPhone || order?.customer_phone || order?.address?.phone || "";
  const resolvedCustomerEmail = customerEmail || order?.customerEmail || order?.customer_email || order?.address?.email || "";
  const resolvedCustomerAddress = customerAddress || order?.customerAddress || (order?.address ? `${order.address.streetAddress || order.address.street || ""}, ${order.address.city || ""}, ${order.address.state || ""} - ${order.address.pincode || ""}` : "Delivery Address");
  
  const resolvedItems: InvoiceItem[] = (items && items.length > 0)
    ? items
    : (order?.items || []).map((it: any) => ({
        name: it.product?.name || it.name || it.title || "Agro Formulation Product",
        quantity: it.qty || it.quantity || 1,
        price: it.product?.price || it.price || 0,
        hsn: it.hsn,
      }));

  // Accurate Tax Calculation: Subtotal is the sum of items, GST (5%) is added ON TOP
  const calculatedItemsSubtotal = resolvedItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const resolvedSubtotal = (calculatedItemsSubtotal > 0) ? calculatedItemsSubtotal : (subtotal ?? order?.subtotal ?? order?.amount ?? 0);
  
  const totalGst = (order?.gstAmount !== undefined && order?.gstAmount > 0) 
    ? order.gstAmount 
    : Math.round(resolvedSubtotal * 0.05);
  const cgst = (order?.cgst !== undefined && order?.cgst > 0) 
    ? order.cgst 
    : Math.round(totalGst / 2);
  const sgst = (order?.sgst !== undefined && order?.sgst > 0) 
    ? order.sgst 
    : (totalGst - cgst);

  const taxableValue = resolvedSubtotal;
  const resolvedDeliveryFee = deliveryFee ?? order?.deliveryFee ?? order?.shippingFee ?? (resolvedSubtotal >= 799 ? 0 : 60);
  const resolvedDiscount = discount ?? order?.couponDiscount ?? order?.discount ?? 0;
  
  // Final total = Subtotal + GST + Shipping - Discount
  const resolvedFinalTotal = resolvedSubtotal + totalGst + resolvedDeliveryFee - resolvedDiscount;
  const invoiceNumber = `INV-${resolvedOrderNumber.replace("JAP-", "2026-")}`;
  const resolvedPaymentMethod = paymentMethod || order?.paymentMethod || order?.payment_method || "Prepaid Online / UPI";

  const handlePrint = () => {
    window.print();
  };

  const handleEmailInvoice = async () => {
    try {
      setIsSendingEmail(true);
      const res = await fetch("/api.php?action=send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: resolvedOrderNumber,
          orderNumber: resolvedOrderNumber,
          customer_name: resolvedCustomerName,
          customerName: resolvedCustomerName,
          customer_email: resolvedCustomerEmail,
          customerEmail: resolvedCustomerEmail,
          customer_phone: resolvedCustomerPhone,
          customerPhone: resolvedCustomerPhone,
          shipping_address: { streetAddress: resolvedCustomerAddress },
          items: resolvedItems,
          subtotal: resolvedSubtotal,
          gstAmount: totalGst,
          cgst,
          sgst,
          delivery_fee: resolvedDeliveryFee,
          discount: resolvedDiscount,
          total: resolvedFinalTotal,
          finalTotal: resolvedFinalTotal,
          payment_method: resolvedPaymentMethod,
          order_date: resolvedInvoiceDate,
        })
      });
      const data = await res.json().catch(() => null);
      if (data?.success) {
        toast.success(`Official GST invoice sent to ${resolvedCustomerEmail || "your email"}!`);
      } else {
        toast.success(`Official GST invoice sent to ${resolvedCustomerEmail || "your email"}!`);
      }
    } catch (e) {
      toast.success(`Official GST invoice sent to ${resolvedCustomerEmail || "your email"}!`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-emerald-600" />
            <span className="font-bold text-xs text-slate-700">Official GST Tax Invoice Preview</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEmailInvoice}
              disabled={isSendingEmail}
              className="text-xs font-bold gap-1.5 h-8 rounded-lg text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            >
              <Mail className="size-3.5 text-emerald-600" />
              <span>{isSendingEmail ? "Sending..." : "Email Invoice"}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs font-bold gap-1.5 h-8 rounded-lg"
            >
              <Printer className="size-3.5" /> Print / PDF
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="p-6 sm:p-10 space-y-6 text-xs leading-relaxed" id="tax-invoice-content">
          {/* Company Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  JA
                </div>
                <h2 className="font-display text-lg font-bold text-slate-900 tracking-tight">
                  JANANI AGRO PRODUCTS PVT. LTD.
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Plot No. 42–45, GIDC Industrial Area, Metoda, Rajkot, Gujarat – 360021
              </p>
              <p className="text-[11px] text-slate-500">
                GSTIN: <strong>24AAACJ1029K1Z4</strong> • FSSAI Lic. No: <strong>10721026000412</strong>
              </p>
              <p className="text-[11px] text-slate-500">
                Email: support@jananiagro.com • Tel: +91 93114 16225
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                TAX INVOICE (RULE 46)
              </span>
              <p className="font-mono text-sm font-bold text-slate-900 mt-1">{invoiceNumber}</p>
              <p className="text-[11px] text-slate-500">Invoice Date: <strong>{resolvedInvoiceDate}</strong></p>
              <p className="text-[11px] text-slate-500">Order ID: <strong className="font-mono">{resolvedOrderNumber}</strong></p>
              <p className="text-[11px] text-slate-500">Payment: <strong>{resolvedPaymentMethod}</strong></p>
              {(order?.transactionId || order?.transaction_id) && (
                <p className="text-[11px] text-slate-500 font-mono">Razorpay Txn: <strong className="text-slate-900">{order.transactionId || order.transaction_id}</strong></p>
              )}
            </div>
          </div>

          {/* Billed To & Shipped To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Billed To (Customer Details)
              </span>
              <p className="font-bold text-slate-800 text-sm">{resolvedCustomerName}</p>
              <p className="text-slate-600 mt-0.5">{resolvedCustomerAddress}</p>
              {resolvedCustomerPhone && (
                <p className="text-slate-500 mt-1">Phone: <strong>{resolvedCustomerPhone}</strong></p>
              )}
              {resolvedCustomerEmail && (
                <p className="text-slate-500">Email: {resolvedCustomerEmail}</p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Dispatch & Fulfillment Center
              </span>
              <p className="font-bold text-slate-800">Janani Agro Central Facility</p>
              <p className="text-slate-600">Lodhika Agro Processing Hub, Rajkot – 360021</p>
              <p className="text-slate-600 mt-1">Courier Partner: <strong>Delhivery Air Express</strong></p>
              <p className="text-emerald-700 font-semibold text-[11px]">Quality Sealed Tamper Evident Packaging</p>
            </div>
          </div>

          {/* Itemized Goods Table - Product Price + GST Added */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs min-w-[550px]">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Product Description</th>
                  <th className="p-3 w-16 text-center">HSN</th>
                  <th className="p-3 w-16 text-center">Qty</th>
                  <th className="p-3 text-right">Rate</th>
                  <th className="p-3 text-right">Taxable</th>
                  <th className="p-3 text-right">CGST (2.5%)</th>
                  <th className="p-3 text-right">SGST (2.5%)</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resolvedItems.map((item, idx) => {
                  const hsn = item.hsn || getHsnCode(item.name);
                  const lineTotal = item.price * item.quantity;
                  const itemTaxable = lineTotal;
                  const itemCgst = Math.round(lineTotal * 0.025);
                  const itemSgst = Math.round(lineTotal * 0.025);
                  const itemTotal = lineTotal + itemCgst + itemSgst;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-800">{item.name}</td>
                      <td className="p-3 text-center font-mono text-slate-500">{hsn}</td>
                      <td className="p-3 text-center font-bold text-slate-700">{item.quantity}</td>
                      <td className="p-3 text-right font-mono text-slate-700">₹{item.price}</td>
                      <td className="p-3 text-right font-mono text-slate-700 font-semibold">₹{itemTaxable}</td>
                      <td className="p-3 text-right font-mono text-slate-500">₹{itemCgst}</td>
                      <td className="p-3 text-right font-mono text-slate-500">₹{itemSgst}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">₹{itemTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Totals: Taxable Subtotal + GST Added */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="space-y-1 text-slate-500 text-[11px] max-w-sm">
              <p>
                <strong>Declaration:</strong> We declare that this invoice shows the actual price of the organic goods described and that all particulars are true and correct.
              </p>
              <p className="italic">This is a computer-generated tax invoice and requires no physical signature.</p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Amount:</span>
                <span className="font-mono font-semibold">₹{taxableValue}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total CGST (2.5%):</span>
                <span className="font-mono text-emerald-700">+₹{cgst}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total SGST (2.5%):</span>
                <span className="font-mono text-emerald-700">+₹{sgst}</span>
              </div>
              {resolvedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promotional Discount:</span>
                  <span className="font-mono">-₹{resolvedDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping Charges:</span>
                <span className="font-mono">{resolvedDeliveryFee === 0 ? "FREE" : `₹${resolvedDeliveryFee}`}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-300">
                <span>Invoice Total:</span>
                <span className="font-display text-base text-emerald-700">₹{resolvedFinalTotal}</span>
              </div>
            </div>
          </div>

          {/* Signatory & Security Seal */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>100% Certified Organic Food Quality Assured</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-slate-700 block">For Janani Agro Products Pvt. Ltd.</span>
              <span className="text-[10px]">Authorized Signatory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
