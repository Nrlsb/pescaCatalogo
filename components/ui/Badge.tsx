interface BadgeProps {
  children: React.ReactNode;
  color?: "green" | "yellow" | "red" | "blue" | "gray" | "indigo" | "purple" | "orange";
  size?: "sm" | "md";
}

const colors = {
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  yellow: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  red: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
  gray: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30",
  purple: "bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-400 border-violet-200 dark:border-violet-500/30",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/30",
};

export default function Badge({
  children,
  color = "gray",
  size = "md",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-lg font-semibold border shadow-sm transition-all ${colors[color]} ${
        size === "sm" ? "px-2 py-0.5 text-[10px] uppercase tracking-wider" : "px-3 py-1 text-xs"
      }`}
    >
      {children}
    </span>
  );
}

