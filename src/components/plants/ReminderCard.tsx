import Link from "next/link";
import { Card } from "@/components/ui/Card";

export interface ReminderCardProps {
  message: string;
  plantId?: string | null;
  plantName?: string | null;
}

const TYPE_ICON: Record<string, string> = {
  check_substrate: "💧",
  observe: "📸",
  fertilize: "🌸",
  repot: "🪴",
  protect_from_cold: "❄️",
  check_location: "📍",
};

export function ReminderCard({ message, plantId, plantName }: ReminderCardProps) {
  const icon = Object.entries(TYPE_ICON).find(([, i]) => message.startsWith(i))?.[1] ?? "🌿";
  const content = (
    <Card padded className="flex items-center gap-3 !py-3">
      <span className="text-h4" aria-hidden="true">
        {icon}
      </span>
      <p className="flex-1 text-small text-cocoa">{message}</p>
    </Card>
  );

  if (plantId) {
    return (
      <Link href={`/plants/${plantId}`} aria-label={`${message} — voir ${plantName ?? "la plante"}`}>
        {content}
      </Link>
    );
  }
  return content;
}
