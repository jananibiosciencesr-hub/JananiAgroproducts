import React from "react";
import { X, Printer, Download, CheckCircle2, ShieldCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  hsn?: string;
}

interface OrderInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  invoiceDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  finalTotal: number;
  paymentMethod: string;
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
};

function getHsnCode(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, code] of Object.entries(HSN_MAP)) {
    if (lower.includes(key)) return code;
  }
  return "2106"; // Food preparations
}

export function OrderInvoiceModal({
  isOpen,
  onClose,
  orderNumber,
  invoiceDate,
  customerName,
  customerPhone,
  customerAddress,
  items,
  subtotal,
  deliveryFee,
  discount,
  finalTotal,
  paymentMethod,
}: OrderInvoiceModalProps) {
  if (!isOpen) return null;

  const invoiceNumber = `INV-${orderNumber.replace("JAP-", "2026-")}`;
  const taxableValue = Math.round(subtotal / 1.05);
  const totalGst = subtotal - taxableValue;
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;

  const handlePrint = () => {
    window.print();
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
              <p className="text-[11px] text-slate-500">Invoice Date: <strong>{invoiceDate}</strong></p>
              <p className="text-[11px] text-slate-500">Order ID: <strong className="font-mono">{orderNumber}</strong></p>
              <p className="text-[11px] text-slate-500">Payment: <strong>{paymentMethod}</strong></p>
            </div>
          </div>

          {/* Billed To / Shipped To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            <div>
              <h4 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1">
                Billed To (Customer):
              </h4>
              <p className="font-bold text-slate-900">{customerName}</p>
              <p className="text-slate-600">{customerAddress}</p>
              <p className="text-slate-600 mt-1">Mobile: <strong>+91 {customerPhone}</strong></p>
              <p className="text-slate-500 text-[11px]">Place of Supply: Gujarat (24)</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1">
                Dispatch / Fulfillment Station:
              </h4>
              <p className="font-bold text-slate-900">Janani Regional Farm Fulfillment Center</p>
              <p className="text-slate-600">Lodhika Agro Processing Hub, Rajkot – 360021</p>
              <p className="text-slate-600 mt-1">Courier Partner: <strong>Delhivery Air Express</strong></p>
              <p className="text-emerald-700 font-semibold text-[11px]">Cold-Chain Tamper Evident Packaging</p>
            </div>
          </div>

          {/* Itemized Goods Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
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
                {items.map((item, idx) => {
                  const hsn = item.hsn || getHsnCode(item.name);
                  const lineTotal = item.price * item.quantity;
                  const itemTaxable = Math.round(lineTotal / 1.05);
                  const itemCgst = Math.round((lineTotal - itemTaxable) / 2);
                  const itemSgst = lineTotal - itemTaxable - itemCgst;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-800">{item.name}</td>
                      <td className="p-3 text-center font-mono text-slate-500">{hsn}</td>
                      <td className="p-3 text-center font-bold text-slate-700">{item.quantity}</td>
                      <td className="p-3 text-right font-mono text-slate-700">₹{item.price}</td>
                      <td className="p-3 text-right font-mono text-slate-700">₹{itemTaxable}</td>
                      <td className="p-3 text-right font-mono text-slate-500">₹{itemCgst}</td>
                      <td className="p-3 text-right font-mono text-slate-500">₹{itemSgst}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">₹{lineTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
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
                <span className="font-mono">₹{cgst}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total SGST (2.5%):</span>
                <span className="font-mono">₹{sgst}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promotional Discount:</span>
                  <span className="font-mono">-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping Charges:</span>
                <span className="font-mono">{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-300">
                <span>Invoice Total:</span>
                <span className="font-mono text-base text-emerald-700">₹{finalTotal}</span>
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
