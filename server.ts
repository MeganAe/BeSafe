import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Charge les variables d'environnement depuis le fichier .env
dotenv.config();

const app = express();
const PORT = 3000;

// Augmente la limite pour pouvoir recevoir des images base64 de repas
app.use(express.json({ limit: "15mb" }));

// Client Gemini instancié paresseusement (lazy rendering)
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it to your secrets or .env file.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// 1. ENDPOINT : Onboarding Santé IA
app.post("/api/gemini/onboard", async (req, res) => {
  try {
    const { age, weight, height, country, diet, physicalActivity, history, goal } = req.body;

    if (!age || !weight || !height) {
      return res.status(400).json({ error: "L'âge, le poids et la taille sont obligatoires." });
    }

    const ai = getGeminiClient();

    const promptText = `
      Analyse ce profil de santé :
      - Âge : ${age} ans
      - Poids : ${weight} kg
      - Taille : ${height} cm
      - Pays de résidence : ${country || "Non spécifié"}
      - Alimentation typique : ${diet}
      - Activité physique : ${physicalActivity}
      - Antécédents médicaux / Familiaux : ${history || "Aucun"}
      - Objectif bien-être : ${goal}

      Calcule un score de santé global sur 100 basé sur ces informations (IMC, activité physique, antécédents, alimentation).
      Fournis une évaluation concise et constructive concernant les risques de diabète, les risques d'hypertension, la qualité nutritionnelle générale de son alimentation actuelle, ainsi que des recommandations adaptées (notamment en lien avec la cuisine/le climat local de son pays si pertinent).
    `;

    const systemInstruction = `
      Tu es BeSafe, un coach de santé d'IA sénior spécialisé en health-tech et médecine préventive.
      Tu es chaleureux, professionnel et rigoureux. Formule tes conseils en français.
      Retourne uniquement des données JSON conformes au schéma défini.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: {
              type: Type.INTEGER,
              description: "Score de santé global entre 0 et 100",
            },
            diabetesRisk: {
              type: Type.STRING,
              description: "Analyse du risque de diabète basée sur les antécédents, le poids et l'alimentation",
            },
            hypertensionRisk: {
              type: Type.STRING,
              description: "Analyse du risque d'hypertension cardiovasculaire",
            },
            dietQuality: {
              type: Type.STRING,
              description: "Évaluation de la qualité de l'alimentation actuelle, forces et faiblesses",
            },
            recommendations: {
              type: Type.STRING,
              description: "Recommandations concrètes d'hygiène de vie et d'alimentation pour atteindre son objectif, incluant des ingrédients adaptés localement au pays indiqué.",
            },
          },
          required: ["healthScore", "diabetesRisk", "hypertensionRisk", "dietQuality", "recommendations"],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("L'IA n'a pas retourné de réponse lisible.");
    }

    const parsedJson = JSON.parse(textOutput.trim());
    return res.json(parsedJson);

  } catch (error: any) {
    console.error("Erreur onboarding Gemini:", error);
    return res.status(500).json({ error: error.message || "Erreur lors de l'analyse du profil par l'IA" });
  }
});

// 2. ENDPOINT : Analyse Photo de Repas IA
app.post("/api/gemini/analyze-meal", async (req, res) => {
  try {
    const { imageBase64, mimeType, country, goal } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Une image de repas sous forme de base64 est requise." });
    }

    const ai = getGeminiClient();

    // Nettoyage éventuel du préfixe base64
    let cleanBase64 = imageBase64;
    let finalMimeType = mimeType || "image/png";
    if (imageBase64.includes("data:")) {
      const parts = imageBase64.split(";base64,");
      if (parts.length === 2) {
        contentTypeMatched: {
          const match = parts[0].match(/data:(image\/\w+)/);
          if (match) {
            finalMimeType = match[1];
          }
        }
        cleanBase64 = parts[1];
      }
    }

    const imagePart = {
      inlineData: {
        mimeType: finalMimeType,
        data: cleanBase64,
      },
    };

    const textPromptText = `
      Identifie ce repas et analyse ses qualités nutritionnelles.
      Pays de l'utilisateur : ${country || "Non spécifié"}
      Objectif de l'utilisateur : ${goal || "Manger plus sainement"}

      Sois très attentif aux plats traditionnels et aliments locaux d'Afrique et d'ailleurs (comme le foufou, le sombé, les beignets haricots, le garri, le saka saka, le tiep, le doro wat, plantains, ignames ou autres repas selon le pays sélectionné). Identifie-les précisément si présents.
      Retourne l'estimation des calories et la répartition nutritionnelle adaptée sous forme de JSON valide.
    `;

    const systemInstruction = `
      Tu es BeSafe, un expert d'IA en nutrition africaine et internationale.
      Analyse l'image du repas fournie. Sois précis et encourageant.
      Retourne uniquement des données JSON conformes au schéma défini.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: {
        parts: [
          imagePart,
          { text: textPromptText }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mealName: {
              type: Type.STRING,
              description: "Nom du repas ou des aliments identifiés",
            },
            calories: {
              type: Type.INTEGER,
              description: "Estimation totale de calories pour une portion normale (ex: 550)",
            },
            nutritionalValue: {
              type: Type.STRING,
              description: "Évaluation de la valeur/qualité nutritionnelle (Teneur en macronutriments, vitamines, etc.)",
            },
            localIngredients: {
              type: Type.STRING,
              description: "Ingrédients locaux clés identifiés ou typiquement associés à ce plat (ex: Manioc, huile de palme, feuilles de manioc)",
            },
            suggestions: {
              type: Type.STRING,
              description: "Améliorations nutritionnelles concrètes et bienveillantes pour ce repas spécifique (ex: ajouter une portion de légumes, réduire l'huile, etc.)",
            },
          },
          required: ["mealName", "calories", "nutritionalValue", "localIngredients", "suggestions"],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("L'IA n'a pas retourné d'analyse pour cette image.");
    }

    const parsedJson = JSON.parse(textOutput.trim());
    return res.json(parsedJson);

  } catch (error: any) {
    console.error("Erreur analyse repas Gemini:", error);
    return res.status(500).json({ error: error.message || "Erreur lors de l'analyse nutritionnelle de l'image" });
  }
});

// Configure Vite ou sert les fichiers statiques de production
async function startApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BeSafe] Serveur démarré sur http://localhost:${PORT}`);
  });
}

startApp();
