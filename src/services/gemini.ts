import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const STYLES = [
  { id: "ghibli", name: "吉卜力風格", prompt: "Transform this image into a Studio Ghibli anime style. Use soft colors, hand-painted textures, and a whimsical atmosphere characteristic of Hayao Miyazaki's films." },
  { id: "sketch", name: "素描風格", prompt: "Transform this image into a detailed pencil sketch. Use cross-hatching, shading, and graphite textures on a slightly textured paper background." },
  { id: "baroque", name: "巴洛克風格", prompt: "Transform this image into a Baroque painting. Use dramatic lighting (chiaroscuro), rich deep colors, intense emotions, and ornate details characteristic of the 17th century." },
  { id: "impressionism", name: "印象派風格", prompt: "Transform this image into an Impressionist painting. Use visible brushstrokes, emphasis on light and its changing qualities, and vibrant colors like Monet or Renoir." },
  { id: "surrealism", name: "超現實風格", prompt: "Transform this image into a Surrealist masterpiece. Incorporate dream-like elements, illogical juxtapositions, and bizarre imagery inspired by Salvador Dalí or René Magritte." },
  { id: "christmas", name: "聖誕節氛圍", prompt: "Add a festive Christmas atmosphere to this image. Include elements like warm fairy lights, pine branches, ornaments, a cozy glow, and perhaps some light snow." },
  { id: "snoopy", name: "與史努比合照", prompt: "Modify this image to include Snoopy from Peanuts. Snoopy should be interacting naturally with the subjects in the photo in his classic 2D comic style." },
  { id: "dragonball", name: "漫畫七龍珠風格", prompt: "Transform the subjects in this image into the iconic Dragon Ball manga style by Akira Toriyama. Use sharp, angular line art, muscular character designs, intense expressions, and dynamic energy effects (like Ki auras). The shading should be simple but bold cel-shading." },
  { id: "oilpainting", name: "油畫風格", prompt: "Transform this image into a classic oil painting. Use thick, textured brushstrokes (impasto), rich colors, and a visible canvas texture. The lighting should be warm and artistic." },
  { id: "hanfu", name: "中式古裝風格", prompt: "Transform the subjects in the image into traditional Chinese ancient costumes (Hanfu). Use elegant silk textures, intricate embroidery, and traditional hairstyles. The background should evoke a classical Chinese garden or landscape painting feel." },
  { id: "bollywood", name: "印度歌舞劇風格", prompt: "Transform this image into a vibrant Bollywood musical style. Use extremely colorful and ornate Indian traditional clothing (like Saris or Sherwanis), heavy jewelry, festive lighting, and a celebratory, high-energy atmosphere." },
  { id: "bigeyemanga", name: "大眼可愛漫畫風格", prompt: "Transform the subjects into a cute Japanese manga style with characteristic large, expressive eyes. Use clean line art, soft cel-shading, and an adorable, 'kawaii' aesthetic." },
];

export async function transformImage(base64Image: string, mimeType: string, styleId: string) {
  const style = STYLES.find(s => s.id === styleId);
  if (!style) throw new Error("Invalid style selected");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: `${style.prompt} CRITICAL: Maintain very high facial similarity (at least 85%) to the original person in the photo. Ensure their unique facial features, structure, and identity are clearly preserved and recognizable while applying the requested artistic style.`,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated in the response");
}
