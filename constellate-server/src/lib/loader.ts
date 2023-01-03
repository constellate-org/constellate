import { ImageLoader } from "next/legacy/image";

export const imageLoader: ImageLoader = ({ src, width, quality }) =>
  `${src}?w=${width}&q=${quality || 75}`;
