/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.png" {
  const value: ImageMetadata;
  export default value;
}

declare module "*.jpg" {
  const value: ImageMetadata;
  export default value;
}

declare module "*.jpeg" {
  const value: ImageMetadata;
  export default value;
}

declare module "*.svg" {
  const value: ImageMetadata;
  export default value;
}

declare module "*.gif" {
  const value: ImageMetadata;
  export default value;
}

declare module "*.webp" {
  const value: ImageMetadata;
  export default value;
}

declare module "*.avif" {
  const value: ImageMetadata;
  export default value;
}