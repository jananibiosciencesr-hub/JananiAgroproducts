import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Loader2, MapPin, Plus, Save, Trash2, Truck } from "lucide-react";

/**
 * Admin: delivery charges.
 *  - a default rule for every pincode that has no rule of its own
 *  - any number of pincode rules: pincodes (many per rule), weight slabs (each kg its own price), extra per additional kg,
 *    free-delivery order amount, and an on/off + "not deliverable" switch
 * The storefront never uses these numbers directly; the server prices every cart/order from this saved configuration.
 */

interface Slab {
  kg: string;
  charge: string;
}
interface RuleForm {
  id: string;
  name: string;
  city: string;
  pincodes: string; // free text: separated by comma / space / new line
  slabs: Slab[];
  extraPerKg: string;
  freeAbove: string;
  active: boolean;
  deliverable: boolean;
}
interface ConfigForm {
  enabled: boolean;
  default: { name: string; slabs: Slab[]; extraPerKg: string; freeAbove: string; deliverable: boolean };
  rules: RuleForm[];
}

const num = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};
const money = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const newId = () => "DR-" + Math.random().toString(36).slice(2, 10);
const emptyRule = (): RuleForm => ({
  id: newId(),
  name: "",
  city: "",
  pincodes: "",
  slabs: [{ kg: "1", charge: "" }],
  extraPerKg: "0",
  freeAbove: "0",
  active: true,
  deliverable: true,
});

function fromServer(cfg: any): ConfigForm {
  const slabs = (arr: any[]): Slab[] => (arr || []).map((s) => ({ kg: String(s.kg ?? ""), charge: String(s.charge ?? "") }));
  const d = cfg?.default || {};
  return {
    enabled: cfg?.enabled !== false,
    default: {
      name: d.name || "All other pincodes",
      slabs: slabs(d.slabs).length ? slabs(d.slabs) : [{ kg: "1", charge: "60" }],
      extraPerKg: String(d.extraPerKg ?? 0),
      freeAbove: String(d.freeAbove ?? 0),
      deliverable: d.deliverable !== false,
    },
    rules: (cfg?.rules || []).map((r: any) => ({
      id: String(r.id || newId()),
      name: r.name || "",
      city: r.city || "",
      pincodes: (r.pincodes || []).join(", "),
      slabs: slabs(r.slabs),
      extraPerKg: String(r.extraPerKg ?? 0),
      freeAbove: String(r.freeAbove ?? 0),
      active: r.active !== false,
      deliverable: r.deliverable !== false,
    })),
  };
}

function toServer(f: ConfigForm) {
  const slabs = (arr: Slab[]) => arr.filter((s) => s.kg.trim() !== "" || s.charge.trim() !== "").map((s) => ({ kg: num(s.kg), charge: num(s.charge) }));
  return {
    enabled: f.enabled,
    default: {
      name: f.default.name,
      slabs: slabs(f.default.slabs),
      extraPerKg: num(f.default.extraPerKg),
      freeAbove: num(f.default.freeAbove),
      deliverable: f.default.deliverable,
    },
    rules: f.rules.map((r) => ({
      id: r.id,
      name: r.name,
      city: r.city,
      pincodes: r.pincodes,
      slabs: slabs(r.slabs),
      extraPerKg: num(r.extraPerKg),
      freeAbove: num(r.freeAbove),
      active: r.active,
      deliverable: r.deliverable,
    })),
  };
}

const parsePins = (text: string) => Array.from(new Set(text.split(/[\s,;]+/).map((p) => p.trim()).filter(Boolean)));

