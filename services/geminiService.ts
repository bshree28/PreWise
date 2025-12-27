
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse } from "../types";

// Always use process.env.API_KEY directly as per guidelines
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeIngredients = async (imageBase64: string): Promise<AnalysisResponse> => {
  const ai = getAI();

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      detectedIngredients: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of all edible items identified in the image."
      },
      recipes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING, enum: ["Main", "Snack", "Sweet"] },
            description: { type: Type.STRING },
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "The specific ingredients used in this recipe."
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            nutrition: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.STRING },
                protein: { type: Type.STRING },
                fat: { type: Type.STRING },
                carbs: { type: Type.STRING }
              },
              required: ["calories", "protein", "fat", "carbs"]
            },
            prepTime: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Advanced"] }
          },
          required: ["name", "category", "description", "ingredients", "steps", "nutrition", "prepTime", "difficulty"]
        }
      },
      shoppingList: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "A consolidated list of items needed for these recipes that might not be in the image."
      }
    },
    required: ["detectedIngredients", "recipes", "shoppingList"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64.split(',')[1] || imageBase64
            }
          },
          {
            text: "Analyze this image for ingredients. Then, generate exactly 6 distinct recipes based on them: 2 savory MAIN meals, 2 quick SNACKS, and 2 SWEET treats/desserts. Ensure each category has a high-quality selection. For each recipe, provide the specific category name, ingredients, steps, nutrition, and difficulty level. Also provide a consolidated shopping list for missing items across all 6 recipes."
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema
    }
  });

  // Access .text property directly (not as a function) as per latest SDK
  return JSON.parse(response.text || '{}') as AnalysisResponse;
};

export const generateDishImage = async (dishName: string, description: string): Promise<string | undefined> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A high-quality, professional food photography shot of a delicious dish: ${dishName}. Description: ${description}. The lighting is warm and inviting, plated beautifully on a modern plate in a bright kitchen setting.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      },
    });

    // Iterate through all parts to find the image part as per guidelines
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image generation failed for", dishName, error);
    return undefined;
  }
  return undefined;
};
