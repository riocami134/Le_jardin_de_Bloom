-- CreateEnum
CREATE TYPE "PlantCategory" AS ENUM ('succulentes', 'palmiers', 'fleuries', 'aromatiques', 'potager', 'fruits', 'arbres', 'arbustes', 'grimpantes', 'retombantes', 'tropicales', 'mediterraneennes', 'jardin', 'bulbes', 'fougeres', 'carnivores', 'aquatiques', 'bonsais');

-- CreateEnum
CREATE TYPE "PlantStatus" AS ENUM ('healthy', 'watch', 'attention', 'unknown');

-- CreateEnum
CREATE TYPE "CareActionType" AS ENUM ('watering', 'fertilizing', 'repotting', 'pruning', 'cleaning', 'location_change', 'analysis');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('check_substrate', 'observe', 'fertilize', 'repot', 'protect_from_cold', 'check_location');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('pending', 'done', 'dismissed');

-- CreateEnum
CREATE TYPE "GardenSeason" AS ENUM ('spring', 'summer', 'autumn', 'winter');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "city" TEXT,
    "plantLocationType" TEXT,
    "pets" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "plantCountRange" TEXT,
    "onboardedAt" TIMESTAMP(3),
    "consentLocation" BOOLEAN NOT NULL DEFAULT false,
    "consentNotifications" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantSpecies" (
    "id" TEXT NOT NULL,
    "commonName" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "family" TEXT,
    "origin" TEXT,
    "category" "PlantCategory" NOT NULL,
    "light" TEXT NOT NULL,
    "temperatureRange" TEXT,
    "humidity" TEXT,
    "watering" TEXT NOT NULL,
    "fertilizing" TEXT,
    "pruning" TEXT,
    "repotting" TEXT,
    "propagation" TEXT,
    "commonProblems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "toxicity" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'facile',
    "petSafe" BOOLEAN NOT NULL DEFAULT true,
    "indoorOutdoor" TEXT NOT NULL DEFAULT 'interieur',
    "imageUrl" TEXT,
    "similarSpeciesIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantSpecies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "speciesId" TEXT,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "notes" TEXT,
    "status" "PlantStatus" NOT NULL DEFAULT 'unknown',
    "healthScore" INTEGER,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "locationId" TEXT,
    "environmentId" TEXT,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "room" TEXT,
    "indoorOutdoor" TEXT NOT NULL DEFAULT 'interieur',
    "windowOrientation" TEXT,
    "distanceToWindowM" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Environment" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "temperatureC" DOUBLE PRECISION,
    "humidityPct" DOUBLE PRECISION,
    "lightDescription" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Environment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantPhoto" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "caption" TEXT,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlantPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthAnalysis" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "photoId" TEXT,
    "score" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "observations" JSONB NOT NULL,
    "hypotheses" JSONB,
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Symptom" (
    "id" TEXT NOT NULL,
    "healthAnalysisId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'low',
    "note" TEXT,

    CONSTRAINT "Symptom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareAction" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "type" "CareActionType" NOT NULL,
    "note" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WateringEvent" (
    "id" TEXT NOT NULL,
    "careActionId" TEXT NOT NULL,
    "amountMl" INTEGER,
    "substrateWasDry" BOOLEAN,

    CONSTRAINT "WateringEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FertilizingEvent" (
    "id" TEXT NOT NULL,
    "careActionId" TEXT NOT NULL,
    "product" TEXT,
    "dilution" TEXT,

    CONSTRAINT "FertilizingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepottingEvent" (
    "id" TEXT NOT NULL,
    "careActionId" TEXT NOT NULL,
    "potSizeCm" INTEGER,
    "soilType" TEXT,

    CONSTRAINT "RepottingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PruningEvent" (
    "id" TEXT NOT NULL,
    "careActionId" TEXT NOT NULL,
    "partsRemoved" TEXT,

    CONSTRAINT "PruningEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherSnapshot" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "temperatureC" DOUBLE PRECISION NOT NULL,
    "humidityPct" DOUBLE PRECISION NOT NULL,
    "rainProbability" DOUBLE PRECISION NOT NULL,
    "rainAmountMm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "windSpeedKmh" DOUBLE PRECISION NOT NULL,
    "condition" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plantId" TEXT,
    "type" "ReminderType" NOT NULL,
    "message" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plantId" TEXT,
    "context" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "emotion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirtualGarden" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "season" "GardenSeason" NOT NULL DEFAULT 'spring',
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirtualGarden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GardenItem" (
    "id" TEXT NOT NULL,
    "virtualGardenId" TEXT NOT NULL,
    "plantId" TEXT,
    "type" TEXT NOT NULL,
    "growthStage" INTEGER NOT NULL DEFAULT 1,
    "originAction" TEXT,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GardenItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PlantSpecies_scientificName_key" ON "PlantSpecies"("scientificName");

-- CreateIndex
CREATE INDEX "PlantSpecies_category_idx" ON "PlantSpecies"("category");

-- CreateIndex
CREATE INDEX "Plant_userId_idx" ON "Plant"("userId");

-- CreateIndex
CREATE INDEX "Plant_speciesId_idx" ON "Plant"("speciesId");

-- CreateIndex
CREATE INDEX "Plant_userId_status_idx" ON "Plant"("userId", "status");

-- CreateIndex
CREATE INDEX "PlantPhoto_plantId_idx" ON "PlantPhoto"("plantId");

-- CreateIndex
CREATE INDEX "HealthAnalysis_plantId_idx" ON "HealthAnalysis"("plantId");

-- CreateIndex
CREATE INDEX "Symptom_healthAnalysisId_idx" ON "Symptom"("healthAnalysisId");

-- CreateIndex
CREATE INDEX "CareAction_plantId_type_idx" ON "CareAction"("plantId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "WateringEvent_careActionId_key" ON "WateringEvent"("careActionId");

-- CreateIndex
CREATE UNIQUE INDEX "FertilizingEvent_careActionId_key" ON "FertilizingEvent"("careActionId");

-- CreateIndex
CREATE UNIQUE INDEX "RepottingEvent_careActionId_key" ON "RepottingEvent"("careActionId");

-- CreateIndex
CREATE UNIQUE INDEX "PruningEvent_careActionId_key" ON "PruningEvent"("careActionId");

-- CreateIndex
CREATE INDEX "WeatherSnapshot_city_timestamp_idx" ON "WeatherSnapshot"("city", "timestamp");

-- CreateIndex
CREATE INDEX "Reminder_userId_scheduledFor_idx" ON "Reminder"("userId", "scheduledFor");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Conversation_userId_idx" ON "Conversation"("userId");

-- CreateIndex
CREATE INDEX "ConversationMessage_conversationId_idx" ON "ConversationMessage"("conversationId");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualGarden_userId_key" ON "VirtualGarden"("userId");

-- CreateIndex
CREATE INDEX "GardenItem_virtualGardenId_idx" ON "GardenItem"("virtualGardenId");

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "PlantSpecies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "PlantLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantPhoto" ADD CONSTRAINT "PlantPhoto_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthAnalysis" ADD CONSTRAINT "HealthAnalysis_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthAnalysis" ADD CONSTRAINT "HealthAnalysis_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "PlantPhoto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Symptom" ADD CONSTRAINT "Symptom_healthAnalysisId_fkey" FOREIGN KEY ("healthAnalysisId") REFERENCES "HealthAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareAction" ADD CONSTRAINT "CareAction_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WateringEvent" ADD CONSTRAINT "WateringEvent_careActionId_fkey" FOREIGN KEY ("careActionId") REFERENCES "CareAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FertilizingEvent" ADD CONSTRAINT "FertilizingEvent_careActionId_fkey" FOREIGN KEY ("careActionId") REFERENCES "CareAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepottingEvent" ADD CONSTRAINT "RepottingEvent_careActionId_fkey" FOREIGN KEY ("careActionId") REFERENCES "CareAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PruningEvent" ADD CONSTRAINT "PruningEvent_careActionId_fkey" FOREIGN KEY ("careActionId") REFERENCES "CareAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualGarden" ADD CONSTRAINT "VirtualGarden_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GardenItem" ADD CONSTRAINT "GardenItem_virtualGardenId_fkey" FOREIGN KEY ("virtualGardenId") REFERENCES "VirtualGarden"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GardenItem" ADD CONSTRAINT "GardenItem_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
