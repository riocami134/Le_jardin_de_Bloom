import Image from "next/image";
import { cn } from "@/lib/utils";

export interface PlantPhotoProps {
  url: string;
  alt: string;
  caption?: string | null;
  className?: string;
}

export function PlantPhoto({ url, alt, caption, className }: PlantPhotoProps) {
  return (
    <figure className={cn("overflow-hidden rounded-button bg-peach-light", className)}>
      <div className="relative aspect-square">
        <Image src={url} alt={alt} fill className="object-cover" sizes="200px" />
      </div>
      {caption && <figcaption className="p-1.5 text-center text-caption text-cocoa/60">{caption}</figcaption>}
    </figure>
  );
}
