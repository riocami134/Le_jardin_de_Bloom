import type { Metadata } from "next";
import { requireUserId } from "@/lib/auth/session";
import { getVirtualGarden, getUserAchievements } from "@/server/queries/garden";
import { Garden } from "@/components/garden/Garden";
import { AchievementCard } from "@/components/garden/AchievementCard";
import { Tabs } from "@/components/ui/Tabs";
import { ACHIEVEMENT_FAMILY_LABEL } from "@/constants/achievement-families";

export const metadata: Metadata = { title: "Mon jardin" };

export default async function GardenPage() {
  const userId = await requireUserId();
  const [virtualGarden, achievements] = await Promise.all([getVirtualGarden(userId), getUserAchievements(userId)]);

  const families = Array.from(new Set(achievements.map((a) => a.family)));
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-h1 text-ivory sm:text-cocoa">Mon jardin</h1>

      <Tabs
        items={[
          {
            id: "jardin",
            label: "Jardin",
            content: (
              <Garden
                season={virtualGarden?.season ?? "spring"}
                level={virtualGarden?.level ?? 1}
                items={(virtualGarden?.items ?? []).map((item) => ({
                  id: item.id,
                  type: item.type,
                  growthStage: item.growthStage,
                  plantName: item.plant?.name,
                }))}
              />
            ),
          },
          {
            id: "badges",
            label: `Badges (${unlockedCount}/${achievements.length})`,
            content: (
              <div className="space-y-6">
                {families.map((family) => (
                  <section key={family} className="space-y-2">
                    <h2 className="font-heading text-h4 text-ivory sm:text-cocoa">
                      {ACHIEVEMENT_FAMILY_LABEL[family] ?? family}
                    </h2>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {achievements
                        .filter((a) => a.family === family)
                        .map((a) => (
                          <AchievementCard key={a.id} name={a.name} description={a.description} icon={a.icon} unlocked={a.unlocked} />
                        ))}
                    </div>
                  </section>
                ))}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
