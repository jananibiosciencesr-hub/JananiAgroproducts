import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Loader2, MapPin, Pencil, Plus, Save, Search, Trash2, Truck, Upload, X } from "lucide-react";

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

const PAGE_SIZE = 25;
const inputCls = "w-full h-9 border border-border bg-background px-2.5 text-sm outline-none focus:border-emerald-600";

const sortedSlabs = (slabs: Slab[]) =>
  slabs
    .map((s) => ({ kg: num(s.kg), charge: num(s.charge) }))
    .filter((s) => s.kg > 0)
    .sort((a, b) => a.kg - b.kg);

/** "Up to 5 kg → ₹100" lines for one rule, shown in the table. */
function RateLines({ slabs, extraPerKg }: { slabs: Slab[]; extraPerKg: string }) {
  const list = sortedSlabs(slabs);
  const last = list[list.length - 1];
  const perKg = num(extraPerKg);
  return (
    <ul className="space-y-0.5">
      {list.map((s, i) => (
        <li key={i}>
          {i === 0 ? "Up to" : `Above ${list[i - 1]!.kg} kg up to`} <strong>{s.kg} kg</strong> → <strong>{money(s.charge)}</strong>
        </li>
      ))}
      {last && (
        <li className={perKg > 0 ? "" : "text-amber-700"}>
          Above <strong>{last.kg} kg</strong> → {money(last.charge)}
          {perKg > 0 ? (
            <>
              {" "}
              + <strong>{money(perKg)}</strong> per extra kg
            </>
          ) : (
            " only"
          )}
        </li>
      )}
    </ul>
  );
}

/** Problems the admin can fix before sending to the server. */
function validateDraft(draft: RuleForm, others: RuleForm[], isDefault: boolean): string[] {
  const errors: string[] = [];
  if (!isDefault) {
    const pins = parsePins(draft.pincodes);
    if (pins.length === 0) errors.push("Add at least one pincode.");
    const bad = pins.filter((p) => !/^\d{6}$/.test(p));
    if (bad.length) errors.push(`Not a valid 6-digit pincode: ${bad.slice(0, 5).join(", ")}`);
    if (draft.active) {
      const taken: string[] = [];
      for (const other of others) {
        if (!other.active) continue;
        const set = new Set(parsePins(other.pincodes));
        pins.filter((p) => set.has(p)).forEach((p) => taken.push(`${p} (in "${other.name || other.city || "another rule"}")`));
      }
      if (taken.length) errors.push(`Already used in another rule: ${taken.slice(0, 5).join(", ")}. Edit that rule instead.`);
    }
  }
  if (draft.deliverable) {
    const filled = draft.slabs.filter((s) => s.kg.trim() !== "" || s.charge.trim() !== "");
    if (filled.length === 0) errors.push("Add at least one weight and its delivery charge.");
    if (filled.some((s) => !(num(s.kg) > 0))) errors.push("Every row needs a weight greater than 0 kg.");
    if (filled.some((s) => s.charge.trim() === "")) errors.push("Every row needs a delivery charge (enter 0 for free).");
  }
  return errors;
}

function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-card border border-border shadow-2xl">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
          <h3 className="text-sm font-extrabold text-foreground">{title}</h3>
          <button type="button" onClick={onClose} className="size-8 grid place-items-center hover:bg-muted cursor-pointer" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto space-y-4">{children}</div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">{footer}</div>
      </div>
    </div>
  );
}

function ErrorList({ errors }: { errors: string[] }) {
  if (!errors.length) return null;
  return (
    <div className="border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 space-y-1">
      {errors.map((e, i) => (
        <p key={i} className="flex gap-1.5">
          <AlertCircle className="size-3.5 shrink-0 mt-0.5" /> {e}
        </p>
      ))}
    </div>
  );
}

