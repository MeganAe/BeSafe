import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

// Charge les variables d'environnement depuis le fichier .env
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

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
    const { age, weight, height, country, diet, physicalActivity, history, goal, language } = req.body;

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
      You are BeSafe, a senior AI health coach specializing in health-tech and preventive medicine.
      You are warm, professional, and rigorous.
      CRITICAL: Write all your analyses, comments, warnings, recommendations, and texts in ${language === "en" ? "English" : "French"}.
      You MUST return only a valid JSON matches the defined schema. Use the same keys as requested.
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
              description: "Analyse du risque de diabète",
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
    const { imageBase64, mimeType, country, goal, language } = req.body;

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

      Sois très attentif aux plats traditionnels et aliments locaux d'Afrique et d'ailleurs. Identifie-les précisément si présents.
      Retourne l'estimation des calories et la répartition nutritionnelle adaptée sous forme de JSON valide.
    `;

    const systemInstruction = `
      You are BeSafe, an AI expert in African and international nutrition.
      Analyze the provided meal image. Be precise, encouraging and clinical.
      CRITICAL: Write all your meal names, nutritional value, local ingredients, and suggestions in ${language === "en" ? "English" : "French"}.
      You MUST return only a valid JSON matches the defined schema. Use the same keys as requested.
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
              description: "Estimation totale de calories pour une portion normale",
            },
            nutritionalValue: {
              type: Type.STRING,
              description: "Évaluation de la valeur/qualité nutritionnelle (Macronutriments, vitamines, fibres...)",
            },
            localIngredients: {
              type: Type.STRING,
              description: "Ingrédients locaux clés identifiés ou typiquement associés à ce plat",
            },
            suggestions: {
              type: Type.STRING,
              description: "Améliorations nutritionnelles concrètes et bienveillantes pour ce repas spécifique",
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

// 3. ENDPOINT : Envoi de Rapport de Santé IA par Email
app.post("/api/send-email", async (req, res) => {
  try {
    const { to, subject, profile, trackingData, userName, userEmail } = req.body;

    if (!to) {
      return res.status(400).json({ error: "L'adresse email du destinataire est requise." });
    }

    const patientName = userName || "Membre BeSafe";
    const patientEmail = userEmail || "Non spécifié";

    // Modèle d'email HTML haute fidélité BeSafe
    const trackingRows = trackingData && trackingData.length > 0
      ? trackingData.map((t: any) => `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px; font-size: 13px; color: #334155;">${t.date}</td>
            <td style="padding: 10px; font-size: 13px; color: #3b82f6; font-weight: bold;">${t.weight} kg</td>
            <td style="padding: 10px; font-size: 13px; color: #10b981; font-weight: bold;">${t.healthScore} / 100</td>
          </tr>
        `).join("")
      : `<tr><td colspan="3" style="padding: 10px; text-align: center; color: #94a3b8; font-size: 12px;">Aucun historique de suivi enregistré.</td></tr>`;

    const emailHtmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Dossier Bilan BeSafe</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          
          <!-- En-tête -->
          <div style="background-color: #10b981; padding: 30px; text-align: left; background-image: linear-gradient(135deg, #10b981 0%, #059669 100%);">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">BeSafe &bull; Conseiller de Santé Personnel</h1>
            <p style="color: #d1fae5; margin: 5px 0 0 0; font-size: 13px; font-weight: 500;">Dossier de Santé Numérique &amp; Recommandations Préventives</p>
          </div>

          <div style="padding: 25px 30px;">
            
            <p style="font-size: 14px; text-align: right; color: #94a3b8; margin: 0 0 15px 0;">Émis le ${new Date().toLocaleDateString("fr-FR")}</p>

            <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 15px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">1. Profil Clinique de l'Utilisateur</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 6px 0; font-size: 13.5px; color: #64748b; width: 40%;"><strong>Patient :</strong></td>
                <td style="padding: 6px 0; font-size: 13.5px; color: #1e293b;">${patientName} (${patientEmail})</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 13.5px; color: #64748b;"><strong>Âge :</strong></td>
                <td style="padding: 6px 0; font-size: 13.5px; color: #1e293b;">${profile?.age || "Non spécifié"} ans</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 13.5px; color: #64748b;"><strong>Mesures d'évaluation :</strong></td>
                <td style="padding: 6px 0; font-size: 13.5px; color: #1e293b;">${profile?.weight || "Non spécifié"} kg &bull; ${profile?.height || "Non spécifié"} cm</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 13.5px; color: #64748b;"><strong>Activité &amp; Régime :</strong></td>
                <td style="padding: 6px 0; font-size: 13.5px; color: #1e293b;">${profile?.physicalActivity || "Non spécifié"} / ${profile?.diet || "Non spécifié"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 13.5px; color: #64748b;"><strong>Zone Évaluation (Pays) :</strong></td>
                <td style="padding: 6px 0; font-size: 13.5px; color: #1e293b; font-weight: bold; color: #10b981;">${profile?.country || "Non spécifié"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 13.5px; color: #64748b;"><strong>Score Global BeSafe :</strong></td>
                <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #059669; background-color: #ecfdf5; display: inline-block; padding: 4px 10px; border-radius: 8px; margin-top: 5px;">${profile?.healthScore || "N/A"} / 100</td>
              </tr>
            </table>

            <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 15px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">2. Analyse des Risques Métaboliques</h3>
            <div style="background-color: #f8fafc; border-left: 4px solid #f59e0b; padding: 12.5px 15px; margin-bottom: 15px; border-radius: 0 12px 12px 0;">
              <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #1e293b;">Risque Diabète Type 2 :</p>
              <p style="margin: 0; font-size: 12.5px; color: #475569; line-height: 1.5;">${profile?.diabetesRisk || "Analyse indisponible."}</p>
            </div>

            <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12.5px 15px; margin-bottom: 15px; border-radius: 0 12px 12px 0;">
              <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #1e293b;">Tension Artérielle &amp; Risque Vasculaire :</p>
              <p style="margin: 0; font-size: 12.5px; color: #475569; line-height: 1.5;">${profile?.hypertensionRisk || "Analyse indisponible."}</p>
            </div>

            <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12.5px 15px; margin-bottom: 25px; border-radius: 0 12px 12px 0;">
              <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #1e293b;">Qualité Globale de l'Alimentation :</p>
              <p style="margin: 0; font-size: 12.5px; color: #475569; line-height: 1.5;">${profile?.dietQuality || "Analyse indisponible."}</p>
            </div>

            <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 15px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">3. Courbe de Poids &amp; Historique de Santé</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1px solid #e2e8f0;">
              <thead>
                <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1; text-align: left;">
                  <th style="padding: 10px; font-size: 12px; font-weight: bold; color: #475569;">Période</th>
                  <th style="padding: 10px; font-size: 12px; font-weight: bold; color: #475569;">Poids</th>
                  <th style="padding: 10px; font-size: 12px; font-weight: bold; color: #475569;">Score de Santé</th>
                </tr>
              </thead>
              <tbody>
                ${trackingRows}
              </tbody>
            </table>

            <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 15px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">4. Recommandations Cliniques &amp; Conseils Nutritionnels</h3>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 18px; border-radius: 12px; margin-bottom: 10px;">
              <p style="margin: 0; font-size: 13.5px; color: #166534; line-height: 1.6; white-space: pre-line;">
                ${profile?.recommendations ? profile.recommendations.replace(/[\u2022\u25CF]/g, "-") : "Aucune recommandation générée."}
              </p>
            </div>

          </div>

          <div style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.4;">
              Ce mail automatisé contient les résultats d'évaluation clinique et d'hygiène préventive personnalisée de BeSafe. Transmettez ce bilan à votre médecin ou nutritionniste pour adapter de manière sécurisée vos futurs ajustements de santé.
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    // Vérifier les secrets SMTP configureés
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || `"BeSafe Coach" <noreply@besafe-health.com>`;

    if (smtpHost && smtpUser && smtpPass) {
      // Configuration SMTP réelle
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: to,
        subject: subject || `Bilan Santé de ${patientName} - Recommandations BeSafe`,
        html: emailHtmlBody
      });

      return res.json({ 
        success: true, 
        mode: "smtp",
        message: "L'e-mail avec le bilan santé a été envoyé avec succès !" 
      });
    } else {
      // Retourne le code HTML en fallback
      return res.json({
        success: false,
        mode: "unconfigured",
        message: "Variables SMTP non configurées sur ce conteneur Cloud Run.",
        html: emailHtmlBody,
        patientName,
        subject: subject || `Bilan Santé de ${patientName} - Recommandations BeSafe`
      });
    }

  } catch (err: any) {
    console.error("Erreur envoi de mail:", err);
    return res.status(500).json({ error: err.message || "Erreur interne lors du traitement de l'envoi de mail." });
  }
});

// Configure Vite ou sert les fichiers statiques de production
async function startApp() {
  const isProduction = process.env.NODE_ENV === "production" || __filename.endsWith("server.cjs");

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = __dirname;
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
