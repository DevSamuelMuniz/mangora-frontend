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
<<<<<<< HEAD
      <Image
        src="/mangora-logo.png"
        alt="Mangora"
        width={929}
        height={361}
        priority={priority}
        className={`${className} w-auto object-contain`}
      />
=======
      <span
        className={`relative block aspect-[2.525/1] shrink-0 overflow-hidden ${className}`}
      >
        <Image
          src="/mangora-logo.png"
          alt="Mangora"
          width={1448}
          height={1086}
          priority={priority}
          className="absolute left-1/2 top-1/2 h-auto w-[128.5%] max-w-none"
          style={{ transform: "translate(-53.2%, -51.3%)" }}
        />
      </span>
>>>>>>> 0e59a660a5acf0b652a188ddf2e8ccc96de79e4d
    </span>
  );
}
