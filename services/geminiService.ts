
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const parseRecipeFromUrl = async (url: string): Promise<Partial<Recipe>> => {
  const prompt = `Analiza este enlace de receta: ${url}. 
  Extrae la información de la receta incluyendo título, ingredientes detallados, pasos, tiempos y categoría. 
  Si no puedes acceder al contenido directamente, imagina una receta coherente basada en el título del video o la URL si es descriptiva.
  Proporciona la respuesta en formato JSON estructurado.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          prepTime: { type: Type.NUMBER },
          cookTime: { type: Type.NUMBER },
          difficulty: { type: Type.STRING, enum: Object.values(Difficulty) },
          servings: { type: Type.NUMBER },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.STRING },
                unit: { type: Type.STRING }
              },
              required: ["name", "amount", "unit"]
            }
          },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                durationSeconds: { type: Type.NUMBER }
              },
              required: ["description"]
            }
          },
          notes: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          thumbnail: { type: Type.STRING }
        },
        required: ["title", "ingredients", "steps"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return {
      ...data,
      sourceUrl: url,
      createdAt: Date.now()
    };
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("No se pudo procesar la receta correctamente.");
  }
};
