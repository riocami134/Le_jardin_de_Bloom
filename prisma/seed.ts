/**
 * Seed de démonstration — Le Jardin de Bloom.
 *
 * Toutes les données créées ici sont clairement identifiables comme des
 * données de démo : compte "demo@jardindebloom.app", plantes préfixées
 * "Mon"/"Ma", et le flag `isDemo` implicite via cet unique compte connu.
 * Aucune donnée réelle d'utilisateur n'est mélangée à ce jeu de données.
 */
import { PrismaClient, PlantCategory, CareActionType, ReminderType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ACHIEVEMENTS: Array<{
  id: string;
  family: string;
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
}> = [
  // Premiers pas
  { id: "first_plant", family: "premiers_pas", name: "Première plante", description: "Tu as ajouté ta toute première plante.", icon: "🌱", sortOrder: 1 },
  { id: "first_scan", family: "premiers_pas", name: "Premier scan", description: "Tu as utilisé le scanner pour la première fois.", icon: "📷", sortOrder: 2 },
  { id: "first_analysis", family: "premiers_pas", name: "Première analyse", description: "Bloom a observé une première photo pour toi.", icon: "🔍", sortOrder: 3 },
  { id: "first_care", family: "premiers_pas", name: "Premier soin", description: "Tu as enregistré ta première action de soin.", icon: "💧", sortOrder: 4 },
  { id: "first_bloom_meeting", family: "premiers_pas", name: "Première rencontre avec Bloom", description: "Bloom t'a dit bonjour pour la première fois.", icon: "🐰", sortOrder: 5 },
  { id: "first_garden", family: "premiers_pas", name: "Premier jardin", description: "Ton jardin virtuel a pris racine.", icon: "🌳", sortOrder: 6 },
  // Collection
  { id: "collection_3", family: "collection", name: "3 plantes", description: "Ta collection compte 3 plantes.", icon: "🪴", sortOrder: 7 },
  { id: "collection_5", family: "collection", name: "5 plantes", description: "Ta collection compte 5 plantes.", icon: "🪴", sortOrder: 8 },
  { id: "collection_10", family: "collection", name: "10 plantes", description: "Ta collection compte 10 plantes.", icon: "🪴", sortOrder: 9 },
  { id: "collection_25", family: "collection", name: "25 plantes", description: "Ta collection compte 25 plantes.", icon: "🪴", sortOrder: 10 },
  { id: "collection_50", family: "collection", name: "50 plantes", description: "Ta collection compte 50 plantes.", icon: "🪴", sortOrder: 11 },
  { id: "collection_100", family: "collection", name: "100 plantes", description: "Ta collection compte 100 plantes.", icon: "🪴", sortOrder: 12 },
  // Entretien
  { id: "care_10", family: "entretien", name: "10 soins", description: "10 actions de soin enregistrées.", icon: "🧤", sortOrder: 13 },
  { id: "care_25", family: "entretien", name: "25 soins", description: "25 actions de soin enregistrées.", icon: "🧤", sortOrder: 14 },
  { id: "care_50", family: "entretien", name: "50 soins", description: "50 actions de soin enregistrées.", icon: "🧤", sortOrder: 15 },
  { id: "care_100", family: "entretien", name: "100 soins", description: "100 actions de soin enregistrées.", icon: "🧤", sortOrder: 16 },
  { id: "care_250", family: "entretien", name: "250 soins", description: "250 actions de soin enregistrées.", icon: "🧤", sortOrder: 17 },
  { id: "care_500", family: "entretien", name: "500 soins", description: "500 actions de soin enregistrées.", icon: "💚", sortOrder: 18 },
  // Régularité (cumulatif, jamais punitif)
  { id: "tracking_7", family: "regularite", name: "7 jours de suivi", description: "7 jours cumulés à prendre des nouvelles de tes plantes.", icon: "📅", sortOrder: 19 },
  { id: "tracking_14", family: "regularite", name: "14 jours de suivi", description: "14 jours cumulés de suivi.", icon: "📅", sortOrder: 20 },
  { id: "tracking_30", family: "regularite", name: "30 jours de suivi", description: "30 jours cumulés de suivi.", icon: "📅", sortOrder: 21 },
  { id: "tracking_60", family: "regularite", name: "60 jours de suivi", description: "60 jours cumulés de suivi.", icon: "📅", sortOrder: 22 },
  { id: "tracking_100", family: "regularite", name: "100 jours de suivi", description: "100 jours cumulés de suivi.", icon: "📅", sortOrder: 23 },
  { id: "tracking_365", family: "regularite", name: "365 jours de suivi", description: "Une année de suivi cumulé.", icon: "⭐", sortOrder: 24 },
  // Observation
  { id: "photos_5", family: "observation", name: "5 photos", description: "5 photos ajoutées à tes plantes.", icon: "📸", sortOrder: 25 },
  { id: "photos_10", family: "observation", name: "10 photos", description: "10 photos ajoutées.", icon: "📸", sortOrder: 26 },
  { id: "photos_25", family: "observation", name: "25 photos", description: "25 photos ajoutées.", icon: "🖼️", sortOrder: 27 },
  { id: "photos_50", family: "observation", name: "50 photos", description: "50 photos ajoutées.", icon: "🖼️", sortOrder: 28 },
  { id: "photos_100", family: "observation", name: "100 photos", description: "100 photos ajoutées.", icon: "🖼️", sortOrder: 29 },
  // Santé
  { id: "first_plant_saved", family: "sante", name: "Première plante sauvée", description: "Une plante à surveiller est redevenue en bonne forme.", icon: "💚", sortOrder: 30 },
  { id: "first_improvement", family: "sante", name: "Première amélioration", description: "Le score de santé d'une plante s'est amélioré.", icon: "📈", sortOrder: 31 },
  { id: "improvements_5", family: "sante", name: "5 améliorations", description: "5 améliorations de santé constatées.", icon: "📈", sortOrder: 32 },
  { id: "improvements_10", family: "sante", name: "10 améliorations", description: "10 améliorations de santé constatées.", icon: "📈", sortOrder: 33 },
  { id: "diagnostic_expert", family: "sante", name: "Expert du diagnostic", description: "Tu as répondu à de nombreuses questions de Bloom.", icon: "🩺", sortOrder: 34 },
  { id: "attentive_observer", family: "sante", name: "Observateur attentif", description: "Tu remarques les petits changements.", icon: "👀", sortOrder: 35 },
  // Environnement
  { id: "first_orientation", family: "environnement", name: "Première orientation", description: "Tu as renseigné l'orientation d'une fenêtre.", icon: "🧭", sortOrder: 36 },
  { id: "first_compass", family: "environnement", name: "Premier boussole", description: "Tu as utilisé la boussole pour la première fois.", icon: "🧭", sortOrder: 37 },
  { id: "perfect_placement", family: "environnement", name: "Placement parfait", description: "Une plante a trouvé un emplacement très compatible.", icon: "📍", sortOrder: 38 },
  { id: "light_master", family: "environnement", name: "Maître de la lumière", description: "Tu maîtrises les besoins en lumière de tes plantes.", icon: "☀️", sortOrder: 39 },
  { id: "garden_well_settled", family: "environnement", name: "Jardin bien installé", description: "Toutes tes plantes ont un emplacement renseigné.", icon: "🏡", sortOrder: 40 },
  // Exploration
  { id: "first_discovery", family: "exploration", name: "Première découverte", description: "Tu as consulté ta première fiche espèce.", icon: "🔎", sortOrder: 41 },
  { id: "species_10", family: "exploration", name: "10 espèces découvertes", description: "10 fiches espèces consultées.", icon: "📖", sortOrder: 42 },
  { id: "species_25", family: "exploration", name: "25 espèces découvertes", description: "25 fiches espèces consultées.", icon: "📖", sortOrder: 43 },
  { id: "species_50", family: "exploration", name: "50 espèces découvertes", description: "50 fiches espèces consultées.", icon: "📖", sortOrder: 44 },
  { id: "species_100", family: "exploration", name: "100 espèces découvertes", description: "100 fiches espèces consultées.", icon: "📖", sortOrder: 45 },
  { id: "botanical_explorer", family: "exploration", name: "Explorateur botanique", description: "Un vrai passionné de botanique.", icon: "🧑‍🌾", sortOrder: 46 },
  // Jardin virtuel
  { id: "first_garden_item", family: "jardin_virtuel", name: "Premier élément débloqué", description: "Ton jardin virtuel a reçu son premier élément.", icon: "🔓", sortOrder: 47 },
  { id: "first_tree", family: "jardin_virtuel", name: "Premier arbre", description: "Un arbre a poussé dans ton jardin.", icon: "🌳", sortOrder: 48 },
  { id: "first_bush", family: "jardin_virtuel", name: "Premier massif", description: "Un massif de fleurs a fleuri.", icon: "🌸", sortOrder: 49 },
  { id: "first_decoration", family: "jardin_virtuel", name: "Premier décor", description: "Un décor a rejoint ton jardin.", icon: "🏮", sortOrder: 50 },
  { id: "garden_blooming", family: "jardin_virtuel", name: "Jardin fleuri", description: "Ton jardin commence à fleurir joliment.", icon: "🌼", sortOrder: 51 },
  { id: "garden_lush", family: "jardin_virtuel", name: "Jardin luxuriant", description: "Ton jardin est luxuriant.", icon: "🌿", sortOrder: 52 },
  { id: "garden_extraordinary", family: "jardin_virtuel", name: "Jardin extraordinaire", description: "Un jardin extraordinaire, à ton image.", icon: "⛲", sortOrder: 53 },
  // Saisonniers
  { id: "season_spring", family: "saisonniers", name: "Printemps", description: "Tu as traversé un printemps avec Bloom.", icon: "🌷", sortOrder: 54 },
  { id: "season_summer", family: "saisonniers", name: "Été", description: "Tu as traversé un été avec Bloom.", icon: "🌻", sortOrder: 55 },
  { id: "season_autumn", family: "saisonniers", name: "Automne", description: "Tu as traversé un automne avec Bloom.", icon: "🍂", sortOrder: 56 },
  { id: "season_winter", family: "saisonniers", name: "Hiver", description: "Tu as traversé un hiver avec Bloom.", icon: "❄️", sortOrder: 57 },
  { id: "one_year", family: "saisonniers", name: "Une année au jardin", description: "Une année complète passée avec ton jardin.", icon: "🎂", sortOrder: 58 },
];

const SPECIES: Array<Parameters<typeof prisma.plantSpecies.create>[0]["data"]> = [
  {
    commonName: "Monstera",
    scientificName: "Monstera deliciosa",
    family: "Araceae",
    origin: "Amérique centrale",
    category: PlantCategory.tropicales,
    light: "Lumière vive et indirecte",
    temperatureRange: "18-27°C",
    humidity: "Moyenne à élevée",
    watering: "Quand les 3 premiers cm de substrat sont secs",
    fertilizing: "Engrais liquide toutes les 4 semaines en saison de croissance",
    pruning: "Retirer les feuilles jaunies ou abîmées",
    repotting: "Tous les 2 ans, pot légèrement plus grand",
    propagation: "Bouturage de tige avec nœud aérien",
    commonProblems: ["Feuilles jaunes (excès d'eau)", "Bords bruns (air trop sec)"],
    pests: ["Cochenilles", "Araignées rouges"],
    toxicity: "Toxique pour chats et chiens si ingérée",
    difficulty: "facile",
    petSafe: false,
    indoorOutdoor: "interieur",
    imageUrl: "/plants/placeholder-monstera.svg",
  },
  {
    commonName: "Calathea",
    scientificName: "Calathea orbifolia",
    family: "Marantaceae",
    origin: "Amérique du Sud",
    category: PlantCategory.tropicales,
    light: "Lumière indirecte, jamais de soleil direct",
    temperatureRange: "18-24°C",
    humidity: "Élevée",
    watering: "Substrat toujours légèrement humide, eau non calcaire",
    fertilizing: "Engrais dilué toutes les 4-6 semaines en saison",
    pruning: "Retirer les feuilles fanées à la base",
    repotting: "Chaque printemps, pot large et peu profond",
    propagation: "Division de touffe",
    commonProblems: ["Bords secs (air trop sec)", "Feuilles qui s'enroulent le soir (normal)"],
    pests: ["Araignées rouges"],
    toxicity: "Non toxique",
    difficulty: "modere",
    petSafe: true,
    indoorOutdoor: "interieur",
    imageUrl: "/plants/placeholder-calathea.svg",
  },
  {
    commonName: "Basilic",
    scientificName: "Ocimum basilicum",
    family: "Lamiaceae",
    origin: "Asie tropicale",
    category: PlantCategory.aromatiques,
    light: "Plein soleil à mi-ombre",
    temperatureRange: "18-30°C",
    humidity: "Moyenne",
    watering: "Substrat frais mais bien drainé, arrosage régulier",
    fertilizing: "Engrais léger toutes les 3 semaines",
    pruning: "Pincer les fleurs pour prolonger la production de feuilles",
    repotting: "Rarement nécessaire (culture souvent annuelle)",
    propagation: "Semis ou bouturage de tige dans l'eau",
    commonProblems: ["Feuilles qui jaunissent (excès d'eau)", "Montée en fleurs rapide (manque de pincement)"],
    pests: ["Pucerons"],
    toxicity: "Non toxique — comestible",
    difficulty: "facile",
    petSafe: true,
    indoorOutdoor: "les-deux",
    imageUrl: "/plants/placeholder-basilic.svg",
  },
  {
    commonName: "Citronnier",
    scientificName: "Citrus limon",
    family: "Rutaceae",
    origin: "Asie",
    category: PlantCategory.fruits,
    light: "Plein soleil",
    temperatureRange: "15-25°C, protéger en dessous de 5°C",
    humidity: "Moyenne",
    watering: "Laisser sécher légèrement entre deux arrosages",
    fertilizing: "Engrais pour agrumes toutes les 3-4 semaines en saison",
    pruning: "Tailler après la fructification pour aérer",
    repotting: "Tous les 2-3 ans, terreau drainant",
    propagation: "Bouturage semi-ligneux ou greffe",
    commonProblems: ["Chute de feuilles (courant d'air froid)", "Fruits qui tombent jeunes (stress hydrique)"],
    pests: ["Cochenilles", "Pucerons"],
    toxicity: "Feuilles légèrement toxiques pour les animaux",
    difficulty: "modere",
    petSafe: false,
    indoorOutdoor: "les-deux",
    imageUrl: "/plants/placeholder-citronnier.svg",
  },
];

async function main() {
  console.log("🌱 Seed — Le Jardin de Bloom (données de démonstration)");

  await prisma.userAchievement.deleteMany({});
  await prisma.achievement.deleteMany({});
  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.create({ data: achievement });
  }
  console.log(`  ✔ ${ACHIEVEMENTS.length} badges créés`);

  const speciesRecords = [];
  for (const species of SPECIES) {
    const record = await prisma.plantSpecies.upsert({
      where: { scientificName: species.scientificName as string },
      update: species,
      create: species,
    });
    speciesRecords.push(record);
  }
  console.log(`  ✔ ${speciesRecords.length} espèces créées`);

  const existingDemo = await prisma.user.findUnique({ where: { email: "demo@jardindebloom.app" } });
  if (existingDemo) {
    await prisma.user.delete({ where: { id: existingDemo.id } });
  }

  const passwordHash = await bcrypt.hash("JardinDeBloom2026!", 10);
  const demoUser = await prisma.user.create({
    data: {
      email: "demo@jardindebloom.app",
      passwordHash,
      name: "Demo",
      city: "Lyon",
      plantLocationType: "interieur",
      pets: ["chat"],
      plantCountRange: "1-5",
      onboardedAt: new Date(),
      consentLocation: true,
      consentNotifications: true,
      virtualGarden: {
        create: { season: "autumn", level: 2 },
      },
    },
    include: { virtualGarden: true },
  });
  console.log(`  ✔ Utilisateur démo créé (${demoUser.email})`);

  await prisma.weatherSnapshot.create({
    data: {
      city: "Lyon",
      temperatureC: 18,
      humidityPct: 55,
      rainProbability: 0.3,
      rainAmountMm: 1.2,
      windSpeedKmh: 10,
      condition: "partly_cloudy",
    },
  });

  const plantSeeds = [
    {
      species: speciesRecords[0]!,
      name: "Mon Monstera",
      status: "healthy" as const,
      healthScores: [68, 74, 79, 84],
      location: { name: "Salon", room: "Salon", indoorOutdoor: "interieur", windowOrientation: "sud-est", distanceToWindowM: 1.2 },
      environment: { name: "Salon lumineux", temperatureC: 21, humidityPct: 50, lightDescription: "Lumière vive filtrée toute la journée" },
    },
    {
      species: speciesRecords[1]!,
      name: "Mon Calathea",
      status: "watch" as const,
      healthScores: [80, 76, 70, 66],
      location: { name: "Chambre", room: "Chambre", indoorOutdoor: "interieur", windowOrientation: "nord", distanceToWindowM: 2.0 },
      environment: { name: "Chambre douce", temperatureC: 19, humidityPct: 40, lightDescription: "Lumière indirecte modérée" },
    },
    {
      species: speciesRecords[2]!,
      name: "Mon Basilic",
      status: "healthy" as const,
      healthScores: [72, 80, 88],
      location: { name: "Cuisine", room: "Cuisine", indoorOutdoor: "interieur", windowOrientation: "sud", distanceToWindowM: 0.3 },
      environment: { name: "Rebord de fenêtre", temperatureC: 22, humidityPct: 45, lightDescription: "Plein soleil une partie de la journée" },
    },
    {
      species: speciesRecords[3]!,
      name: "Mon Citronnier",
      status: "attention" as const,
      healthScores: [90, 82, 71, 58],
      location: { name: "Balcon", room: "Balcon", indoorOutdoor: "exterieur", windowOrientation: "sud-ouest", distanceToWindowM: 0 },
      environment: { name: "Balcon exposé", temperatureC: 14, humidityPct: 60, lightDescription: "Plein soleil, exposé au vent" },
    },
  ];

  let totalPhotos = 0;
  let totalCareActions = 0;

  for (const seed of plantSeeds) {
    const location = await prisma.plantLocation.create({ data: seed.location });
    const environment = await prisma.environment.create({ data: seed.environment });

    const plant = await prisma.plant.create({
      data: {
        userId: demoUser.id,
        speciesId: seed.species.id,
        name: seed.name,
        status: seed.status,
        healthScore: seed.healthScores[seed.healthScores.length - 1],
        locationId: location.id,
        environmentId: environment.id,
        notes: null,
      },
    });

    const photoBase = (seed.species.imageUrl as string) ?? "/plants/placeholder-monstera.svg";
    const photos = [];
    for (let i = 0; i < seed.healthScores.length; i++) {
      const photo = await prisma.plantPhoto.create({
        data: {
          plantId: plant.id,
          storageKey: `demo:${photoBase}`,
          caption: `Photo ${i + 1}`,
          takenAt: new Date(Date.now() - (seed.healthScores.length - i) * 7 * 24 * 60 * 60 * 1000),
        },
      });
      photos.push(photo);
      totalPhotos++;
    }

    for (let i = 0; i < seed.healthScores.length; i++) {
      const score = seed.healthScores[i]!;
      await prisma.healthAnalysis.create({
        data: {
          plantId: plant.id,
          photoId: photos[i]!.id,
          score,
          confidence: 0.7 + i * 0.05,
          observations: {
            yellowLeaves: seed.status === "attention" && i === seed.healthScores.length - 1,
            brownLeaves: false,
            wilting: false,
            spots: seed.status === "watch" && i >= seed.healthScores.length - 2,
            pestsVisible: false,
          },
          hypotheses: seed.status !== "healthy" ? ["Arrosage à ajuster", "Luminosité à vérifier"] : [],
          recommendations: seed.status !== "healthy" ? ["Vérifier le substrat avant d'arroser", "Observer l'évolution sur 7 jours"] : ["Continuer le suivi habituel"],
          createdAt: new Date(Date.now() - (seed.healthScores.length - i) * 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const careAction = await prisma.careAction.create({
      data: {
        plantId: plant.id,
        type: CareActionType.watering,
        note: "Arrosage régulier",
        performedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.wateringEvent.create({
      data: { careActionId: careAction.id, amountMl: 200, substrateWasDry: true },
    });
    totalCareActions++;

    const fertilizeAction = await prisma.careAction.create({
      data: {
        plantId: plant.id,
        type: CareActionType.fertilizing,
        note: "Engrais liquide dilué",
        performedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.fertilizingEvent.create({
      data: { careActionId: fertilizeAction.id, product: "Engrais plantes vertes", dilution: "1/2 dose" },
    });
    totalCareActions++;

    if (seed.status !== "healthy") {
      await prisma.reminder.create({
        data: {
          userId: demoUser.id,
          plantId: plant.id,
          type: seed.status === "attention" ? ReminderType.check_substrate : ReminderType.observe,
          message:
            seed.status === "attention"
              ? `🌿 ${seed.name} pourrait avoir besoin d'un petit coup d'œil. Peux-tu vérifier le substrat ?`
              : `📸 Observe ${seed.name} de près, Bloom a repéré un petit détail.`,
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    }

    await prisma.gardenItem.create({
      data: {
        virtualGardenId: demoUser.virtualGarden!.id,
        plantId: plant.id,
        type: seed.status === "healthy" ? "tree" : "sprout",
        growthStage: seed.status === "healthy" ? 3 : 1,
        originAction: "plant_added",
      },
    });
  }

  console.log(`  ✔ ${plantSeeds.length} plantes créées (${totalPhotos} photos, ${totalCareActions} soins)`);

  const unlockedIds = ["first_plant", "first_scan", "first_analysis", "first_care", "first_bloom_meeting", "first_garden", "collection_3", "care_10", "photos_10", "first_discovery", "first_garden_item", "first_tree"];
  for (const id of unlockedIds) {
    await prisma.userAchievement.create({
      data: { userId: demoUser.id, achievementId: id },
    });
  }
  console.log(`  ✔ ${unlockedIds.length} badges débloqués pour la démo`);

  console.log("🌸 Seed terminé — connecte-toi avec demo@jardindebloom.app / JardinDeBloom2026!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
