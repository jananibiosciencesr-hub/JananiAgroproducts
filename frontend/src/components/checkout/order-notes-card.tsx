import React from "react";
import { MessageSquare, Sparkles } from "lucide-react";

interface OrderNotesCardProps {
  orderNotes: string;
  onChangeNotes: (notes: string) => void;
}

const PRESET_CHIPS = [
  "Leave at security / door",
  "Call 10 mins before arrival",
  "Do not ring doorbell",
  "Use plastic-free jute packing",
  "Include seasonal harvest recipes",
];

export function OrderNotesCard({ orderNotes, onChangeNotes }: OrderNotesCardProps) {
  const handleToggleChip = (chip: string) => {
    if (orderNotes.includes(chip)) {
      // Remove chip
      const updated = orderNotes
        .replace(chip, "")
        .replace(/,\s*,/g, ",")
        .replace(/^,\s*|,\s*$/g, "")
        .trim();
      onChangeNotes(updated);
    } else {
      // Append chip
      const updated = orderNotes.trim() ? `${orderNotes.trim()}, ${chip}` : chip;
      onChangeNotes(updated.slice(0, 200));
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="size-4 text-brand-leaf" />
          Delivery & Harvest Instructions
        </h4>
        <span className="text-[11px] text-muted-foreground font-mono">
          {orderNotes.length}/200
        </span>
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_CHIPS.map((chip) => {
          const isActive = orderNotes.includes(chip);
          return (
            <button
              key={chip}
              type="button"
              onClick={() => handleToggleChip(chip)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                isActive
                  ? "bg-brand-leaf text-white font-bold"
                  : "bg-secondary text-muted-foreground hover:bg-brand-leaf/10 hover:text-brand-leaf"
              }`}
            >
              {isActive ? "✓ " : "+ "}
              {chip}
            </button>
          );
        })}
      </div>

      {/* Textarea */}
      <div>
        <textarea
          rows={2}
          maxLength={200}
          placeholder="e.g. Please leave package with building security guard Mr. Verma..."
          value={orderNotes}
          onChange={(e) => onChangeNotes(e.target.value)}
          className="w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-brand-leaf text-foreground resize-none"
        />
      </div>
    </div>
  );
}