/** Bulk add: one line per pincode -> "532221, Palasa, 5:100, 10:150". Lines with the same area and prices become one rule. */
function parseBulk(text: string): { rules: RuleForm[]; pins: string[]; errors: string[] } {
  const errors: string[] = [];
  const groups = new Map<string, { city: string; slabs: Slab[]; pins: string[] }>();
  const seen = new Set<string>();
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const parts = line.split(/[,;\t]+/).map((p) => p.trim()).filter(Boolean);
    const pin = parts[0] || "";
    if (!/^\d{6}$/.test(pin)) {
      errors.push(`Line ${i + 1}: "${pin}" is not a 6-digit pincode.`);
      return;
    }
    if (seen.has(pin)) {
      errors.push(`Line ${i + 1}: pincode ${pin} is repeated.`);
      return;
    }
    seen.add(pin);
    const slabs: Slab[] = [];
    let city = "";
    for (const p of parts.slice(1)) {
      const m = p.match(/^(\d+(?:\.\d+)?)\s*(?:kg)?\s*[:=]\s*(?:₹|rs\.?)?\s*(\d+(?:\.\d+)?)$/i);
      if (m) slabs.push({ kg: m[1]!, charge: m[2]! });
      else if (!city && !p.includes(":")) city = p;
      else errors.push(`Line ${i + 1}: could not read "${p}". Write weight and charge like 5:100.`);
    }
    if (!slabs.length) {
      errors.push(`Line ${i + 1}: add a weight and charge, e.g. 5:100.`);
      return;
    }
    const key = JSON.stringify([city.toLowerCase(), sortedSlabs(slabs)]);
    const g = groups.get(key);
    if (g) g.pins.push(pin);
    else groups.set(key, { city, slabs, pins: [pin] });
  });
  const rules = Array.from(groups.values()).map((g) => ({
    ...emptyRule(),
    name: g.city || g.pins[0]!,
    city: g.city,
    pincodes: g.pins.join(", "),
    slabs: g.slabs,
  }));
  return { rules, pins: Array.from(seen), errors };
}

type Editor = { kind: "rule"; draft: RuleForm; isNew: boolean } | { kind: "default"; draft: RuleForm } | { kind: "bulk" } | null;

