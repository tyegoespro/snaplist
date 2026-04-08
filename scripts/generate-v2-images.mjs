import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: 'AIzaSyBeox_haIhwaiwNhe-aJGNInh_ur-3dBAQ' });
const outDir = path.resolve('public/images/landing');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const prompts = [
  // How It Works step images — diverse product scenarios
  {
    name: 'step-snap.png',
    prompt: `Studio-quality product photography: A person's hands holding a smartphone, photographing a pair of limited-edition high-top sneakers on a clean dark surface. The phone screen shows the camera viewfinder. Soft dramatic studio lighting with purple accent rim lighting. Shallow depth of field, dark moody background. Corporate product photography style, photorealistic, cinematic quality.`
  },
  {
    name: 'step-identify.png',
    prompt: `Futuristic tech visualization: Glowing purple and blue holographic scan lines tracing over a vintage mechanical wristwatch on dark surface. Floating translucent data panels showing brand name, condition rating, and price estimate. Photorealistic product with sci-fi hologram overlay elements. Deep purple and indigo lighting on dark background. Corporate tech product photography, cinematic.`
  },
  {
    name: 'step-refine.png',
    prompt: `Studio product photography: A tablet on a desk showing a clean digital listing editor with a professional camera lens as the product photo on screen. Next to the tablet sits the actual lens. Warm studio lighting, dark background with subtle purple backlight glow. Corporate tech photography style, shallow depth of field, photorealistic, 4K quality.`
  },
  {
    name: 'step-list.png',
    prompt: `Studio product photography: A laptop on a sleek dark desk displaying multiple colorful marketplace interface cards. Surrounding the laptop are diverse items ready to sell: vinyl records, retro gaming controller, designer sunglasses. Moody dark background with soft purple accent lighting reflecting on the desk. Corporate product photography, cinematic composition, photorealistic.`
  },

  // Diverse showcase images
  {
    name: 'showcase-electronics.png',
    prompt: `Studio product photography: Premium wireless over-ear headphones, a smartwatch, and a portable Bluetooth speaker arranged artistically on dark reflective surface. Dramatic lighting with purple and blue accent lights creating rim lighting effects. Dark moody background, premium corporate product photography, high-end brand aesthetic, photorealistic 4K.`
  },
  {
    name: 'showcase-sneakers.png',
    prompt: `Studio product photography: A pair of premium high-top basketball sneakers on a dark reflective surface. One standing upright, one on its side. Dramatic purple and blue studio rim lighting highlighting the texture and details. Premium fashion editorial style, dark moody background, corporate product photography, photorealistic.`
  },
  {
    name: 'showcase-vintage.png',
    prompt: `Studio product photography: Vintage collectibles arrangement - a retro film camera, old vinyl record partially out of its sleeve, and antique pocket watch on an aged dark leather surface. Warm studio lighting with cool purple accent highlights. Dark background, editorial corporate photography style, shallow depth of field, photorealistic.`
  },

  // Better AI brain visualization
  {
    name: 'ai-brain.png',
    prompt: `Digital art illustration: A stylized neural network brain made of glowing purple circuit pathways and electric connections, floating in dark space. Branching data streams show icons of different product categories. Futuristic tech visualization with deep purple, indigo and electric blue colors on black background. Clean corporate tech art style, high resolution.`
  },
];

async function generate() {
  for (const { name, prompt } of prompts) {
    const outPath = path.join(outDir, name);
    if (fs.existsSync(outPath)) {
      console.log(`⏭ Skipping ${name} (already exists)`);
      continue;
    }
    console.log(`\n🎨 Generating: ${name}`);
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: prompt,
      });

      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (part?.inlineData?.data) {
        fs.writeFileSync(outPath, Buffer.from(part.inlineData.data, 'base64'));
        console.log(`   ✅ Saved → ${name}`);
      } else {
        console.log(`   ⚠️ No image data for ${name}`);
        const textParts = response.candidates?.[0]?.content?.parts?.filter(p => p.text);
        if (textParts?.length) console.log(`   Text: ${textParts[0].text.substring(0, 100)}`);
      }
    } catch (err) {
      console.error(`   ❌ Error: ${err.message?.substring(0, 200)}`);
      if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        console.log('   ⏳ Rate limited, waiting 60s...');
        await new Promise(r => setTimeout(r, 60000));
      }
    }

    // Delay between requests to avoid rate limits
    await new Promise(r => setTimeout(r, 5000));
  }
  
  console.log('\n🎉 Done generating images.');
}

generate().catch(console.error);
