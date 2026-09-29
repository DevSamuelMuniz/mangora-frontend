import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  surface?: "plain" | "light";
};

export default function BrandLogo({
  className = "h-9",
  priority = false,
  surface = "plain",
}: BrandLogoProps) {
  return (
    <span
      className={
        surface === "light"
          ? "inline-flex shrink-0 items-center rounded-2xl bg-white/95 px-3 py-2 shadow-lg shadow-orange-950/10"
          : "inline-flex shrink-0 items-center"
      }
    >
      <Image
        src="/mangora-logo.png"
        alt="Mangora"
        width={929}
        height={361}
        priority={priority}
        className={`${className} w-auto object-contain`}
      />
    </span>
  );
}
