import { useRef, useState } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export default function TiltCard({
  children,
  className = "",
  maxTilt = 12,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const [style, setStyle] = useState({
    transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)",
  });

  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

const intensity = 2.5;

const rotateY =
  ((x - rect.width / 2) / (rect.width / 2)) *
  maxTilt *
  intensity;

const rotateX =
  -((y - rect.height / 2) / (rect.height / 2)) *
  maxTilt *
  intensity;

    setStyle({
      transform: `
        perspective(1200px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(1.05)
      `,
    });
  };

  const handlePointerLeave = () => {
    setStyle({
      transform:
        "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)",
    });
  };

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        ...style,
        transition: "transform 120ms ease-out",
        transformStyle: "preserve-3d",
        touchAction: "none",
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </div>
  );
}