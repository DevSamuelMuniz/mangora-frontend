import Image from "next/image";

const images = {
  wave: "wave", stand: "stand", approve: "approve", run: "shop",
  work: "work", point: "point", "point-left": "point-left",
  celebrate: "celebrate", wink: "wink", question: "question", think: "think",
  guide: "guide", relax: "relax", shop: "shop", "wave-paper": "wave-paper",
} as const;

type MascotPoseProps = {
  pose: keyof typeof images;
  className?: string;
  label?: string;
};

export default function MascotPose({ pose, className = "", label = "Mascote Mangora" }: MascotPoseProps) {
  return (
    <span className={`relative block aspect-[482/543] ${className}`}>
      <Image
        src={`/mascots/${images[pose]}.png`}
        alt={label}
        fill
        sizes="(max-width: 640px) 72vw, (max-width: 1024px) 384px, 480px"
        className="object-contain"
      />
    </span>
  );
}