/** Same rule the server applies; used only for the live preview below. */
function previewCharge(f: ConfigForm, pin: string, weight: number, subtotal: number) {
  if (!f.enabled) return { text: "Delivery charges are switched off (free for everyone).", ok: true };
  if (!/^\d{6}$/.test(pin)) return { text: "Enter a 6-digit pincode.", ok: false };
  const rule = f.rules.find((r) => r.active && parsePins(r.pincodes).includes(pin));
  const src = rule || f.default;
  const name = rule ? rule.name || rule.city || "Pincode rule" : "Default rule";
  if (!src.deliverable) return { text: `${name}: not deliverable to ${pin}.`, ok: false };
  const slabs = src.slabs.map((s) => ({ kg: num(s.kg), charge: num(s.charge) })).filter((s) => s.kg > 0).sort((a, b) => a.kg - b.kg);
  if (!slabs.length) return { text: `${name}: no weight charges set.`, ok: false };
  const w = Math.max(weight, 0.01);
  let charge = slabs.find((s) => s.kg + 1e-9 >= w)?.charge;
  if (charge === undefined) {
    const last = slabs[slabs.length - 1]!;
    charge = last.charge + Math.ceil(w - last.kg - 1e-9) * num(src.extraPerKg);
  }
  const free = num(src.freeAbove) > 0 && subtotal >= num(src.freeAbove);
  return {
    text: free
      ? `${name}: FREE delivery (order ${money(subtotal)} is above ${money(num(src.freeAbove))}). Without free delivery it would be ${money(charge)}.`
      : `${name}: ${money(charge)} for ${w} kg${num(src.freeAbove) > 0 ? ` · free above ${money(num(src.freeAbove))}` : ""}.`,
    ok: true,
  };
}

function SlabEditor({ slabs, onChange }: { slabs: Slab[]; onChange: (s: Slab[]) => void }) {
  const update = (i: number, patch: Partial<Slab>) => onChange(slabs.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-[11px] font-bold text-muted-foreground">
        <span>Up to weight (kg)</span>
        <span>Delivery charge (₹)</span>
        <span className="w-8" />
      </div>
      {slabs.map((s, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input
            type="number"
            min="0"
            step="0.5"
            value={s.kg}
            onChange={(e) => update(i, { kg: e.target.value })}
            placeholder="e.g. 1"
            className="h-9 border border-border bg-background px-2.5 text-sm outline-none focus:border-emerald-600"
          />
          <input
            type="number"
            min="0"
            step="1"
            value={s.charge}
            onChange={(e) => update(i, { charge: e.target.value })}
            placeholder="e.g. 100"
            className="h-9 border border-border bg-background px-2.5 text-sm outline-none focus:border-emerald-600"
          />
          <button
            type="button"
            onClick={() => onChange(slabs.filter((_, idx) => idx !== i))}
            disabled={slabs.length <= 1}
            className="size-9 grid place-items-center text-rose-600 hover:bg-rose-50 disabled:opacity-30 cursor-pointer"
            title="Remove this weight"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...slabs, { kg: String((Math.max(0, ...slabs.map((s) => num(s.kg))) || 0) + 1), charge: "" }])}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
      >
        <Plus className="size-3.5" /> Add weight
      </button>
    </div>
  );
}

function ExtraFields({
  extraPerKg,
  freeAbove,
  onChange,
}: {
  extraPerKg: string;
  freeAbove: string;
  onChange: (patch: { extraPerKg?: string; freeAbove?: string }) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <label className="space-y-1">
        <span className="text-[11px] font-bold text-muted-foreground">Extra ₹ for every additional kg above the last weight</span>
        <input
          type="number"
          min="0"
          value={extraPerKg}
          onChange={(e) => onChange({ extraPerKg: e.target.value })}
          className="w-full h-9 border border-border bg-background px-2.5 text-sm outline-none focus:border-emerald-600"
        />
      </label>
      <label className="space-y-1">
        <span className="text-[11px] font-bold text-muted-foreground">Free delivery when products total is at least ₹ (0 = never free)</span>
        <input
          type="number"
          min="0"
          value={freeAbove}
          onChange={(e) => onChange({ freeAbove: e.target.value })}
          className="w-full h-9 border border-border bg-background px-2.5 text-sm outline-none focus:border-emerald-600"
        />
      </label>
    </div>
  );
}

