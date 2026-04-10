/**
 * Photo-based meal recognition using Gemini Vision.
 * Analyzes food photos and returns detected items with estimated portions and macros.
 */
import { getGeminiClient } from '../../ai/lib/gemini';
import { GEMINI_API_KEY } from '../../../config/env';

export interface DetectedFood {
  name: string;
  nameEs: string;
  estimatedGrams: number;
  macros: { cal: number; pro: number; carbs: number; fats: number };
  confidence: 'high' | 'medium' | 'low';
}

const FOOD_DETECTION_PROMPT = `Analyze this food photo and identify each food item visible. For each item, estimate the portion size in grams and calculate approximate macros for that portion.

Return a JSON array with this exact structure:
[
  {
    "name": "Food name in English",
    "nameEs": "Nombre del alimento en español",
    "estimatedGrams": 150,
    "macros": { "cal": 250, "pro": 31, "carbs": 0, "fats": 5 },
    "confidence": "high"
  }
]

Rules:
- Estimate realistic portion sizes based on visual cues (plate size, utensils, etc.)
- macros should be for the estimated portion, NOT per 100g
- confidence: "high" if clearly identifiable, "medium" if partially visible/uncertain, "low" if guessing
- Return ONLY the JSON array, no other text
- If no food is detected, return []
- Be specific: "Pechuga de Pollo a la Plancha" not just "Pollo"
- Include sauces, sides, and garnishes as separate items if significant`;

/** Read a File as base64 (without the data URL prefix). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Analyze a food photo with Gemini Vision and return detected foods. */
export async function analyzePhotoMeal(
  base64Data: string,
  mimeType: string = 'image/jpeg',
): Promise<DetectedFood[]> {
  if (!GEMINI_API_KEY) {
    // Demo fallback when no API key configured
    await new Promise(r => setTimeout(r, 1500));
    return [
      { name: 'Grilled Chicken Breast', nameEs: 'Pechuga de Pollo a la Plancha', estimatedGrams: 170, macros: { cal: 280, pro: 52, carbs: 0, fats: 6 }, confidence: 'high' },
      { name: 'White Rice', nameEs: 'Arroz Blanco', estimatedGrams: 150, macros: { cal: 195, pro: 4, carbs: 43, fats: 0.4 }, confidence: 'medium' },
      { name: 'Mixed Salad', nameEs: 'Ensalada Mixta', estimatedGrams: 80, macros: { cal: 15, pro: 1, carbs: 3, fats: 0.2 }, confidence: 'medium' },
    ];
  }

  const ai = await getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: FOOD_DETECTION_PROMPT },
          { inlineData: { mimeType, data: base64Data } },
        ],
      },
    ],
    config: { temperature: 0.2 },
  });

  const text = response.text || '';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
