import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getGardenSummary, getVirtualGarden } from "@/server/queries/garden";
import { getPlantsToWatch, getRecentAnalyses } from "@/server/queries/plants";
import { getTodayReminders } from "@/server/queries/reminders";
import { getWeatherProvider } from "@/lib/weather";
import { bloomService } from "@/server/services/bloom-service";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { ReminderCard } from "@/components/plants/ReminderCard";
import { BloomMessage } from "@/components/bloom/BloomMessage";
import { PLANT_STATUS } from "@/constants/plant-status";

export default async function HomePage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (!user.onboardedAt) {
    redirect("/onboarding");
  }

  const [gardenSummary, reminders, plantsToWatch, recentAnalyses, virtualGarden] = await Promise.all([
    getGardenSummary(userId),
    getTodayReminders(userId),
    getPlantsToWatch(userId),
    getRecentAnalyses(userId),
    getVirtualGarden(userId),
  ]);

  const weather = user.city ? await getWeatherProvider().getWeatherContext({ city: user.city }) : null;

  const bloomMessage = await bloomService.getMessage({
    plantName: plantsToWatch[0]?.name ?? "ton jardin",
    weatherCondition: weather?.current.condition,
  });

  const firstName = user.name?.split(" ")[0] ?? "toi";
  const overallGood = gardenSummary.attention === 0 && gardenSummary.watch <= 1;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-small font-semibold text-ivory/70 sm:text-cocoa/60">Bonjour {firstName} 👋</p>
        <h1 className="font-heading text-h1 text-ivory sm:text-cocoa">
          {overallGood ? "Ton jardin se porte bien aujourd'hui !" : "Ton jardin a besoin d'un peu d'attention"}
        </h1>
      </header>

      <Card>
        <h2 className="font-heading text-h4 text-cocoa">Ton jardin en un coup d&apos;œil</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryStat label="Plantes" value={gardenSummary.total} icon="🌿" />
          <SummaryStat label={PLANT_STATUS.healthy.label} value={gardenSummary.healthy} icon={PLANT_STATUS.healthy.icon} />
          <SummaryStat label={PLANT_STATUS.watch.label} value={gardenSummary.watch} icon={PLANT_STATUS.watch.icon} />
          <SummaryStat label={PLANT_STATUS.attention.label} value={gardenSummary.attention} icon={PLANT_STATUS.attention.icon} />
        </div>
      </Card>

      {reminders.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-heading text-h4 text-ivory sm:text-cocoa">Aujourd&apos;hui</h2>
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                message={reminder.message}
                plantId={reminder.plantId}
                plantName={reminder.plant?.name}
              />
            ))}
          </div>
        </section>
      )}

      {weather && <WeatherCard weather={weather} />}

      {plantsToWatch.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-heading text-h4 text-ivory sm:text-cocoa">Plantes à surveiller</h2>
          <div className="space-y-2">
            {plantsToWatch.map((plant) => (
              <Link key={plant.id} href={`/plants/${plant.id}`}>
                <Card padded className="flex items-center justify-between !py-3">
                  <div>
                    <p className="font-semibold text-cocoa">{plant.name}</p>
                    <p className="text-caption text-cocoa/60">{plant.species?.commonName}</p>
                  </div>
                  <Badge tone={plant.status === "attention" ? "attention" : "watch"} icon={PLANT_STATUS[plant.status].icon}>
                    {PLANT_STATUS[plant.status].label}
                  </Badge>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentAnalyses.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-heading text-h4 text-ivory sm:text-cocoa">Analyses récentes</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {recentAnalyses.map((analysis) => (
              <Link key={analysis.id} href={`/plants/${analysis.plant.id}`}>
                <Card padded={false} className="overflow-hidden">
                  <div className="flex aspect-square items-center justify-center bg-peach-light text-h2">🌿</div>
                  <div className="p-2 text-center">
                    <p className="text-caption font-semibold text-cocoa">{analysis.score}/100</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <BloomMessage bloom={{ ...bloomMessage, emotion: "focused" }} />

      {virtualGarden && (
        <Link href="/garden">
          <Card className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-h4 text-cocoa">Ton jardin virtuel</h2>
              <p className="text-small text-cocoa/60">{virtualGarden.items.length} éléments · niveau {virtualGarden.level}</p>
            </div>
            <span aria-hidden="true" className="text-h2">
              🌳
            </span>
          </Card>
        </Link>
      )}
    </div>
  );
}

function SummaryStat({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="rounded-button bg-ivory p-3 text-center shadow-soft">
      <p className="text-h3" aria-hidden="true">
        {icon}
      </p>
      <p className="font-heading text-h3 text-cocoa">{value}</p>
      <p className="text-caption text-cocoa/60">{label}</p>
    </div>
  );
}