/** Read-only table of everything that is configured: which pincode pays what, for which weight. */
function Overview({ form, dirty }: { form: ConfigForm; dirty: boolean }) {
  const rows = [
    ...form.rules.map((r, i) => ({
      ...r,
      key: r.id,
      name: r.name || r.city || "Rule " + (i + 1),
      pins: parsePins(r.pincodes),
      isDefault: false,
    })),
    { ...form.default, key: "default", name: "All other pincodes", city: "", pins: [] as string[], active: true, isDefault: true },
  ];
  return (
    <section className="border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b border-border">
        <div>
          <h3 className="text-sm font-extrabold text-foreground">Delivery charges at a glance</h3>
          <p className="text-xs text-muted-foreground">Which pincode pays how much, for which cart weight.</p>
        </div>
        <span className={`text-[11px] font-bold px-2 py-1 ${dirty ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
          {dirty ? "Showing unsaved changes - click Save" : "Saved and live"}
        </span>
      </div>
      {!form.enabled && <p className="p-4 text-sm font-semibold text-amber-800">Delivery charges are switched off: delivery is free for everyone.</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground font-bold">
              <th className="py-2 px-3">Area / rule</th>
              <th className="py-2 px-3">Pincodes</th>
              <th className="py-2 px-3">Cart weight → delivery charge</th>
              <th className="py-2 px-3">Free delivery</th>
              <th className="py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => {
              const slabs = r.slabs
                .map((s) => ({ kg: num(s.kg), charge: num(s.charge) }))
                .filter((s) => s.kg > 0)
                .sort((a, b) => a.kg - b.kg);
              const last = slabs[slabs.length - 1];
              const perKg = num(r.extraPerKg);
              return (
                <tr key={r.key} className={`align-top ${r.active ? "" : "opacity-60"}`}>
                  <td className="py-2.5 px-3">
                    <span className="block font-bold text-foreground">{r.name}</span>
                    {r.city && <span className="text-muted-foreground">{r.city}</span>}
                  </td>
                  <td className="py-2.5 px-3 font-mono max-w-[220px] break-words">
                    {r.isDefault ? <span className="font-sans text-muted-foreground">Every pincode not listed above</span> : r.pins.join(", ") || "-"}
                  </td>
                  <td className="py-2.5 px-3">
                    {!r.deliverable ? (
                      <span className="font-semibold text-rose-700">Not delivered</span>
                    ) : (
                      <ul className="space-y-0.5">
                        {slabs.map((s, i) => (
                          <li key={i}>
                            {i === 0 ? "Up to" : `Above ${slabs[i - 1]!.kg} kg up to`} <strong>{s.kg} kg</strong> → <strong>{money(s.charge)}</strong>
                          </li>
                        ))}
                        {last && (
                          <li className={perKg > 0 ? "" : "text-amber-700 font-semibold"}>
                            Above <strong>{last.kg} kg</strong> →{" "}
                            {perKg > 0 ? (
                              <>
                                {money(last.charge)} + <strong>{money(perKg)}</strong> per extra kg
                              </>
                            ) : (
                              <>{money(last.charge)} only (set "extra ₹ per kg" to charge more for heavy carts)</>
                            )}
                          </li>
                        )}
                      </ul>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {!r.deliverable ? "-" : num(r.freeAbove) > 0 ? <>On orders of <strong>{money(num(r.freeAbove))}</strong> or more</> : "Never free"}
                  </td>
                  <td className="py-2.5 px-3 font-semibold">
                    {!r.active ? <span className="text-muted-foreground">Off</span> : r.deliverable ? <span className="text-emerald-700">Active</span> : <span className="text-rose-700">Blocked</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DeliveryChargesManagement() {
  const [form, setForm] = useState<ConfigForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveErrors, setSaveErrors] = useState<string[]>([]);
  const [testPin, setTestPin] = useState("");
  const [testWeight, setTestWeight] = useState("1");
  const [testTotal, setTestTotal] = useState("500");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api.php?action=delivery-charges");
      const data = await res.json().catch(() => null);
      if (!data?.success) throw new Error(data?.message || `Could not load (${res.status})`);
      setForm(fromServer(data.config));
      setDirty(false);
    } catch (e: any) {
      setLoadError(e?.message || "Could not load delivery charges.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const change = (updater: (f: ConfigForm) => ConfigForm) => {
    setForm((f) => (f ? updater(f) : f));
    setDirty(true);
    setSaveErrors([]);
  };

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setSaveErrors([]);
    try {
      const res = await fetch("/api.php?action=delivery-charges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: toServer(form) }),
      });
      const data = await res.json().catch(() => null);
      if (!data?.success) {
        setSaveErrors(Array.isArray(data?.errors) && data.errors.length ? data.errors : [data?.message || "Could not save."]);
        toast.error(data?.message || "Please fix the highlighted problems.");
        return;
      }
      setForm(fromServer(data.config));
      setDirty(false);
      toast.success("Delivery charges saved. They apply to new carts and orders immediately.");
    } catch {
      toast.error("Could not save. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const totalPins = useMemo(() => (form ? form.rules.reduce((n, r) => n + parsePins(r.pincodes).length, 0) : 0), [form]);
  const preview = form ? previewCharge(form, testPin, num(testWeight), num(testTotal)) : null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading delivery charges…
      </div>
    );
  }
  if (loadError || !form) {
    return (
      <div className="p-8 space-y-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-rose-700">
          <AlertCircle className="size-4" /> {loadError || "Could not load delivery charges."}
        </p>
        <button type="button" onClick={load} className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold cursor-pointer">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <Truck className="size-5 text-emerald-700" /> Delivery Charges
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Set the delivery charge by pincode and weight. Customers enter their pincode on the product page, cart and checkout and the charge
            is added to their total. Cart weight comes from the pack size (1 L = 1 kg, 5 L = 5 kg, 500 ml = 0.5 kg).
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-2 px-5 h-10 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-bold cursor-pointer"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {dirty ? "Save changes" : "Saved"}
        </button>
      </div>

      {saveErrors.length > 0 && (
        <div className="border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 space-y-1">
          {saveErrors.map((e, i) => (
            <p key={i} className="flex gap-1.5">
              <AlertCircle className="size-3.5 shrink-0 mt-0.5" /> {e}
            </p>
          ))}
        </div>
      )}

      {/* Master switch */}
      <label className="flex items-center gap-3 border border-border bg-card p-4 cursor-pointer">
        <input
          type="checkbox"
          checked={form.enabled}
          onChange={(e) => change((f) => ({ ...f, enabled: e.target.checked }))}
          className="size-4 accent-emerald-700"
        />
        <span>
          <span className="block text-sm font-bold text-foreground">Charge delivery on orders</span>
          <span className="block text-xs text-muted-foreground">Turn off to make delivery free for every pincode.</span>
        </span>
      </label>

      {/* Default rule */}
      <section className="border border-border bg-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-foreground">Default charge — all other pincodes</h3>
            <p className="text-xs text-muted-foreground">Used when the customer's pincode is not in any rule below.</p>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={form.default.deliverable}
              onChange={(e) => change((f) => ({ ...f, default: { ...f.default, deliverable: e.target.checked } }))}
              className="size-4 accent-emerald-700"
            />
            We deliver to other pincodes
          </label>
        </div>
        {form.default.deliverable && (
          <>
            <SlabEditor slabs={form.default.slabs} onChange={(slabs) => change((f) => ({ ...f, default: { ...f.default, slabs } }))} />
            <ExtraFields
              extraPerKg={form.default.extraPerKg}
              freeAbove={form.default.freeAbove}
              onChange={(p) => change((f) => ({ ...f, default: { ...f.default, ...p } }))}
            />
          </>
        )}
      </section>

      {/* Pincode rules */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <MapPin className="size-4 text-emerald-700" /> Pincode rules
            <span className="text-xs font-semibold text-muted-foreground">
              {form.rules.length} rules · {totalPins} pincodes
            </span>
          </h3>
          <button
            type="button"
            onClick={() => change((f) => ({ ...f, rules: [...f.rules, emptyRule()] }))}
            className="inline-flex items-center gap-1.5 px-4 h-9 border border-emerald-700 text-emerald-800 hover:bg-emerald-50 text-xs font-bold cursor-pointer"
          >
            <Plus className="size-4" /> Add pincode rule
          </button>
        </div>

        {form.rules.length === 0 && (
          <div className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No pincode rules yet. Add a rule to give specific pincodes their own weight-based delivery charges (for example 53221 → 1 kg ₹100).
          </div>
        )}

        {form.rules.map((rule, idx) => {
          const patch = (p: Partial<RuleForm>) => change((f) => ({ ...f, rules: f.rules.map((r) => (r.id === rule.id ? { ...r, ...p } : r)) }));
          const pins = parsePins(rule.pincodes);
          const badPins = pins.filter((p) => !/^\d{6}$/.test(p));
          return (
            <div key={rule.id} className={`border bg-card p-4 sm:p-5 space-y-4 ${rule.active ? "border-border" : "border-border opacity-70"}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <span className="text-xs font-bold text-muted-foreground">Rule {idx + 1}</span>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input type="checkbox" checked={rule.active} onChange={(e) => patch({ active: e.target.checked })} className="size-4 accent-emerald-700" />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.deliverable}
                      onChange={(e) => patch({ deliverable: e.target.checked })}
                      className="size-4 accent-emerald-700"
                    />
                    We deliver here
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Delete this rule? Its pincodes will use the default charge.")) change((f) => ({ ...f, rules: f.rules.filter((r) => r.id !== rule.id) }));
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground">Rule name</span>
                  <input
                    value={rule.name}
                    onChange={(e) => patch({ name: e.target.value })}
                    placeholder="e.g. Srikakulam district"
                    className="w-full h-9 border border-border bg-background px-2.5 text-sm outline-none focus:border-emerald-600"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground">City (shown to the customer)</span>
                  <input
                    value={rule.city}
                    onChange={(e) => patch({ city: e.target.value })}
                    placeholder="e.g. Palasa"
                    className="w-full h-9 border border-border bg-background px-2.5 text-sm outline-none focus:border-emerald-600"
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground">
                  Pincodes (6 digits each — separate with comma, space or new line) · {pins.length} added
                </span>
                <textarea
                  rows={2}
                  value={rule.pincodes}
                  onChange={(e) => patch({ pincodes: e.target.value })}
                  placeholder="532221, 532222, 532001"
                  className="w-full border border-border bg-background px-2.5 py-2 text-sm font-mono outline-none focus:border-emerald-600"
                />
                {badPins.length > 0 && (
                  <span className="text-[11px] font-semibold text-rose-700">Not a valid 6-digit pincode: {badPins.slice(0, 5).join(", ")}</span>
                )}
              </label>

              {rule.deliverable ? (
                <>
                  <SlabEditor slabs={rule.slabs} onChange={(slabs) => patch({ slabs })} />
                  <ExtraFields extraPerKg={rule.extraPerKg} freeAbove={rule.freeAbove} onChange={(p) => patch(p)} />
                </>
              ) : (
                <p className="text-xs font-semibold text-rose-700">Customers entering these pincodes will see “we do not deliver here” and cannot place an order.</p>
              )}
            </div>
          );
        })}
      </section>

      <Overview form={form} dirty={dirty} />

      {/* Preview */}
      <section className="border border-border bg-card p-4 sm:p-5 space-y-3">
        <h3 className="text-sm font-extrabold text-foreground">Try it (uses the settings above, even before saving)</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground">Pincode</span>
            <input
              value={testPin}
              maxLength={6}
              inputMode="numeric"
              onChange={(e) => setTestPin(e.target.value.replace(/\D/g, ""))}
              placeholder="53221"
              className="w-full h-9 border border-border bg-background px-2.5 text-sm font-mono outline-none focus:border-emerald-600"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground">Cart weight (kg)</span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={testWeight}
              onChange={(e) => setTestWeight(e.target.value)}
              className="w-full h-9 border border-border bg-background px-2.5 text-sm outline-none focus:border-emerald-600"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground">Products total (₹)</span>
            <input
              type="number"
              min="0"
              value={testTotal}
              onChange={(e) => setTestTotal(e.target.value)}
              className="w-full h-9 border border-border bg-background px-2.5 text-sm outline-none focus:border-emerald-600"
            />
          </label>
        </div>
        {preview && (
          <p className={`text-sm font-semibold ${preview.ok ? "text-emerald-800" : "text-rose-700"}`}>{preview.text}</p>
        )}
      </section>
    </div>
  );
}
