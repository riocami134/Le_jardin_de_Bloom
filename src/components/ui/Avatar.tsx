import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_PX: Record<NonNullable<AvatarProps["size"]>, number> = { sm: 32, md: 44, lg: 64 };

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Avatar({ name, imageUrl, size = "md", className }: AvatarProps) {
  const px = SIZE_PX[size];
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={px}
        height={px}
        className={cn("rounded-pill object-cover", className)}
      />
    );
  }
  return (
    <div
      style={{ width: px, height: px }}
      className={cn("flex items-center justify-center rounded-pill bg-sage text-ivory font-heading", className)}
      aria-hidden="true"
    >
      {initials(name) || "?"}
    </div>
  );
}
