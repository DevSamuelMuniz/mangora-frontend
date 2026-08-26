type MascotPoseName =
  | "wave"
  | "approve"
  | "run"
  | "work"
  | "point"
  | "celebrate";

type MascotPoseProps = {
  pose: MascotPoseName;
  className?: string;
  label?: string;
};

const positions: Record<MascotPoseName, string> = {
  wave: "0% 0%",
  approve: "50% 0%",
  run: "100% 0%",
  work: "0% 100%",
  point: "50% 100%",
  celebrate: "97% 100%",
};

export default function MascotPose({
  pose,
  className = "",
  label = "Mascote Mangora",
}: MascotPoseProps) {
  return (
    <span
      role="img"
      aria-label={label}
      className={`block aspect-[482/543] bg-no-repeat ${className}`}
      style={{
        backgroundImage: "url('/mangora-mascote-poses.png')",
        backgroundPosition: positions[pose],
        backgroundSize: "300% 200%",
        clipPath: pose === "point" ? "inset(0 10% 0 0)" : undefined,
      }}
    />
  );
}
