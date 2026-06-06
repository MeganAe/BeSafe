import { useState, useEffect, FormEvent } from "react";
import { User } from "firebase/auth";
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { ProfileData, MealData } from "../types";
import MealAnalyzer from "./MealAnalyzer";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, Sparkles, LogOut, RefreshCw, Calendar, 
  Trash2, Flame, Apple, Info, ShieldAlert, CheckCircle2,
  ChevronRight, Smile, Award, Activity, Compass,
  Plus, Check, Bell, FileText, TrendingUp
} from "lucide-react";
import { jsPDF } from "jspdf";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";

interface TrackingEntry {
  date: string;
  weight: number;
  healthScore: number;
}

interface DashboardViewProps {
  user: User;
  profile: ProfileData;
  onResetProfile: () => void;
}

export default function DashboardView({ user, profile, onResetProfile }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"diagnostic" | "recipes" | "analyzer" | "history">("diagnostic");
  const [mealsList, setMealsList] = useState<MealData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // États pour les notifications de rappel de repas
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // États pour le graphique Recharts des tendances de poids / score
  const [trackingData, setTrackingData] = useState<TrackingEntry[]>([]);
  const [showAddTrackForm, setShowAddTrackForm] = useState(false);
  const [trackWeight, setTrackWeight] = useState(profile.weight.toString());
  const [trackScore, setTrackScore] = useState(profile.healthScore.toString());
  const [trackDate, setTrackDate] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationsSupported(true);
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  // Génération ou récupération des données de suivi de santé (poids + score)
  useEffect(() => {
    const saved = localStorage.getItem(`besafe_health_tracking_${user.uid}`);
    if (saved) {
      try {
        setTrackingData(JSON.parse(saved));
      } catch (e) {
        console.error("Erreur de parsing du suivi de poids:", e);
      }
    } else {
      const targetWeight = profile.weight;
      const targetScore = profile.healthScore;
      const isWeightLoss = profile.goal.toLowerCase().includes("perdre") || profile.goal.toLowerCase().includes("poids") || profile.goal.toLowerCase().includes("maigrir");
      const isWeightGain = profile.goal.toLowerCase().includes("prendre") || profile.goal.toLowerCase().includes("masse") || profile.goal.toLowerCase().includes("grossir");

      const initialEntries: TrackingEntry[] = [
        {
          date: "Sem. -4",
          weight: isWeightLoss ? parseFloat((targetWeight + 2.0).toFixed(1)) : isWeightGain ? parseFloat((targetWeight - 1.5).toFixed(1)) : targetWeight,
          healthScore: Math.max(30, targetScore - 12)
        },
        {
          date: "Sem. -3",
          weight: isWeightLoss ? parseFloat((targetWeight + 1.4).toFixed(1)) : isWeightGain ? parseFloat((targetWeight - 1.1).toFixed(1)) : targetWeight,
          healthScore: Math.max(30, targetScore - 8)
        },
        {
          date: "Sem. -2",
          weight: isWeightLoss ? parseFloat((targetWeight + 0.9).toFixed(1)) : isWeightGain ? parseFloat((targetWeight - 0.7).toFixed(1)) : targetWeight,
          healthScore: Math.max(30, targetScore - 5)
        },
        {
          date: "Sem. -1",
          weight: isWeightLoss ? parseFloat((targetWeight + 0.3).toFixed(1)) : isWeightGain ? parseFloat((targetWeight - 0.2).toFixed(1)) : targetWeight,
          healthScore: Math.max(30, targetScore - 2)
        },
        {
          date: "Aujourd'hui",
          weight: targetWeight,
          healthScore: targetScore
        }
      ];
      setTrackingData(initialEntries);
      localStorage.setItem(`besafe_health_tracking_${user.uid}`, JSON.stringify(initialEntries));
    }
  }, [user.uid, profile.weight, profile.healthScore, profile.goal]);

  // Ajouter un nouveau point de mesure
  const handleAddTracking = (e: FormEvent) => {
    e.preventDefault();
    const parsedWeight = parseFloat(trackWeight);
    const parsedScore = parseInt(trackScore);

    if (isNaN(parsedWeight) || isNaN(parsedScore)) {
      alert("Veuillez saisir des valeurs numériques correctes.");
      return;
    }

    const entryLabel = trackDate.trim() || new Date().toLocaleDateString("fr-FR", { month: "short", day: "numeric" });
    const newEntry: TrackingEntry = {
      date: entryLabel,
      weight: parsedWeight,
      healthScore: parsedScore
    };

    const updated = [...trackingData, newEntry];
    setTrackingData(updated);
    localStorage.setItem(`besafe_health_tracking_${user.uid}`, JSON.stringify(updated));
    setShowAddTrackForm(false);
    setTrackDate("");
  };

  // Demander la permission de notifier l'utilisateur
  const handleRequestNotifications = async () => {
    if (!("Notification" in window)) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        new Notification("Coach BeSafe", {
          body: "Rappels quotidiens de repas configurés avec succès ! Nous prendrons soin de vous.",
          icon: "/favicon.ico"
        });
      } else {
        setNotificationsEnabled(false);
        alert("Les notifications ont été désactivées via vos préférences navigateur.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Téléchargement du diagnostic PDF avec jspdf
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();

      // En-tête stylisé vert émeraude
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.rect(0, 0, 210, 42, "F");

      // Titre principal
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("BeSafe - Rapport de Diagnostic Sante", 15, 20);

      // Sous-titre
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Genere par l'IA le ${new Date().toLocaleDateString("fr-FR")} pour consultation medicale`, 15, 30);

      let y = 52;

      // Section 1: Informations Générales
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59); // slate-800
      doc.setFontSize(13);
      doc.text("1. Profil de l'Utilisateur", 15, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(`Patient : ${user.displayName || "Membre BeSafe"}`, 15, y);
      doc.text(`Email : ${user.email || ""}`, 110, y);
      y += 6;
      doc.text(`Age : ${profile.age} ans`, 15, y);
      doc.text(`Pays d'evaluation : ${profile.country}`, 110, y);
      y += 6;
      doc.text(`Poids d'evaluation : ${profile.weight} kg`, 15, y);
      doc.text(`Taille d'evaluation : ${profile.height} cm`, 110, y);
      y += 6;
      doc.text(`Activite sportive : ${profile.physicalActivity}`, 15, y);
      doc.text(`Regime alimentaire : ${profile.diet}`, 110, y);
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 185, 129);
      doc.text(`Score Final BeSafe : ${profile.healthScore} / 100`, 15, y);
      y += 12;

      // Section 2: Analyse des Risques Métaboliques
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(13);
      doc.text("2. Evaluation des Risques Metaboliques", 15, y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
      doc.text("Facteurs de Diabete de type 2 :", 15, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const diabetesLines = doc.splitTextToSize(profile.diabetesRisk, 180);
      doc.text(diabetesLines, 15, y);
      y += (diabetesLines.length * 5) + 4;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
      doc.text("Tension arterielle & Hypertension :", 15, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const hyperLines = doc.splitTextToSize(profile.hypertensionRisk, 180);
      doc.text(hyperLines, 15, y);
      y += (hyperLines.length * 5) + 4;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
      doc.text("Qualite globale de votre nutrition :", 15, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const dietLines = doc.splitTextToSize(profile.dietQuality, 180);
      doc.text(dietLines, 15, y);
      y += (dietLines.length * 5) + 8;

      // Section 3: Recommandations detaillées (Page 2)
      doc.addPage();
      y = 22;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(13);
      doc.text("3. Prescriptions & Recommandations de Sante", 15, y);
      y += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85); // slate-700

      const paragraphs = profile.recommendations.split("\n\n");
      for (const p of paragraphs) {
        if (!p.trim()) continue;
        const pLines = doc.splitTextToSize(p.replace(/[\u2022\u25CF]/g, "-"), 180); // Remplacer les puces Unicode
        if (y + (pLines.length * 5) > 270) {
          doc.addPage();
          y = 22;
        }
        doc.text(pLines, 15, y);
        y += (pLines.length * 5) + 6;
      }

      // Dessiner les pages de garde du footer
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.line(15, 280, 195, 280);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text("Conseils nutritionnels automatises BeSafe. Transmettez ce bilan papier pour aider le medecin a ajuster vos doses.", 15, 285);
        doc.text(`Page ${i}/${totalPages}`, 180, 285);
      }

      doc.save(`BeSafe_Rapport_Medecin_${profile.country}.pdf`);
    } catch (e) {
      console.error("Erreur génération PDF:", e);
      alert("Une erreur inattendue est survenue lors du montage du rapport PDF.");
    }
  };

  const mealLoggedToday = mealsList.some(meal => {
    if (!meal.createdAt) return false;
    const dateObj = meal.createdAt.seconds 
      ? new Date(meal.createdAt.seconds * 1000) 
      : new Date(meal.createdAt);
    return dateObj.toDateString() === new Date().toDateString();
  });

  // Charger l'historique des repas analysés
  const fetchMealHistory = async () => {
    setLoadingHistory(true);
    const collectionName = "meals";
    try {
      const q = query(
        collection(db, collectionName),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const meals: MealData[] = [];
      snapshot.forEach((docSnap) => {
        meals.push({
          id: docSnap.id,
          ...docSnap.data()
        } as MealData);
      });
      setMealsList(meals);
    } catch (err: any) {
      console.error("Erreur historique repas:", err);
      // Fallback silencieux ou gestionnaire spécifique
      try {
        handleFirestoreError(err, OperationType.LIST, collectionName);
      } catch (e) {
        // Ignorer pour éviter de bloquer l'affichage global si index indisponible au départ
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchMealHistory();
  }, [user.uid]);

  // Supprimer un repas de l'historique
  const handleDeleteMeal = async (mealId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce repas de votre historique ?")) return;
    
    const docPath = `meals/${mealId}`;
    try {
      await deleteDoc(doc(db, "meals", mealId));
      setMealsList(mealsList.filter(m => m.id !== mealId));
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  };

  // Couleurs du score de santé
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 stroke-emerald-500 bg-emerald-50";
    if (score >= 50) return "text-orange-500 stroke-orange-500 bg-orange-50";
    return "text-red-500 stroke-red-500 bg-red-50";
  };

  const getScoreBgGradient = (score: number) => {
    if (score >= 80) return "from-emerald-400 to-green-500";
    if (score >= 50) return "from-amber-400 to-orange-500";
    return "from-rose-400 to-red-600";
  };

  // Génération intelligente du menu 7 jours adapté au Pays / Régime / Objectif
  const generate7DayPlan = (countryName: string, selectedGoal: string) => {
    const defaultMeals = [
      {
        day: "Lundi",
        breakfast: "Bouillie de mil légère avec lait de coco et copeaux d'ananas frais",
        lunch: "Thiéboudienne BeSafe (Riz au poisson) : 1/3 riz brun, beaucoup de chou-fleur, carotte et aubergine, huile réduite",
        snack: "Une poignée de cajous grillées non salées et thé vert",
        dinner: "Bouillon de capitaine (pepper soup) au gingembre, plantain mûr bouilli (1 pièce)"
      },
      {
        day: "Mardi",
        breakfast: "Pain complet avec purée d'avocat et citron vert, œufs pochés",
        lunch: "Sombé (Feuilles de manioc) à la vapeur, poisson chat grillé aux épices locales et rondelles d'igname",
        snack: "Salade de papaye et mangue au basilic",
        dinner: "Ndole BeSafe diététique (arachides réduites), blanc de poulet mijoté, banane plantain vapeur"
      },
      {
        day: "Mercredi",
        breakfast: "Flocons d'avoine au lait d'amande, graines de chia et banane douce douce",
        lunch: "Ragoût de haricots blancs (Koki), sauce tomate fraîche légère sans friture, riz complet en accompagnement",
        snack: "Noix de coco fraîche coupée en morceaux",
        dinner: "Saka saka ou épinards étuvés à l'ail, filet de bar sauvage rôti au four sans graisses saturées"
      },
      {
        day: "Jeudi",
        breakfast: "Smoothie énergisant au lait de soja, mangue, gingembre et feuilles de moringa",
        lunch: "Garri de manioc léger (1/2 tasse maximum), sauce gombo riche en poisson frais sauvage et gombo râpé",
        snack: "Tranches de pamplemousse ou orange locale",
        dinner: "Suya de bœuf maigre cuit au gril, rondelles d'avocat et oignons frais, salade de laitue"
      },
      {
        day: "Vendredi",
        breakfast: "Omelette aux herbes locales (oignons, persil, piment doux gris) cuite à l'eau ou avec 1 goutte d'huile",
        lunch: "Calou (ragoût) de légumes variés au poulet fumé sans peau, fufu de plantain léger à petite dose",
        snack: "Une poignée d'arachides grillées saines (non salées)",
        dinner: "Brochettes de lotte ou colin marinées au gingembre/citronnelle, purée de patates douces orange"
      },
      {
        day: "Samedi",
        breakfast: "Yaourt nature au miel sauvage, éclats de fèves de cacao locales et sésame",
        lunch: "Yassa de poulet BeSafe : poulet grillé au citron et moutarde, oignons caramélisés avec un filet d'huile, quinoa blanc",
        snack: "Brochette de fruits de saison (mangue, banane, ananas)",
        dinner: "Salade tiède de lentilles corail au piment doux, maquereau grillé et herbes aromatiques locales"
      },
      {
        day: "Dimanche",
        breakfast: "Petite bouillie d'avoine aromatisée à la poudre de baobab (pain de singe) et cannelle",
        lunch: "Massa (beignets de riz) légers cuits à la poêle sans friture, poulet rôti aux herbes et poivrons mijotés",
        snack: "Boisson fraîche maison d'hibiscus (Bissap) sans sucre ajouté",
        dinner: "Soupe de légumes maraîchers et morceaux de manioc bouilli, filet de poisson blanc à la vapeur"
      }
    ];

    // Personnalisation des verbes selon l'objectif de perte de poids ou de glycémie
    if (selectedGoal.toLowerCase().includes("diab") || selectedGoal.toLowerCase().includes("glyc")) {
      return defaultMeals.map(m => ({
        ...m,
        breakfast: m.breakfast.replace("miel sauvage", "cannelle moulue (sans miel)")
                              .replace("banane douce douce", "une poignée de fraises ou framboises locales ou avocat"),
        lunch: m.lunch.replace("riz brun", "semoule d'orge ou quinoa").replace("plantain mûr", "plantain non mûr (vert) bouilli"),
        dinner: m.dinner.replace("manioc bouilli", "aubergines cuites au four")
      }));
    }

    return defaultMeals;
  };

  const currentPlan = generate7DayPlan(profile.country, profile.goal);

  return (
    <div className="max-w-6xl mx-auto my-6 px-4 md:px-6 font-sans" id="dashboard_screen_wrapper">
      
      {/* 🛎️ Encart dynamique de rappel quotidien */}
      {!mealLoggedToday && (
        <motion.div 
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-200 p-4.5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm mb-8"
          id="meal_reminder_banner"
        >
          <div className="flex gap-3 items-start">
            <div className="p-2.5 bg-orange-100 rounded-2xl text-orange-600 shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Rappel Quotidien BeSafe</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vous n'avez pas enregistré de repas aujourd'hui ! Prenez votre assiette locale en photo pour maintenir vos statistiques et votre score à jour.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => setActiveTab("analyzer")}
              className="flex-1 md:flex-none px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer transition-all text-center"
            >
              Scanner mon repas
            </button>
            {notificationsSupported && (
              <button
                onClick={handleRequestNotifications}
                className={`flex-1 md:flex-none px-4 py-2 border text-xs font-bold rounded-2xl cursor-pointer transition-all ${
                  notificationsEnabled 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" 
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                {notificationsEnabled ? "🔔 Rappels Actifs" : "🔔 M'alerter via le Bureau"}
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Profil de diagnostic & Présentation du Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Widget 1 : Score de Santé Visuel /100 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-white/95 p-6 rounded-3xl shadow-lg border border-green-100 shadow-green-200/40 flex flex-col justify-between"
          id="health_score_card"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Score Bien-être</h3>
            <span className="p-1 px-2.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">
              BeSafe Coach
            </span>
          </div>

          <div className="relative my-7 flex flex-col items-center justify-center">
            {/* Cercle Score SVG de progression */}
            <div className="relative w-36 h-36 flex items-center justify-center text-center">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  className="stroke-slate-100"
                  strokeWidth="8"
                  fill="transparent"
                />
                <motion.circle
                  cx="72"
                  cy="72"
                  r="62"
                  className={`stroke-emerald-500`}
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={390}
                  initial={{ strokeDashoffset: 390 }}
                  animate={{ strokeDashoffset: 390 - (390 * profile.healthScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div>
                <span className="text-4xl font-display font-extrabold text-slate-800 leading-none">
                  {profile.healthScore}
                </span>
                <span className="text-xs text-slate-400 block font-medium">sur 100</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium text-center mt-4">
              Diagnostic calculé pour un âge de <strong className="text-slate-700">{profile.age} ans</strong> ({profile.weight} kg, {profile.height} cm).
            </p>
          </div>

          {/* Niveau d'activité */}
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Activité Physique :</span>
            </div>
            <span className="font-bold text-emerald-700">{profile.physicalActivity}</span>
          </div>
        </motion.div>

        {/* Widget 2 : Risques Alimentation de l'utilisateur */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white/95 p-6 rounded-3xl shadow-lg border border-green-100 shadow-green-200/40 flex flex-col justify-between"
          id="risks_card"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Alerte Maladies Métaboliques</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-normal">
              Ci-dessous, l'évaluation personnalisée des facteurs de vulnérabilité rédigée par notre IA d'après vos antécédents familiaux et nutritionnels.
            </p>

            <div className="space-y-3.5 mb-2">
              {/* Risque Diabète */}
              <div className="p-3 bg-white/60 rounded-xl border border-slate-100 flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Risque de Diabète :</span>
                  <span className="text-xs text-slate-600 leading-normal">{profile.diabetesRisk}</span>
                </div>
              </div>

              {/* Risque Hypertension */}
              <div className="p-3 bg-white/60 rounded-xl border border-slate-100 flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Risque d'Hypertension :</span>
                  <span className="text-xs text-slate-600 leading-normal">{profile.hypertensionRisk}</span>
                </div>
              </div>

              {/* Qualité alimentaire */}
              <div className="p-3 bg-white/60 rounded-xl border border-slate-100 flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Qualité Alimentaire Actuelle :</span>
                  <span className="text-xs text-slate-600 leading-normal">{profile.dietQuality}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 text-xs pt-1 flex-wrap">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 rounded-full font-bold shadow-md shadow-slate-200 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              title="Générer un rapport PDF complet de diagnostic santé pour votre médecin"
              id="btn_download_pdf_report"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Rapport Médecin (PDF)
            </button>
            <button
              onClick={onResetProfile}
              className="px-4 py-2 border border-green-200 text-green-600 hover:bg-green-50 rounded-full font-bold transition-all shadow-sm"
              id="btn_recal_profile"
            >
              Recalculer le profil complet
            </button>
          </div>
        </motion.div>

      </div>

      {/* 📈 SECTION : TENDANCE DE POIDS & SCORES DE SANTÉ */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white/95 p-6 rounded-3xl border border-green-100 shadow-lg shadow-green-200/40 mb-8"
        id="health_trends_section"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-display font-bold text-slate-800">
                Suivi de vos Tendances de Santé & Poids
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Évolution de votre poids corporel et de vos scores de santé BeSafe au fil du temps.
            </p>
          </div>
          
          <button
            onClick={() => {
              setTrackWeight(profile.weight.toString());
              setTrackScore(profile.healthScore.toString());
              setShowAddTrackForm(!showAddTrackForm);
            }}
            className="px-4 py-2 border border-emerald-200 text-emerald-600 hover:bg-emerald-50 text-xs font-bold rounded-full shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {showAddTrackForm ? "Masquer les champs" : "Ajouter un point de suivi"}
          </button>
        </div>

        {/* Formulaire de suivi */}
        <AnimatePresence>
          {showAddTrackForm && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddTracking}
              className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end overflow-hidden"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Période (ex: Semaine/Date)
                </label>
                <input 
                  type="text"
                  placeholder="ex: Sem. +1, 12 Juin" 
                  value={trackDate}
                  onChange={(e) => setTrackDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Poids (kg)
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  required
                  value={trackWeight}
                  onChange={(e) => setTrackWeight(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Score de Santé (0-100)
                </label>
                <input 
                  type="number" 
                  required
                  min="0"
                  max="100"
                  value={trackScore}
                  onChange={(e) => setTrackScore(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Ajouter au Graphique
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Graphique de tendance */}
        <div className="h-64 sm:h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trackingData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: "#64748b" }} 
                stroke="#cbd5e1"
              />
              <YAxis 
                yAxisId="left"
                domain={['dataMin - 5', 'dataMax + 5']} 
                tick={{ fontSize: 10, fill: "#3b82f6" }}
                stroke="#cbd5e1"
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#10b981" }}
                stroke="#cbd5e1"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.95)", 
                  border: "1px solid #e2e8f0", 
                  borderRadius: "16px",
                  fontSize: "11px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                }} 
              />
              <Legend wrapperStyle={{ fontSize: "11.5px" }} />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="weight" 
                name="Poids (kg)" 
                stroke="#3782f6" 
                strokeWidth={3} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="healthScore" 
                name="Score de Santé (/100)" 
                stroke="#10b981" 
                strokeWidth={3} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bar de navigation d'onglets du Coach */}
      <div className="flex gap-2.5 border-b border-light-green-100 pb-3 mb-6 overflow-x-auto pr-1" id="dash_tabs">
        <button
          onClick={() => setActiveTab("diagnostic")}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-xs shrink-0 transition-all ${
            activeTab === "diagnostic" 
              ? "bg-green-500 text-white shadow-md shadow-green-200" 
              : "bg-white/80 border border-green-50 text-slate-500 hover:text-green-600 hover:bg-green-50/50"
          }`}
          id="tab_diagnostic"
        >
          <Smile className="w-3.5 h-3.5" />
          Mon Diagnostic IA
        </button>

        <button
          onClick={() => setActiveTab("analyzer")}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-xs shrink-0 transition-all ${
            activeTab === "analyzer" 
              ? "bg-green-500 text-white shadow-md shadow-green-200" 
              : "bg-white/80 border border-green-50 text-slate-500 hover:text-green-600 hover:bg-green-50/50"
          }`}
          id="tab_analyzer"
        >
          <Apple className="w-3.5 h-3.5" />
          Analyseur Photo repas
        </button>

        <button
          onClick={() => setActiveTab("recipes")}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-xs shrink-0 transition-all ${
            activeTab === "recipes" 
              ? "bg-green-500 text-white shadow-md shadow-green-200" 
              : "bg-white/80 border border-green-50 text-slate-500 hover:text-green-600 hover:bg-green-50/50"
          }`}
          id="tab_recipes"
        >
          <Calendar className="w-3.5 h-3.5" />
          Plan Alimentaire 7 Jours
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-xs shrink-0 transition-all ${
            activeTab === "history" 
              ? "bg-green-500 text-white shadow-md shadow-green-200" 
              : "bg-white/80 border border-green-50 text-slate-500 hover:text-green-600 hover:bg-green-50/50"
          }`}
          id="tab_history"
        >
          <Compass className="w-3.5 h-3.5" />
          Historique ({mealsList.length})
        </button>
      </div>

      {/* Contenu de l'onglet actif */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
        >
          
          {/* Onglet 1 : Diagnostic & Recommandations détaillées */}
          {activeTab === "diagnostic" && (
            <div className="space-y-6" id="view_diagnostic">
              
              {/* Encart Recommandation principale avec style premium */}
              <div className="bg-white/95 p-6 rounded-3xl border border-green-100 shadow-lg shadow-green-200/40">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-display font-bold text-slate-800">
                      Recommandation personnalisée de votre Coach
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Généré par Gemini 3.5 Flash d'après votre objectif de bien-être.
                    </p>
                  </div>
                </div>

                <div className="bg-white/55 p-5 rounded-2xl border border-slate-50 text-xs font-sans text-slate-700 leading-relaxed space-y-4 max-h-[420px] overflow-y-auto pr-2">
                  <p className="whitespace-pre-wrap">{profile.recommendations}</p>
                </div>

                {/* Info Box */}
                <div className="flex gap-2 mt-4 text-[11px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p>
                    BeSafe intègre une base d'équilibres nutritionnels prenant en compte les féculents d'Afrique Centrale et de l'Ouest (cassave, attiéké, bananes douces ou plantains). Nous favorisons des versions moins glycémiques de ces spécialités pour prendre soin de vos artères.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* Onglet 2 : Plan de Repas 7 Jours */}
          {activeTab === "recipes" && (
            <div className="space-y-6" id="view_recipes">
              
              <div className="bg-white/95 p-6 rounded-3xl border border-green-100 shadow-lg shadow-green-200/40">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-display font-bold text-slate-800">
                        Votre Semaine Alimentaire Prototypée
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Objectif : <strong className="text-slate-600">{profile.goal}</strong> • Résidene : <strong className="text-slate-600">{profile.country}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grille 7 Jours */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                  {currentPlan.map((p, idx) => (
                    <div 
                      key={p.day}
                      className="bg-white/90 p-4.5 rounded-2xl border border-green-50 hover:border-green-300 shadow-sm transition-all hover:bg-white duration-200 flex flex-col justify-between hover:shadow-md hover:shadow-green-100"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                            {p.day}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Jour {idx + 1}</span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="font-bold text-slate-800 text-[10px] uppercase block">Petit-déjeuner :</span>
                            <span className="text-slate-600 text-xs">{p.breakfast}</span>
                          </div>
                          <div className="pt-1.5 border-t border-slate-50">
                            <span className="font-bold text-slate-800 text-[10px] uppercase block">Déjeuner :</span>
                            <span className="text-slate-600 text-xs">{p.lunch}</span>
                          </div>
                          <div className="pt-1.5 border-t border-slate-50">
                            <span className="font-bold text-slate-800 text-[10px] uppercase block">Collation saine :</span>
                            <span className="text-slate-600 text-xs">{p.snack}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-50 mt-2 bg-emerald-50/50 p-2 rounded-xl text-[11px]">
                        <span className="font-bold text-emerald-800 uppercase block text-[9px] tracking-wide">Dîner léger :</span>
                        <span className="text-slate-700">{p.dinner}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Onglet 3 : Analyseur de Repas */}
          {activeTab === "analyzer" && (
            <div id="view_analyzer">
              <MealAnalyzer 
                user={user} 
                country={profile.country} 
                goal={profile.goal} 
                onMealAnalyzed={fetchMealHistory} 
              />
            </div>
          )}

          {/* Onglet 4 : Historique des repas analysés */}
          {activeTab === "history" && (
            <div className="bg-white/95 p-6 rounded-3xl border border-green-100 shadow-lg shadow-green-200/40" id="view_history">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-base font-display font-bold text-slate-800">
                    Historique Nutritionnel Recensé
                  </h3>
                </div>
                <button
                  onClick={fetchMealHistory}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-all"
                  title="Rafraîchir"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-emerald-500 animate-spin mb-2" />
                  <span className="text-xs">Chargement de votre historique diététique...</span>
                </div>
              ) : mealsList.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-white/30">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3 text-emerald-500">
                    <Apple className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 mb-1">Aucun repas analysé à ce jour</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4 leading-normal">
                    Faites l'expérience ! Utilisez notre outil de reconnaissance visuelle pour scanner votre premier foufou diététique, saka saka ou haricot.
                  </p>
                  <button
                    onClick={() => setActiveTab("analyzer")}
                    className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-full hover:bg-slate-700 transition"
                  >
                    Essayer l'analyseur photo
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {mealsList.map((meal) => (
                    <div 
                      key={meal.id} 
                      className="bg-white/60 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 group hover:bg-white transition hover:border-slate-200 duration-200"
                    >
                      <div className="flex items-center gap-3 w-full min-w-0">
                        {/* Avatar / Visuel icône de calories */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex flex-col items-center justify-center shadow-md shrink-0">
                          <Flame className="w-4 h-4 fill-white" />
                          <span className="text-[8px] font-bold tracking-tight">{meal.calories} kcal</span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{meal.mealName}</h4>
                          <span className="inline-block text-[10px] text-slate-400 mr-2">
                            {meal.createdAt?.seconds 
                              ? new Date(meal.createdAt.seconds * 1000).toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                              : "Récemment édité"
                            }
                          </span>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5 leading-tight">{meal.nutritionalValue}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            alert(`📋 Détails : ${meal.mealName}\n\n🔥 Calories : ${meal.calories} kcal\n\n📌 Valeur nutritionnelle :\n${meal.nutritionalValue}\n\n🌿 Substituts sains proposés :\n${meal.suggestions}`);
                          }}
                          className="p-1 px-2 hover:bg-slate-55 rounded-lg border border-slate-200 text-slate-500 text-[10px] font-bold"
                        >
                          Détails
                        </button>
                        <button
                          onClick={() => meal.id && handleDeleteMeal(meal.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Supprimer la fiche"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
