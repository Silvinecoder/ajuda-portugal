import type { Urgency } from "../types";

const OPTIONS: { value: Urgency | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "Critico", label: "Crítico" },
  { value: "urgent", label: "Urgente" },
  { value: "standard", label: "Normal" },
  { value: "recovery", label: "Recuperação" },
];

interface FilterBarProps {
  value: Urgency | "all";
  onChange: (v: Urgency | "all") => void;
}

export default function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className="filter-bar">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={`filter-btn filter-btn--${opt.value} ${
            value === opt.value ? "active" : ""
          }`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