export function DeliveryChargesManagement() {
  const [form, setForm] = useState<ConfigForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [editor, setEditor] = useState<Editor>(null);
  const [editorErrors, setEditorErrors] = useState<string[]>([]);
  const [bulkText, setBulkText] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
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
    } catch (e: any) {
      setLoadError(e?.message || "Could not load delivery charges.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Every action saves immediately; the screen always shows what is live. */
  const persist = async (next: ConfigForm, success: string): Promise<boolean> => {
    setSaving(true);
    setEditorErrors([]);
    try {
      const res = await fetch("/api.php?action=delivery-charges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: toServer(next) }),
      });
      const data = await res.json().catch(() => null);
      if (!data?.success) {
        const errs = Array.isArray(data?.errors) && data.errors.length ? data.errors : [data?.message || "Could not save."];
        setEditorErrors(errs);
        toast.error(errs[0]);
        return false;
      }
      setForm(fromServer(data.config));
      toast.success(success);
      return true;
    } catch {
      setEditorErrors(["Could not save. Please check your connection and try again."]);
      toast.error("Could not save. Please check your connection and try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    if (!form) return [] as RuleForm[];
    const q = search.trim().toLowerCase();
    if (!q) return form.rules;
    return form.rules.filter((r) => `${r.name} ${r.city} ${r.pincodes}`.toLowerCase().includes(q));
  }, [form, search]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPins = useMemo(() => (form ? form.rules.reduce((n, r) => n + parsePins(r.pincodes).length, 0) : 0), [form]);
  const bulk = useMemo(() => parseBulk(bulkText), [bulkText]);
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

  const openEditor = (next: Editor) => {
    setEditorErrors([]);
    setEditor(next);
  };
  const editRule = (r: RuleForm) => openEditor({ kind: "rule", isNew: false, draft: { ...r, slabs: r.slabs.map((s) => ({ ...s })) } });
  const editDefault = () =>
    openEditor({ kind: "default", draft: { ...emptyRule(), ...form.default, slabs: form.default.slabs.map((s) => ({ ...s })) } });
  const patchDraft = (patch: Partial<RuleForm>) => {
    setEditorErrors([]);
    setEditor((e) => (e && e.kind !== "bulk" ? { ...e, draft: { ...e.draft, ...patch } } : e));
  };

  const saveEditor = async () => {
    if (!editor || editor.kind === "bulk") return;
    const d = editor.draft;
    const isDefault = editor.kind === "default";
    const problems = validateDraft(d, form.rules.filter((r) => r.id !== d.id), isDefault);
    if (problems.length) {
      setEditorErrors(problems);
      return;
    }
    let next: ConfigForm;
    if (editor.kind === "default") {
      next = {
        ...form,
        default: { name: form.default.name, slabs: d.slabs, extraPerKg: d.extraPerKg, freeAbove: d.freeAbove, deliverable: d.deliverable },
      };
    } else {
      next = { ...form, rules: editor.isNew ? [d, ...form.rules] : form.rules.map((r) => (r.id === d.id ? d : r)) };
    }
    if (await persist(next, editor.kind === "default" ? "Default charge updated." : "Rule saved.")) setEditor(null);
  };

  const deleteRule = async (r: RuleForm) => {
    if (!window.confirm(`Delete "${r.name || r.city}"? Its pincodes will use the default charge.`)) return;
    await persist({ ...form, rules: form.rules.filter((x) => x.id !== r.id) }, "Rule deleted.");
  };

  const saveBulk = async () => {
    if (bulk.errors.length || !bulk.pins.length) {
      setEditorErrors(bulk.errors.length ? bulk.errors.slice(0, 8) : ["Paste at least one line."]);
      return;
    }
    const incoming = new Set(bulk.pins);
    // pincodes that already have a rule are moved to the new one; rules left without pincodes are removed
    const kept = form.rules
      .map((r) => ({ ...r, pincodes: parsePins(r.pincodes).filter((p) => !incoming.has(p)).join(", ") }))
      .filter((r) => r.pincodes !== "");
    if (await persist({ ...form, rules: [...bulk.rules, ...kept] }, `${bulk.pins.length} pincodes saved.`)) {
      setBulkText("");
      setEditor(null);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <Truck className="size-5 text-emerald-700" /> Delivery Charges
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Charges are decided by the customer's pincode and the cart weight (1 L = 1 kg, 500 ml = 0.5 kg). Every change is saved and goes live
            immediately.
          </p>
        </div>
        <label className="flex items-center gap-2 border border-border bg-card px-3 h-10 text-xs font-bold cursor-pointer">
          <input
            type="checkbox"
            checked={form.enabled}
            disabled={saving}
            onChange={(e) =>
              persist({ ...form, enabled: e.target.checked }, e.target.checked ? "Delivery charges switched on." : "Delivery is now free everywhere.")
            }
            className="size-4 accent-emerald-700"
          />
          Charge delivery on orders
        </label>
      </div>

      {!editor && <ErrorList errors={editorErrors} />}
      {!form.enabled && (
        <p className="border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
          Delivery charges are switched off: delivery is free for everyone.
        </p>
      )}

      {/* Rules table */}
      <section className="border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-border">
          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <MapPin className="size-4 text-emerald-700" /> Pincode rules
            <span className="text-xs font-semibold text-muted-foreground">
              {form.rules.length} rules · {totalPins} pincodes
            </span>
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search pincode or area"
                className="h-9 w-56 border border-border bg-background pl-8 pr-2 text-xs outline-none focus:border-emerald-600"
              />
            </div>
            <button
              type="button"
              onClick={() => openEditor({ kind: "bulk" })}
              className="inline-flex items-center gap-1.5 px-3 h-9 border border-border text-xs font-bold hover:bg-muted cursor-pointer"
            >
              <Upload className="size-3.5" /> Bulk add
            </button>
            <button
              type="button"
              onClick={() => openEditor({ kind: "rule", isNew: true, draft: emptyRule() })}
              className="inline-flex items-center gap-1.5 px-3 h-9 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="size-4" /> Add pincode rule
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground font-bold">
                <th className="py-2 px-3">Area / rule</th>
                <th className="py-2 px-3">Pincodes</th>
                <th className="py-2 px-3">Cart weight → delivery charge</th>
                <th className="py-2 px-3">Free delivery</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageRows.map((r) => {
                const pins = parsePins(r.pincodes);
                return (
                  <tr key={r.id} className={`align-top hover:bg-muted/30 ${r.active ? "" : "opacity-60"}`}>
                    <td className="py-2 px-3">
                      <span className="block font-bold text-foreground">{r.name || r.city}</span>
                      {r.city && <span className="text-muted-foreground">{r.city}</span>}
                    </td>
                    <td className="py-2 px-3 font-mono max-w-[200px]" title={pins.join(", ")}>
                      {pins.slice(0, 3).join(", ")}
                      {pins.length > 3 && <span className="font-sans font-bold text-emerald-700"> +{pins.length - 3} more</span>}
                    </td>
                    <td className="py-2 px-3">
                      {r.deliverable ? <RateLines slabs={r.slabs} extraPerKg={r.extraPerKg} /> : <span className="font-semibold text-rose-700">Not delivered</span>}
                    </td>
                    <td className="py-2 px-3">
                      {!r.deliverable ? "-" : num(r.freeAbove) > 0 ? <>Orders of <strong>{money(num(r.freeAbove))}</strong>+</> : "Never free"}
                    </td>
                    <td className="py-2 px-3 font-semibold">
                      {!r.active ? <span className="text-muted-foreground">Off</span> : r.deliverable ? <span className="text-emerald-700">Active</span> : <span className="text-rose-700">Blocked</span>}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex justify-end gap-1.5">
                        <button type="button" onClick={() => editRule(r)} className="inline-flex items-center gap-1 px-2.5 h-8 border border-emerald-700 text-emerald-800 hover:bg-emerald-50 font-bold cursor-pointer">
                          <Pencil className="size-3.5" /> Edit
                        </button>
                        <button type="button" disabled={saving} onClick={() => deleteRule(r)} className="size-8 grid place-items-center border border-border text-rose-600 hover:bg-rose-50 cursor-pointer" title="Delete rule">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 px-3 text-center text-muted-foreground">
                    {search ? `No rule contains "${search}". That pincode uses the default charge below.` : "No pincode rules yet. Use Add pincode rule or Bulk add."}
                  </td>
                </tr>
              )}
              {/* Default charge is always the last row */}
              <tr className="align-top bg-emerald-50/50">
                <td className="py-2 px-3 font-bold text-foreground">All other pincodes</td>
                <td className="py-2 px-3 text-muted-foreground">Every pincode not in a rule</td>
                <td className="py-2 px-3">
                  {form.default.deliverable ? <RateLines slabs={form.default.slabs} extraPerKg={form.default.extraPerKg} /> : <span className="font-semibold text-rose-700">Not delivered</span>}
                </td>
                <td className="py-2 px-3">
                  {num(form.default.freeAbove) > 0 ? <>Orders of <strong>{money(num(form.default.freeAbove))}</strong>+</> : "Never free"}
                </td>
                <td className="py-2 px-3 font-semibold text-emerald-700">Default</td>
                <td className="py-2 px-3">
                  <div className="flex justify-end">
                    <button type="button" onClick={editDefault} className="inline-flex items-center gap-1 px-2.5 h-8 border border-emerald-700 text-emerald-800 hover:bg-emerald-50 font-bold cursor-pointer">
                      <Pencil className="size-3.5" /> Edit
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {pageCount > 1 && (
          <div className="flex items-center justify-between gap-2 p-3 border-t border-border text-xs">
            <span className="text-muted-foreground">
              Page {currentPage} of {pageCount} · {filtered.length} rules
            </span>
            <div className="flex gap-2">
              <button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="px-3 h-8 border border-border font-bold disabled:opacity-40 cursor-pointer">
                Previous
              </button>
              <button type="button" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)} className="px-3 h-8 border border-border font-bold disabled:opacity-40 cursor-pointer">
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Check a customer's charge */}
      <section className="border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-extrabold text-foreground">Check what a customer will pay</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground">Pincode</span>
            <input value={testPin} maxLength={6} inputMode="numeric" onChange={(e) => setTestPin(e.target.value.replace(/\D/g, ""))} placeholder="532221" className={`${inputCls} font-mono`} />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground">Cart weight (kg)</span>
            <input type="number" min="0" step="0.5" value={testWeight} onChange={(e) => setTestWeight(e.target.value)} className={inputCls} />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground">Products total (₹)</span>
            <input type="number" min="0" value={testTotal} onChange={(e) => setTestTotal(e.target.value)} className={inputCls} />
          </label>
        </div>
        {preview && <p className={`text-sm font-semibold ${preview.ok ? "text-emerald-800" : "text-muted-foreground"}`}>{preview.text}</p>}
      </section>

      {/* Add / edit one rule (or the default charge) */}
      {editor && editor.kind !== "bulk" && (
        <Modal
          title={editor.kind === "default" ? "Edit default charge (all other pincodes)" : editor.isNew ? "Add pincode rule" : `Edit rule: ${editor.draft.name || editor.draft.city}`}
          onClose={() => setEditor(null)}
          footer={
            <>
              <button type="button" onClick={() => setEditor(null)} className="px-4 h-9 border border-border text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={saveEditor} disabled={saving} className="inline-flex items-center gap-2 px-5 h-9 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold cursor-pointer">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save
              </button>
            </>
          }
        >
          <ErrorList errors={editorErrors} />
          {editor.kind === "rule" && (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground">Rule name</span>
                  <input value={editor.draft.name} onChange={(e) => patchDraft({ name: e.target.value })} placeholder="e.g. Srikakulam district" className={inputCls} />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground">City (shown to the customer)</span>
                  <input value={editor.draft.city} onChange={(e) => patchDraft({ city: e.target.value })} placeholder="e.g. Palasa" className={inputCls} />
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground">
                  Pincodes with the same price — paste as many as you like · {parsePins(editor.draft.pincodes).length} added
                </span>
                <textarea
                  rows={3}
                  value={editor.draft.pincodes}
                  onChange={(e) => patchDraft({ pincodes: e.target.value })}
                  placeholder="532221, 532222, 532001"
                  className="w-full border border-border bg-background px-2.5 py-2 text-sm font-mono outline-none focus:border-emerald-600"
                />
              </label>
            </>
          )}
          <div className="flex flex-wrap gap-4 text-xs font-semibold">
            {editor.kind === "rule" && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editor.draft.active} onChange={(e) => patchDraft({ active: e.target.checked })} className="size-4 accent-emerald-700" />
                Active
              </label>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editor.draft.deliverable} onChange={(e) => patchDraft({ deliverable: e.target.checked })} className="size-4 accent-emerald-700" />
              We deliver here
            </label>
          </div>
          {editor.draft.deliverable && (
            <>
              <SlabEditor slabs={editor.draft.slabs} onChange={(slabs) => patchDraft({ slabs })} />
              <ExtraFields extraPerKg={editor.draft.extraPerKg} freeAbove={editor.draft.freeAbove} onChange={(p) => patchDraft(p)} />
            </>
          )}
        </Modal>
      )}

      {/* Bulk add */}
      {editor && editor.kind === "bulk" && (
        <Modal
          title="Bulk add pincodes"
          onClose={() => setEditor(null)}
          footer={
            <>
              <button type="button" onClick={() => setEditor(null)} className="px-4 h-9 border border-border text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={saveBulk} disabled={saving || !bulk.pins.length} className="inline-flex items-center gap-2 px-5 h-9 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold cursor-pointer">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save {bulk.pins.length || ""} pincodes
              </button>
            </>
          }
        >
          <p className="text-xs text-muted-foreground">
            One pincode per line: <strong>pincode, area, weight:charge, weight:charge…</strong> You can paste from Excel. A pincode that already has a
            rule is moved to the new price.
          </p>
          <textarea
            rows={10}
            value={bulkText}
            onChange={(e) => {
              setBulkText(e.target.value);
              setEditorErrors([]);
            }}
            placeholder={"532221, Palasa, 5:100, 10:150\n532222, Kasibugga, 5:120, 10:200\n532001, Srikakulam, 5:80, 10:130"}
            className="w-full border border-border bg-background px-2.5 py-2 text-sm font-mono outline-none focus:border-emerald-600"
          />
          <ErrorList errors={editorErrors.length ? editorErrors : bulkText.trim() ? bulk.errors.slice(0, 8) : []} />
          {bulk.pins.length > 0 && !bulk.errors.length && (
            <p className="text-xs font-semibold text-emerald-800">
              {bulk.pins.length} pincodes will be saved as {bulk.rules.length} rules (same area and prices are grouped).
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
