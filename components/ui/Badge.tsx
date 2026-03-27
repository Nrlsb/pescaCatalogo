interface BadgeProps {
  children: React.ReactNode;
  color?: "green" | "yellow" | "red" | "blue" | "gray" | "indigo" | "purple" | "orange";
  size?: "sm" | "md";
}

const colors = {
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
  blue: "bg-blue-100 text-blue-800",
  gray: "bg-gray-100 text-gray-700",
  indigo: "bg-indigo-100 text-indigo-800",
  purple: "bg-purple-100 text-purple-800",
  orange: "bg-orange-100 text-orange-800",
};

export default function Badge({
  children,
  color = "gray",
  size = "md",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colors[color]} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-0.5 text-xs"
      }`}
    >
      {children}
    </span>
  );
}
