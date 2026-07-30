import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(root, "..");
const sourcePath = path.join(
  projectRoot,
  "assets",
  "Gemini_Generated_Image_vp8eigvp8eigvp8e.png",
);

const BLACK = { r: 11, g: 9, b: 8, alpha: 1 };
const CREAM = { r: 236, g: 227, b: 208 };
const INK = { r: 32, g: 26, b: 18 };
const WHITE = { r: 255, g: 255, b: 255 };

/** Finds the tight pixel bounding box of the white line-art directly (sharp's
 * `.trim()` wasn't strict enough against the source's grainy near-black backdrop
 * and left large, uneven margins), so the crop below is based on ground truth
 * rather than a fuzzy background-matching heuristic. */
async function findContentBounds(image, width, height, channels) {
  const excludeX = width * 0.85;
  const excludeY = height * 0.8;
  const BRIGHT = 150;
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Bottom-right corner of the source has a decorative sparkle artifact from
      // the generator, not part of the logo — exclude that zone from the bounds.
      if (x > excludeX && y > excludeY) continue;
      const idx = (y * width + x) * channels;
      const brightness = (image[idx] + image[idx + 1] + image[idx + 2]) / 3;
      if (brightness > BRIGHT) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, maxX, minY, maxY };
}

async function getTrimmedLogo() {
  const { data, info } = await sharp(sourcePath).raw().toBuffer({ resolveWithObject: true });
  const { minX, maxX, minY, maxY } = await findContentBounds(
    data,
    info.width,
    info.height,
    info.channels,
  );
  const contentHeight = maxY - minY;
  const centerX = (minX + maxX) / 2;

  // The full figure (bar + plates) is over 2:1 — fitting that into a square icon
  // leaves large empty bars above/below. Crop in from both sides to ~1.45:1,
  // keeping the skull/horns/ribcage/hands and a clearly readable slice of each
  // plate (enough to still read as a loaded barbell) while dropping the outer
  // rims, so the mark actually fills the icon instead of floating in black space.
  const targetRatio = 1.45;
  const targetWidth = Math.round(contentHeight * targetRatio);
  const left = Math.round(centerX - targetWidth / 2);

  return sharp(sourcePath)
    .extract({ left, top: minY, width: targetWidth, height: contentHeight })
    .toBuffer();
}

/** Builds a transparent-background PNG from the white line-art by using its own
 * luminance (thresholded to remove the grainy dark background) as the alpha channel,
 * recoloring the line art to `ink` so it stays visible against light or dark surfaces. */
async function buildTransparentLogo(trimmedBuffer, size, ink) {
  const contained = await sharp(trimmedBuffer)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const { data, info } = await sharp(contained)
    .grayscale()
    .threshold(120)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    rgba[i * 4] = ink.r;
    rgba[i * 4 + 1] = ink.g;
    rgba[i * 4 + 2] = ink.b;
    rgba[i * 4 + 3] = data[i];
  }
  return sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png();
}

/** Like buildTransparentLogo, but resizes to a target height while keeping the
 * logo's natural aspect ratio — for a background watermark, not a square icon
 * slot, so there's no reason to letterbox it into a square. */
async function buildTransparentLogoNatural(trimmedBuffer, height, ink) {
  const resized = await sharp(trimmedBuffer)
    .resize({ height, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const { data, info } = await sharp(resized).grayscale().threshold(120).raw().toBuffer({ resolveWithObject: true });

  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    rgba[i * 4] = ink.r;
    rgba[i * 4 + 1] = ink.g;
    rgba[i * 4 + 2] = ink.b;
    rgba[i * 4 + 3] = data[i];
  }
  return sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png();
}

async function main() {
  const trimmed = await getTrimmedLogo();

  const solidTargets = [
    { out: "public/icons/icon-192.png", size: 192 },
    { out: "public/icons/icon-512.png", size: 512 },
    { out: "src/app/apple-icon.png", size: 180 },
    { out: "src/app/icon.png", size: 512 },
  ];
  for (const { out, size } of solidTargets) {
    // The source's "black" backdrop is actually a grainy dark gray (~RGB 20-30),
    // clearly lighter than a true black canvas — compositing the raw crop left a
    // visible rectangle where it sat on top of the flat BLACK fill. Keying it out
    // (same threshold used for the transparent badge variants) and compositing
    // just the white line art avoids that seam entirely: one flat BLACK fill,
    // fit into 90% of the canvas so the mark doesn't hard-touch the edges.
    const innerSize = Math.round(size * 0.9);
    const cutout = await (await buildTransparentLogo(trimmed, innerSize, WHITE)).toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: BLACK } })
      .composite([{ input: cutout, gravity: "center" }])
      .flatten({ background: BLACK })
      .png()
      .toFile(path.join(projectRoot, out));
    console.log(`wrote ${out} (${size}x${size})`);
  }

  const badgeDark = await buildTransparentLogo(trimmed, 240, INK);
  await badgeDark.toFile(path.join(projectRoot, "public/brand/badge-light-bg.png"));
  console.log("wrote public/brand/badge-light-bg.png (240x240, transparent, dark ink)");

  const badgeLight = await buildTransparentLogo(trimmed, 240, CREAM);
  await badgeLight.toFile(path.join(projectRoot, "public/brand/badge-dark-bg.png"));
  console.log("wrote public/brand/badge-dark-bg.png (240x240, transparent, light ink)");

  const watermarkLight = await buildTransparentLogoNatural(trimmed, 900, INK);
  await watermarkLight.toFile(path.join(projectRoot, "public/brand/watermark-light-bg.png"));
  console.log("wrote public/brand/watermark-light-bg.png (900px tall, transparent, dark ink)");

  const watermarkDark = await buildTransparentLogoNatural(trimmed, 900, CREAM);
  await watermarkDark.toFile(path.join(projectRoot, "public/brand/watermark-dark-bg.png"));
  console.log("wrote public/brand/watermark-dark-bg.png (900px tall, transparent, light ink)");
}

main();
