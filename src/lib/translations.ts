export const translations = {
  fr: {
    common: {
      loading: "Chargement...",
      back: "Retour",
      continue: "Continuer",
      error: "Erreurs",
      success: "Succès",
      cancel: "Annuler"
    },
    header: {
      subtitle: "Accompagnement Préventif Personnalisé",
      login: "Se connecter",
      logout: "Déconnexion"
    },
    landing: {
      badge: "Alliance Nutrition Cardio-Vasculaire",
      title: "Prenez soin de votre corps avec",
      desc: "Un accompagnement nutritionnel certifié. Obtenez un score de bien-être instantané, déterminez vos facteurs de risques cardiovasculaires, et planifiez des repas équilibrés adaptés à votre culture locale (foufou, saka-saka, bananes plantains, etc.).",
      adoptedBy: "Recommandé par des nutritionnistes en Afrique et Europe",
      cardTitle: "Commencer votre bilan de santé",
      cardDesc: "Pour sauvegarder vos analyses métaboliques, photos d'assiettes et suivre votre plan de 7 jours, connectez-vous de manière sécurisée via votre compte Google.",
      button: "Se connecter avec Google",
      featureScan: "Évaluer",
      featureDiagnose: "Suivre"
    },
    onboarding: {
      title: "Mon Bilan de Santé BeSafe",
      question: "Question",
      loaderTitle: "Analyse clinique de vos paramètres de santé...",
      loaderSteps: [
        "Interprétation de votre profil métabolique...",
        "Calcul des indicateurs de risques vasculaires...",
        "Calcul des apports d'ingrédients de substitution locaux...",
        "Génération personnalisée de vos menus équilibrés de saison..."
      ],
      loaderSub: "Veuillez patienter pendant que BeSafe configure un plan sur mesure ajusté à vos coutumes régionales.",
      
      stepLangTitle: "Choisissez votre langue / Choose your language",
      stepLangDesc: "Sélectionnez votre langue de préférence pour l'ensemble de l'application et les rapports cliniques.",
      
      stepAgeTitle: "Quel âge avez-vous ?",
      stepAgeDesc: "L'âge permet d'évaluer le métabolisme et d'identifier l'évolution normale des risques cardiovasculaires.",
      stepAgePlaceholder: "Ex: 34",
      
      stepCorpTitle: "Mesures de corpulence",
      stepCorpDesc: "Ces indicateurs permettent de calculer votre IMC (Indice de Masse Corporelle) et de personnaliser vos apports.",
      stepCorpWeight: "Poids (kg)",
      stepCorpHeight: "Taille (cm)",
      
      stepCountryTitle: "Dans quel pays résidez-vous ?",
      stepCountryDesc: "Cela permet à notre équipe d'identifier vos denrées locales de saison, vos marchés et de vous proposer des alternatives équilibrées.",
      
      stepDietTitle: "Quelle est votre alimentation habituelle ?",
      stepDietDesc: "Sélectionnez l'option qui correspond le mieux à vos repas ou décrivez-la afin d'optimiser les conseils de remplacement.",
      stepDietPlaceholder: "Ou décrivez vos repas réguliers ici (ex: riz blanc, friture de plantains dodo, sauces denses...)",
      suggestedDiets: [
        { label: "Plats locaux riches (foufou, sauce huile de palme, tubercule de manioc, dinde, bœuf)", value: "Plats locaux riches (foufou, sauce huile de palme, manioc, riz gras, viande)." },
        { label: "Beignets, haricots frits, plantains (moko, dodo) et bouillies sucrées", value: "Repas frits avec beaucoup de féculents (beignets, haricots frits, bananes plantains)." },
        { label: "Riz gras traditionnel, riz au poisson braisé et légumes cuits", value: "Riz traditionnel cuit blanc ou riz gras avec du poisson braisé et légumes de saison." },
        { label: "Alimentation occidentale classique (viandes, pizzas, pâtes, sauces crémées)", value: "Alimentation occidentale (pâtes, sauces industrielles, pizzas, viandes, frites, sodas)." },
        { label: "Option végétarienne équilibrée (tubercules, avocat, arachides grillées, légumes verts)", value: "Alimentation principalement végétarienne (tubercules bouillis, avocat, arachides, épinards, gombo)." },
        { label: "Repas légers : bouillons de poisson (pepper soup), salades, poulet grillé", value: "Repas légers de saison (bouillon de poisson léger, légumes vapeur, poulet sans matière grasse)." }
      ],
      
      stepActTitle: "Niveau d'activité physique",
      stepActDesc: "L'exercice régulier réduit la résistance à l'insuline et favorise une bonne oxygénation vasculaire.",
      activities: [
        { label: "Sédentaire (Peu ou pas d'exercice)", value: "Sédentaire" },
        { label: "Modérée (Marche, course ou sport 1-3 fois/semaine)", value: "Modérée" },
        { label: "Intense (Travail physique ou sport quotidien vigoureux)", value: "Intense" }
      ],
      
      stepHistoryTitle: "Vos antécédents médicaux / Génétiques",
      stepHistoryDesc: "Évaluez vos prédispositions familiales afin de configurer vos alertes de prévention.",
      stepHistoryPlaceholder: "Autre antécédent particulier à inscrire...",
      medicalHistories: [
        { label: "Aucun antécédent particulier", value: "Aucun antécédent" },
        { label: "Présence de cas de diabète dans la famille proche", value: "Antécédents familiaux de diabète de type 2" },
        { label: "Hypertension artérielle ou fatigue cardiaque régulière", value: "Hypertension artérielle diagnostiquée ou suspicion" },
        { label: "Cholestérol élevé ou surpoids persistant", value: "Cholestérol élevé et tendance au surpoids" },
        { label: "Troubles digestifs réguliers (gluten, lactose, ballonnements)", value: "Sensibilité intestinale, ballonnements récurrents" }
      ],
      
      stepGoalTitle: "Quel est votre objectif prioritaire ?",
      stepGoalDesc: "Notre programme structurera ses recommandations hebdomadaires autour de cet angle.",
      wellnessGoals: [
        { label: "Perdre du poids et affiner ma silhouette sainement", value: "Perdre du poids et affiner ma silhouette" },
        { label: "Stabiliser ma glycémie et prévenir les risques de Diabète", value: "Prévenir et réguler ma glycémie pour le Diabète" },
        { label: "Réduire les risques d'Hypertension et vivre plus longtemps", value: "Prendre soin de ma tension artérielle et de mon cœur" },
        { label: "Améliorer ma digestion et adopter une alimentation plus fraîche", value: "Adopter une alimentation plus naturelle et améliorer le transit" },
        { label: "Booster mon niveau d'énergie global et ma vitalité au quotidien", value: "Optimiser mes apports en nutriments pour la forme et le tonus" }
      ],
      
      stepSumTitle: "Prêt pour votre bilan personnalisé ?",
      stepSumDesc: "Nous allons maintenant assembler votre profil nutritionnel, votre IMC et vos objectifs pour dresser votre scorecard santé ainsi que votre programme de repas de 7 jours.",
      stepSumYears: "ans",
      stepSumReside: "Réside au",
      stepSumFinish: "Générer mon Programme !"
    },
    dashboard: {
      alertBegan: "Mes Rappels de Prévention",
      alertBeganDesc: "Indicateurs préventifs calculés d'après votre profil.",
      alertNoMealToday: "Vous n'avez pas encore renseigné de repas aujourd'hui. Analysez une assiette pour mettre à jour votre bilan nutritionnel !",
      alertActivateNotifications: "Activer les alertes de suivi",
      
      title: "Tableau de Bord de Santé de Précision",
      scoreTitle: "Score de Santé Global",
      scoreDesc: "Basé sur vos antécédents, votre IMC, votre niveau d'activité, votre alimentation et votre contexte géographique.",
      scoreLevelExcellent: "Excellent - Profil équilibré et protecteur",
      scoreLevelGood: "Bon - Bonne hygiène générale",
      scoreLevelWarning: "Moyen - Ajustements conseillés",
      scoreLevelDanger: "Attention - Suivi médical prioritaire",
      
      imcTitle: "Indice de Masse Corporelle (IMC)",
      imcUnder: "Poids insuffisant",
      imcNormal: "Corpulence normale",
      imcOver: "Surpoids",
      imcObese: "Obésité",
      
      metabolismTitle: "Évaluation du Risque Diabète Type 2",
      hypertensionTitle: "Tension Artérielle & Risque Cardiovasculaire",
      dietQualityTitle: "Qualité Globale de l'Alimentation",
      recsTitle: "Prescriptions Diététiques & Hygiène de Vie",
      
      mealPlanTitle: "Plan de Repas de Saison Sur-Mesure",
      mealPlanDesc: "Recommandations élaborées pour équilibrer vos plats locaux de saison au",
      
      trackingTitle: "Suivi Physiologique & Journal de Poids",
      trackingDesc: "Saisissez régulièrement vos nouvelles mesures pour analyser vos progrès.",
      trackWeight: "Nouveau poids (kg)",
      trackScore: "Score de vitalité quotidien (0-100)",
      trackDate: "Date d'enregistrement",
      trackAddBtn: "Consigner la mesure",
      trackHistoryHeader: "Dossier Médical - Suivi des Paramètres Corporels",
      trackColDate: "Période",
      trackColWeight: "Poids",
      trackColScore: "Score",
      trackEmpty: "Aucune mesure enregistrée pour le moment.",
      
      doctorPDF: "Rapport de Consultation (PDF)",
      recalculate: "Ajuster mon profil",
      disclaimer: "Ces évaluations et suggestions de santé sont dispensées à des fins d'information et d'éducation préventive. Elles ne remplacent en aucun cas un diagnostic, une prescription ou une consultation fournie par un professionnel de la santé ou un médecin généraliste agréé."
    },
    mealAnalyzer: {
      title: "Analyseur de Nutrition Visuel",
      desc: "Prenez votre assiette en photo ! Notre outil identifie l'apport calorique estimé et équilibre les féculents locaux.",
      loadingScan: "Analyse Visuelle Active",
      loadingDetails: "Détection des portions, des lipides, glucides et des ingrédients régionaux...",
      dropText: "Glissez-déposez la photo de votre repas ici",
      clickToBrowse: "ou parcourez les fichiers de votre appareil",
      loadedSuccess: "Image chargée avec succès",
      loadedDesc: "Analyseur paré. Nous allons évaluer la composition globale et vous proposer des alternatives équilibrées adaptées au",
      launchAnalysis: "Lancer l'analyse nutritionnelle",
      analysisCompleted: "Analyse Complétée",
      macronutrients: "Valeur nutritionnelle estimée pour une portion :",
      identifiedIngredients: "Ingrédients identifiés :",
      optimizationTitle: "Ajustements Préventifs Recommandés",
      analyzeAnother: "Analyser une nouvelle assiette"
    }
  },
  en: {
    common: {
      loading: "Loading...",
      back: "Back",
      continue: "Continue",
      error: "Errors",
      success: "Success",
      cancel: "Cancel"
    },
    header: {
      subtitle: "Personal Preventive Health",
      login: "Sign in",
      logout: "Sign out"
    },
    landing: {
      badge: "Cardiovascular Prevention Alliance",
      title: "Take care of your body with",
      desc: "Certified nutritional and lifestyle guidance. Get an instant well-being score, evaluate your cardiovascular factors, and plan balanced meals adapted to your local culture (foufou, saka-saka, plantains, etc.).",
      adoptedBy: "Trusted by clinical nutrition experts",
      cardTitle: "Start your health assessment",
      cardDesc: "To save your metabolic analyses, meal photos, and follow your 7-day plan, sign in securely using your Google account.",
      button: "Sign in with Google",
      featureScan: "Assess",
      featureDiagnose: "Track"
    },
    onboarding: {
      title: "BeSafe Health Profile",
      question: "Question",
      loaderTitle: "Analyzing your physical parameters...",
      loaderSteps: [
        "Interpreting metabolic profile...",
        "Evaluating cardiovascular indicators...",
        "Identifying optimal local substitutions...",
        "Generating balanced seasonal menus..."
      ],
      loaderSub: "Please wait while BeSafe configures a custom plan adjusted to your local custom options.",
      
      stepLangTitle: "Choose your language / Choisissez votre langue",
      stepLangDesc: "Select your preferred language for the entire application and reports.",
      
      stepAgeTitle: "How old are you?",
      stepAgeDesc: "Age helps evaluate metabolic rates and identify regular cardiovascular evolutionary progression.",
      stepAgePlaceholder: "e.g., 34",
      
      stepCorpTitle: "Body measurements",
      stepCorpDesc: "These metrics calculate your BMI (Body Mass Index) and assist in tailoring daily intake targets.",
      stepCorpWeight: "Weight (kg)",
      stepCorpHeight: "Height (cm)",
      
      stepCountryTitle: "Which country do you reside in?",
      stepCountryDesc: "This helps our program identify local seasonal ingredients, markets, and suggest balanced substitutes.",
      
      stepDietTitle: "What is your typical diet?",
      stepDietDesc: "Select the option that best fits your typical meals, or describe it to optimize substitution recommendations.",
      stepDietPlaceholder: "Or describe your typical diet here (e.g., white rice, fried plantains, stews...)",
      suggestedDiets: [
        { label: "Rich local dishes (foufou, palm oil sauce, cassava tuber, turkey, beef)", value: "Rich local dishes (foufou, palm oil sauce, cassava, jollof rice, meat)." },
        { label: "Fritters, fried beans, plantains (dodo) and sweet porridges", value: "Fried meals with many starches (fritters, fried beans, plantains)." },
        { label: "Traditional jollof rice, rice with braised fish and cooked vegetables", value: "Traditional white or jollof rice with braised fish and seasonal vegetables." },
        { label: "Classic Western diet (meats, pizzas, pastas, creamy sauces)", value: "Western diet (pasta, processed sauces, pizza, meat, fries, sodas)." },
        { label: "Balanced vegetarian option (tubers, avocado, roasted peanuts, green vegetables)", value: "Mainly vegetarian diet (boiled tubers, avocado, peanuts, spinach, okra)." },
        { label: "Light meals: fish broth (pepper soup), salads, grilled chicken", value: "Light seasonal meals (light fish broth, steamed vegetables, skinless grilled chicken)." }
      ],
      
      stepActTitle: "Physical activity level",
      stepActDesc: "Regular physical activity reduces insulin resistance and supports healthy vascular oxygenation.",
      activities: [
        { label: "Sedentary (Little or no exercise)", value: "Sédentaire" },
        { label: "Moderate (Walking, running or sport 1-3 times/week)", value: "Modérée" },
        { label: "Intense (Physical labor or daily vigorous sport)", value: "Intense" }
      ],
      
      stepHistoryTitle: "Medical / Genetic History",
      stepHistoryDesc: "Assess your genetic background to customize preventive alert indicators.",
      stepHistoryPlaceholder: "Other specific background history to include...",
      medicalHistories: [
        { label: "No specific history", value: "Aucun antécédent" },
        { label: "Presence of diabetes cases in close family members", value: "Antécédents familiaux de diabète de type 2" },
        { label: "High blood pressure or consistent cardiac fatigue", value: "Hypertension artérielle diagnostiquée ou suspicion" },
        { label: "High cholesterol or persistent overweight", value: "Cholestérol élevé et tendance au surpoids" },
        { label: "Regular digestive disorders (gluten, lactose, bloating)", value: "Sensibilité intestinale, ballonnements récurrents" }
      ],
      
      stepGoalTitle: "What is your main priority goal?",
      stepGoalDesc: "Our program will tailor weekly meal and lifestyle recommendations around this core focus.",
      wellnessGoals: [
        { label: "Lose weight and shape my figure healthily", value: "Perdre du poids et affiner ma silhouette" },
        { label: "Stabilize blood sugar and prevent type 2 diabetes risk", value: "Prévenir et réguler ma glycémie pour le Diabète" },
        { label: "Reduce Hypertension risks and live longer", value: "Prendre soin de ma tension artérielle et de mon cœur" },
        { label: "Improve digestion and switch to more natural food", value: "Adopter une alimentation plus naturelle et améliorer le transit" },
        { label: "Boost overall energy levels and daily vitality", value: "Optimiser mes apports en nutriments pour la forme et le tonus" }
      ],
      
      stepSumTitle: "Ready for your personalized assessment?",
      stepSumDesc: "We will compile your nutritional values, BMI, and aims to produce your health scorecard and 7-day dietary plan.",
      stepSumYears: "years old",
      stepSumReside: "Resides in",
      stepSumFinish: "Generate my Program !"
    },
    dashboard: {
      alertBegan: "Preventive Reminders",
      alertBeganDesc: "Health alert priorities set up based on your physical markers.",
      alertNoMealToday: "You haven't recorded any meal today. Analyze a plate to update your nutritional report!",
      alertActivateNotifications: "Activate tracking alerts",
      
      title: "Precision Health Dashboard",
      scoreTitle: "Overall Health Score",
      scoreDesc: "Computed based on your medical history, BMI, exercise habits, diet, and regional elements.",
      scoreLevelExcellent: "Excellent - High-quality, protective profile",
      scoreLevelGood: "Good - General healthy habits",
      scoreLevelWarning: "Average - Healthy adjustments advised",
      scoreLevelDanger: "Prioritized - Consultation advised",
      
      imcTitle: "Body Mass Index (BMI)",
      imcUnder: "Underweight",
      imcNormal: "Normal weight",
      imcOver: "Overweight",
      imcObese: "Obese",
      
      metabolismTitle: "Type 2 Diabetes Risk Analysis",
      hypertensionTitle: "Blood Pressure & Cardiovascular Risk",
      dietQualityTitle: "Overall Dietary Assessment",
      recsTitle: "Nutritional Guidance & Lifestyle Recommendations",
      
      mealPlanTitle: "Custom Seasonal Meal Plan",
      mealPlanDesc: "Recommendations generated to balance your local seasonal dishes in",
      
      trackingTitle: "Physiological Tracking & Weight History",
      trackingDesc: "Log your weights and measurements regularly to analyze your tendencies over time.",
      trackWeight: "New weight (kg)",
      trackScore: "Daily vitality score (0-100)",
      trackDate: "Recording date",
      trackAddBtn: "Log measurement",
      trackHistoryHeader: "Clinical Dossier - Body Parameter Trends",
      trackColDate: "Period",
      trackColWeight: "Weight",
      trackColScore: "Score",
      trackEmpty: "No measurements recorded yet.",
      
      doctorPDF: "Shareable Rapport (PDF)",
      recalculate: "Readjust My Profile",
      disclaimer: "These health reports and assessments are purely informational and preventive. They do not replace formal diagnosis, prescription, or clinical consultation by a certified general practitioner or medical professional."
    },
    mealAnalyzer: {
      title: "Visual Nutrition Analyzer",
      desc: "Take a picture of your plate! Our tool estimates calories and helps balance local starch intake.",
      loadingScan: "Active Visual Scan",
      loadingDetails: "Detecting portions, lipides, glucides, and key local ingredients...",
      dropText: "Drag and drop your meal photo here",
      clickToBrowse: "or click to browse your device files",
      loadedSuccess: "Image loaded successfully",
      loadedDesc: "Analyzer ready. We will identify the composition details and provide healthy suggestions adapted to",
      launchAnalysis: "Launch visual analysis",
      analysisCompleted: "Analysis Completed",
      macronutrients: "Estimated nutrition values per serving:",
      identifiedIngredients: "Identified key ingredients:",
      optimizationTitle: "Recommended Preventive Balances",
      analyzeAnother: "Analyze a new plate"
    }
  }
};
