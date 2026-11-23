import React from "react";
import type { ImageProps } from "next/image";

// Next's image runtime needs its server. This isolated harness uses plain images.
export default function Image({ src, alt, onError }: ImageProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={typeof src === "string" ? src : ""} alt={alt} onError={onError} />;
}
