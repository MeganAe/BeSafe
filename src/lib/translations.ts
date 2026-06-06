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
      subtitle: "Coach de Santé IA",
      login: "Se connecter",
      logout: "Déconnexion"
    },
    landing: {
      badge: "Health-Tech IA Solidaire",
      title: "Prenez soin de votre corps avec",
      desc: "Un coach santé intelligent alimenté par Gemini 3.5. Obtenez un score de santé instantané, déterminez vos risques de diabète de type 2 et d'hypertension, et planifiez des repas adaptés à vos coutumes locales (foufou, saka-saka, bananes plantains, etc.).",
      adoptedBy: "Adopté par plus de 12 pays d'Afrique",
      cardTitle: "Votre évaluation commence ici",
      cardDesc: "Pour sauvegarder vos analyses métaboliques, photos de dîner et suivre votre plan de 7 jours, connectez-vous de manière sécurisée via votre compte Google.",
      button: "Se connecter avec Google",
      featureScan: "Scanner",
      featureDiagnose: "Diagnostiquer"
    },
    onboarding: {
      title: "Profil Santé BeSafe",
      question: "Question",
      loaderTitle: "Analyse de vos données par le coach BeSafe...",
      loaderSteps: [
        "Interprétation de votre profil médical...",
        "Calcul des risques de Diabète et d'Hypertension...",
        "Extraction des meilleurs ingrédients de substitution locaux...",
        "Génération personnalisée de vos repas pour la semaine..."
      ],
      loaderSub: "Veuillez patienter pendant que BeSafe configure un plan sur mesure ajusté à vos coutumes locales.",
      
      stepLangTitle: "Choisissez votre langue / Choose your language",
      stepLangDesc: "Sélectionnez votre langue de préférence pour l'ensemble de l'application et les rapports de l'IA.",
      
      stepAgeTitle: "Quel âge avez-vous ?",
      stepAgeDesc: "L'âge permet d'évaluer le métabolisme et d'identifier l'évolution normale des risques cardiovasculaires.",
      stepAgePlaceholder: "Ex: 34",
      
      stepCorpTitle: "Mesures de corpulence",
      stepCorpDesc: "Ces indicateurs permettent au coach BeSafe de calculer votre IMC (Indice de Masse Corporelle).",
      stepCorpWeight: "Poids (kg)",
      stepCorpHeight: "Taille (cm)",
      
      stepCountryTitle: "Dans quel pays résidez-vous ?",
      stepCountryDesc: "Cela aide BeSafe à identifier vos denrées locales, vos marchés et à proposer des recettes de saisons authentiques.",
      
      stepDietTitle: "Quelle est votre alimentation habituelle ?",
      stepDietDesc: "Sélectionnez l'option qui correspond le mieux à vos repas ou décrivez-la.",
      stepDietPlaceholder: "Ou décrivez votre alimentation ici (ex: riz blanc, friture de plantains dodo...)",
      suggestedDiets: [
        { label: "Plats locaux riches (foufou, sauce huile de palme, tubercule de manioc, dinde, bœuf)", value: "Plats locaux riches (foufou, sauce huile de palme, manioc, riz gras, viande)." },
        { label: "Beignets, haricots frits, plantains (moko, dodo) et bouillies sucrées", value: "Repas frits avec beaucoup de féculents (beignets, haricots frits, bananes plantains)." },
        { label: "Riz gras traditionnel, riz au poisson braisé et légumes cuits", value: "Riz traditionnel cuit blanc ou riz gras avec du poisson braisé et légumes de saison." },
        { label: "Alimentation occidentale classique (viandes, pizzas, pâtes, sauces crémées)", value: "Alimentation occidentale (pâtes, sauces industrielles, pizzas, viandes, frites, sodas)." },
        { label: "Option végétarienne équilibrée (tubercules, avocat, arachides grillées, légumes verts)", value: "Alimentation principalement végétarienne (tubercules bouillis, avocat, arachides, épinards, gombo)." },
        { label: "Repas légers : bouillons de poisson (pepper soup), salades, poulet grillé", value: "Repas légers de saison (bouillon de poisson léger, légumes vapeur, poulet sans matière grasse)." }
      ],
      
      stepActTitle: "Niveau d'activité physique",
      stepActDesc: "L'exercice réduit considérablement la résistance à l'insuline et active l'oxygénation des veines.",
      activities: [
        { label: "Sédentaire (Peu ou pas d'exercice)", value: "Sédentaire" },
        { label: "Modérée (Marche, course ou sport 1-3 fois/semaine)", value: "Modérée" },
        { label: "Intense (Travail physique ou sport quotidien vigoureux)", value: "Intense" }
      ],
      
      stepHistoryTitle: "Vos antécédents médicaux / Génétiques",
      stepHistoryDesc: "Évaluez votre prédisposition génétique afin d'ajuster les filtres d'alerte.",
      stepHistoryPlaceholder: "Autre antécédent particulier à inscrire...",
      medicalHistories: [
        { label: "Aucun antécédent particulier", value: "Aucun antécédent" },
        { label: "Présence de cas de diabète dans la famille proche", value: "Antécédents familiaux de diabète de type 2" },
        { label: "Hypertension artérielle ou fatigue cardiaque régulière", value: "Hypertension artérielle diagnostiquée ou suspicion" },
        { label: "Cholestérol élevé ou surpoids persistant", value: "Cholestérol élevé et tendance au surpoids" },
        { label: "Troubles digestifs réguliers (gluten, lactose, ballonnements)", value: "Sensibilité intestinale, ballonnements récurrents" }
      ],
      
      stepGoalTitle: "Quel est votre objectif prioritaire ?",
      stepGoalDesc: "BeSafe construira son coaching diététique hebdomadaire autour de cet angle.",
      wellnessGoals: [
        { label: "Perdre du poids et affiner ma silhouette sainement", value: "Perdre du poids et affiner ma silhouette" },
        { label: "Stabiliser ma glycémie et prévenir les risques de Diabète", value: "Prévenir et réguler ma glycémie pour le Diabète" },
        { label: "Réduire les risques d'Hypertension et vivre plus longtemps", value: "Prendre soin de ma tension artérielle et de mon cœur" },
        { label: "Améliorer ma digestion et adopter une alimentation plus fraîche", value: "Adopter une alimentation plus naturelle et améliorer le transit" },
        { label: "Booster mon niveau d'énergie global et ma vitalité au quotidien", value: "Optimiser mes apports en nutriments pour la forme et le tonus" }
      ],
      
      stepSumTitle: "Prêt pour le diagnostic IA ?",
      stepSumDesc: "BeSafe va maintenant soumettre votre profil médical, IMC, habitudes alimentaires mondiales ou ouest-africaines et objectifs à Gemini 3.5 Flash pour dresser votre scorecard santé et votre plan de repas 7 jours.",
      stepSumYears: "ans",
      stepSumReside: "Réside au",
      stepSumFinish: "Générer mon Coach !"
    },
    dashboard: {
      alertBegan: "Vos rappels intelligents",
      alertBeganDesc: "Bandeau d'alertes préventives calculé par BeSafe.",
      alertNoMealToday: "Vous n'avez pas encore renseigné de repas aujourd'hui. Scannez une photo ou ajoutez un repas pour alimenter l'analyse nutritionnelle !",
      alertActivateNotifications: "Activer les notifications du bureau",
      
      title: "Tableau de Bord Préventif BeSafe",
      scoreTitle: "Score de Santé Global",
      scoreDesc: "Basé sur vos antécédents, IMC, niveau d'activité, alimentation et situation géographique.",
      scoreLevelExcellent: "Excellent - Risques minimaux",
      scoreLevelGood: "Bon - Bonne hygiène générale",
      scoreLevelWarning: "Moyen - Ajustements recommandés",
      scoreLevelDanger: "Critique - Attention prioritaire requise",
      
      imcTitle: "Indice de Masse Corporelle (IMC)",
      imcUnder: "Poids insuffisant",
      imcNormal: "Corpulence normale",
      imcOver: "Surpoids",
      imcObese: "Obésité",
      
      metabolismTitle: "Évaluation du Risque Diabète Type 2",
      hypertensionTitle: "Tension Artérielle & Risque Vasculaire",
      dietQualityTitle: "Qualité de l'Alimentation Globale",
      recsTitle: "Prescriptions Diététiques & Mode de Vie de l'IA",
      
      mealPlanTitle: "Plan de Repas de Saison Sur-Mesure",
      mealPlanDesc: "Recommandations générées pour équilibrer vos plats locaux de saison au",
      
      trackingTitle: "Suivi Physiologique & Historique Clinique",
      trackingDesc: "Saisissez régulièrement vos nouvelles mesures pour analyser les tendances de progression.",
      trackWeight: "Nouveau poids (kg)",
      trackScore: "Score de bien-être quotidien (0-100)",
      trackDate: "Date d'enregistrement",
      trackAddBtn: "Consigner la mesure",
      trackHistoryHeader: "Dossier Médical - Dernières Données Historiques",
      trackColDate: "Période",
      trackColWeight: "Poids",
      trackColScore: "Score de Santé",
      trackEmpty: "Aucune mesure enregistrée pour le moment.",
      
      doctorPDF: "Rapport Médecin (PDF)",
      recalculate: "Mettre à jour le profil",
      disclaimer: "Ces résultats d'intelligence artificielle de pointe sont dispensés à des fins d'information et d'éducation préventive. Ils ne remplacent pas une consultation ou prescription fournie par un professionnel de la santé agréé."
    },
    mealAnalyzer: {
      title: "Analyseur de Repas Intelligent",
      desc: "Prenez votre assiette en photo ! Notre IA BeSafe identifie l'apport calorique et équilibre les féculents locaux.",
      loadingScan: "Analyse Vision Active",
      loadingDetails: "Gemini explore les doses de manioc, de riz, d'huile et d'aliments locaux...",
      dropText: "Glissez-déposez la photo de votre repas ici",
      clickToBrowse: "ou cliquez pour parcourir votre appareil",
      loadedSuccess: "Image chargée avec succès",
      loadedDesc: "BeSafe est prêt à identifier la composition et les calories de votre repas. Nous intégrerons des ajustements sains liés au",
      launchAnalysis: "Lancer l'analyse diététique",
      analysisCompleted: "Analyse Complétée",
      macronutrients: "Valeur nutritionnelle estimée :",
      identifiedIngredients: "Ingrédients identifiés :",
      optimizationTitle: "Suggestions d'amélioration BeSafe",
      analyzeAnother: "Analyser un autre repas"
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
      subtitle: "AI Health Coach",
      login: "Sign in",
      logout: "Sign out"
    },
    landing: {
      badge: "Solidary AI Health-Tech",
      title: "Take care of your body with",
      desc: "An intelligent health coach powered by Gemini 3.5. Get an instant health score, evaluate your type 2 diabetes and hypertension risks, and plan meals adapted to your local customs (foufou, saka-saka, plantains, etc.).",
      adoptedBy: "Adopted in over 12 countries in Africa",
      cardTitle: "Your evaluation starts here",
      cardDesc: "To save your metabolic analyses, dinner photos and track your 7-day plan, sign in securely using your Google account.",
      button: "Sign in with Google",
      featureScan: "Scan",
      featureDiagnose: "Diagnose"
    },
    onboarding: {
      title: "BeSafe Health Profile",
      question: "Question",
      loaderTitle: "Analyzing your data with the BeSafe coach...",
      loaderSteps: [
        "Interpreting your medical profile...",
        "Calculating Diabetes and Hypertension risks...",
        "Extracting best local substitution ingredients...",
        "Custom generating your meals for the week..."
      ],
      loaderSub: "Please wait while BeSafe configures a custom plan adjusted to your local customs.",
      
      stepLangTitle: "Choose your language / Choisissez votre langue",
      stepLangDesc: "Select your preferred language for the entire application and AI reports.",
      
      stepAgeTitle: "How old are you?",
      stepAgeDesc: "Age allows us to evaluate metabolism and identify normal cardiovascular evolution risks.",
      stepAgePlaceholder: "e.g., 34",
      
      stepCorpTitle: "Body measurements",
      stepCorpDesc: "These metrics help the BeSafe coach calculate your BMI (Body Mass Index).",
      stepCorpWeight: "Weight (kg)",
      stepCorpHeight: "Height (cm)",
      
      stepCountryTitle: "Which country do you reside in?",
      stepCountryDesc: "This helps BeSafe identify your local ingredients, local markets, and suggest authentic seasonal recipes.",
      
      stepDietTitle: "What is your typical diet?",
      stepDietDesc: "Select the option that best fits your typical meals, or describe it.",
      stepDietPlaceholder: "Or describe your diet here (e.g., rice, fried plantains, stew...)",
      suggestedDiets: [
        { label: "Rich local dishes (foufou, palm oil sauce, cassava tuber, turkey, beef)", value: "Rich local dishes (foufou, palm oil sauce, cassava, jollof rice, meat)." },
        { label: "Fritters, fried beans, plantains (dodo) and sweet porridges", value: "Fried meals with many starches (fritters, fried beans, plantains)." },
        { label: "Traditional jollof rice, rice with braised fish and cooked vegetables", value: "Traditional white or jollof rice with braised fish and seasonal vegetables." },
        { label: "Classic Western diet (meats, pizzas, pastas, creamy sauces)", value: "Western diet (pasta, processed sauces, pizza, meat, fries, sodas)." },
        { label: "Balanced vegetarian option (tubers, avocado, roasted peanuts, green vegetables)", value: "Mainly vegetarian diet (boiled tubers, avocado, peanuts, spinach, okra)." },
        { label: "Light meals: fish broth (pepper soup), salads, grilled chicken", value: "Light seasonal meals (light fish broth, steamed vegetables, skinless grilled chicken)." }
      ],
      
      stepActTitle: "Physical activity level",
      stepActDesc: "Exercise significantly reduces insulin resistance and activates active blood oxygenation.",
      activities: [
        { label: "Sedentary (Little or no exercise)", value: "Sédentaire" },
        { label: "Moderate (Walking, running or sport 1-3 times/week)", value: "Modérée" },
        { label: "Intense (Physical labor or daily vigorous sport)", value: "Intense" }
      ],
      
      stepHistoryTitle: "Medical / Genetic History",
      stepHistoryDesc: "Assess your genetic predisposition to adjust the predictive warning filters.",
      stepHistoryPlaceholder: "Other specific background history to include...",
      medicalHistories: [
        { label: "No specific history", value: "Aucun antécédent" },
        { label: "Presence of diabetes cases in close family members", value: "Antécédents familiaux de diabète de type 2" },
        { label: "High blood pressure or consistent cardiac fatigue", value: "Hypertension artérielle diagnostiquée ou suspicion" },
        { label: "High cholesterol or persistent overweight", value: "Cholestérol élevé et tendance au surpoids" },
        { label: "Regular digestive disorders (gluten, lactose, bloating)", value: "Sensibilité intestinale, ballonnements récurrents" }
      ],
      
      stepGoalTitle: "What is your high priority goal?",
      stepGoalDesc: "BeSafe will build its weekly dietary coaching around this core objective.",
      wellnessGoals: [
        { label: "Lose weight and shape my figure healthily", value: "Perdre du poids et affiner ma silhouette" },
        { label: "Stabilize blood sugar and prevent type 2 diabetes risk", value: "Prévenir et réguler ma glycémie pour le Diabète" },
        { label: "Reduce Hypertension risks and live longer", value: "Prendre soin de ma tension artérielle et de mon cœur" },
        { label: "Improve digestion and switch to more natural food", value: "Adopter une alimentation plus naturelle et améliorer le transit" },
        { label: "Boost overall energy levels and daily vitality", value: "Optimiser mes apports en nutriments pour la forme et le tonus" }
      ],
      
      stepSumTitle: "Ready for your AI Diagnosis?",
      stepSumDesc: "BeSafe will now submit your clinical profile, BMI, global or West-African dietary habits and goals to Gemini 3.5 Flash to establish your health scorecard and 7-day meal plan.",
      stepSumYears: "years old",
      stepSumReside: "Resides in",
      stepSumFinish: "Generate my Coach !"
    },
    dashboard: {
      alertBegan: "Your Smart Reminders",
      alertBeganDesc: "Preventive warning banner calculated by BeSafe.",
      alertNoMealToday: "You haven't recorded any meal today. Scan a photo or add a meal to feed the nutritional analysis!",
      alertActivateNotifications: "Activate desktop notifications",
      
      title: "BeSafe Preventive Health Dashboard",
      scoreTitle: "Overall Health Score",
      scoreDesc: "Based on your clinical history, BMI, activity level, diet, and geographical context.",
      scoreLevelExcellent: "Excellent - Minimal risks",
      scoreLevelGood: "Good - General healthy habits",
      scoreLevelWarning: "Average - Adjustments recommended",
      scoreLevelDanger: "Critical - Prioritized attention required",
      
      imcTitle: "Body Mass Index (BMI)",
      imcUnder: "Underweight",
      imcNormal: "Normal weight",
      imcOver: "Overweight",
      imcObese: "Obese",
      
      metabolismTitle: "Type 2 Diabetes Risk Evaluation",
      hypertensionTitle: "Blood Pressure & Vascular Risk Analysis",
      dietQualityTitle: "Overall Dietary Quality Assessment",
      recsTitle: "AI Dietary Prescriptions & Lifestyle Guidance",
      
      mealPlanTitle: "Custom Seasonal Meal Plan",
      mealPlanDesc: "Recommendations generated to balance your local seasonal dishes in",
      
      trackingTitle: "Physiological Tracking & Clinical History",
      trackingDesc: "Enter your measurements regularly to analyze progression tendencies.",
      trackWeight: "New weight (kg)",
      trackScore: "Daily well-being score (0-100)",
      trackDate: "Recording date",
      trackAddBtn: "Record measurement",
      trackHistoryHeader: "Medical Record - Latest Historical Data",
      trackColDate: "Date",
      trackColWeight: "Weight",
      trackColScore: "Health Score",
      trackEmpty: "No measurements recorded yet.",
      
      doctorPDF: "Doctor Report (PDF)",
      recalculate: "Update Profile",
      disclaimer: "These state-of-the-art artificial intelligence assessments are purely informational and preventive. They do not replace formal clinical consultation, diagnosis, or prescription by a certified medical doctor/practitioner."
    },
    mealAnalyzer: {
      title: "Smart Meal Analyzer",
      desc: "Take a picture of your plate! Our BeSafe AI will identify the calories and help balance local starches.",
      loadingScan: "Active Vision Scan",
      loadingDetails: "Gemini is examining cassava, rice, oil portions, and local food items...",
      dropText: "Drag and drop your meal photo here",
      clickToBrowse: "or click to browse your device",
      loadedSuccess: "Image loaded successfully",
      loadedDesc: "BeSafe is ready to identify the composition and estimated calories of your meal. We will integrate healthy adjustments based on",
      launchAnalysis: "Launch nutritional analysis",
      analysisCompleted: "Analysis Completed",
      macronutrients: "Estimated nutrition value:",
      identifiedIngredients: "Identified key ingredients:",
      optimizationTitle: "BeSafe Healthy Suggestions",
      analyzeAnother: "Analyze another meal"
    }
  }
};
