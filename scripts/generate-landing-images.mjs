import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";

const ai = new GoogleGenAI({ apiKey: process.argv[2] });
const outDir = path.resolve("public/images/landing");
fs.mkdirSync(outDir, { recursive: true });

const images = [
  {
    name: "hero.png",
    prompt: "Ultra-premium studio product photography: A luxury brown leather crossbody handbag sitting on a sleek black reflective surface with dramatic moody lighting. Soft gradient purple and blue ambient light in the background. A subtle holographic scanning grid overlay effect on the bag suggesting AI analysis. Clean, minimal, dark background. Shot on a Phase One camera. Corporate advertising quality for a tech company. No text, no logos, no watermarks.",
  },
  {
    name: "snap.png",
    prompt: "Ultra-premium studio photograph: A hand holding a modern smartphone, photographing a designer luxury item on a clean dark surface. Dramatic studio lighting with soft purple ambient glow. The phone screen shows a camera viewfinder. Dark, moody, cinematic atmosphere. Professional advertising photography quality. Shallow depth of field. No text, no logos, no watermarks.",
  },
  {
    name: "ai.png",
    prompt: "Ultra-premium abstract technology visualization: Glowing purple and blue neural network lines forming a circular pattern on a pure black background. Subtle data points and connection nodes. Represents AI and machine learning analysis. Elegant, minimal, corporate-grade design. Similar to tech company marketing visuals for an IPO presentation. No text, no logos, no watermarks.",
  },
  {
    name: "refine.png",
    prompt: "Ultra-premium studio photograph: A close-up of a luxury item label or tag being examined under soft purple light. A magnifying glass or lens effect showing fine detail of stitching and material. Dark moody background. Represents precision, refinement, and quality control in authentication. Professional advertising photography. No text, no logos, no watermarks.",
  },
  {
    name: "verify.png",
    prompt: "Ultra-premium studio photograph: A luxury handbag hardware closeup - gold-tone clasp, zipper pull, or buckle detail on dark leather. Dramatic lighting revealing authentic craftsmanship details. Shallow depth of field. Dark moody background with subtle purple accent light. Represents brand verification and authenticity checking. Professional advertising photography. No text, no logos, no watermarks.",
  },
  {
    name: "export.png",
    prompt: "Ultra-premium studio photograph: Multiple floating translucent glass cards arranged in a fan pattern on a dark background with soft purple and teal gradient lighting. Clean, minimal, futuristic feel. Corporate advertising photography quality. Represents cross-platform digital listing and export. No text, no logos, no watermarks.",
  },
];

async function generateImage(img) {
  console.log(`Generating ${img.name}...`);
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: img.prompt,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const buffer = Buffer.from(part.inlineData.data, "base64");
        const filePath = path.join(outDir, img.name);
        fs.writeFileSync(filePath, buffer);
        console.log(`  ✅ Saved ${img.name} (${(buffer.length / 1024).toFixed(0)} KB)`);
        return true;
      }
    }
    console.log(`  ⚠️ No image data in response for ${img.name}`);
    return false;
  } catch (err) {
    console.error(`  ❌ Error generating ${img.name}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log("🎨 Generating studio-quality landing page images with Nano Banana Pro...\n");
  
  let success = 0;
  for (const img of images) {
    const ok = await generateImage(img);
    if (ok) success++;
    // Small delay between requests
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log(`\n✨ Done! ${success}/${images.length} images generated to ${outDir}`);
}

main();
