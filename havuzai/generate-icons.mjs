// Kullanım (havuzai klasöründe, yani package.json'ın olduğu yerde):
//   node generate-icons.mjs
// Hata verirse önce:  npm i sharp
//
// public/pools/favicon-logo-havuzai.png dosyasından PWA ikonlarını üretir:
//   public/icons/icon-192.png
//   public/icons/icon-512.png
//   public/icons/icon-maskable-512.png   (Android'in yuvarlak/kare kırpmasına güvenli, daha çok boşluklu)
//   public/icons/apple-touch-icon.png    (iPhone ana ekran ikonu)

import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "public/pools/favicon-logo-havuzai.png";
const OUT = "public/icons";
const BG = "#FFFFFF"; // logo koyu renkli olduğu için beyaz zemin

await mkdir(OUT, { recursive: true });

async function make(size, padRatio, name) {
  const inner = Math.round(size * (1 - padRatio * 2));
  const logo = await sharp(SRC)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(`${OUT}/${name}`);

  console.log("oluşturuldu:", `${OUT}/${name}`);
}

await make(192, 0.12, "icon-192.png");
await make(512, 0.12, "icon-512.png");
await make(512, 0.22, "icon-maskable-512.png");
await make(180, 0.12, "apple-touch-icon.png");
