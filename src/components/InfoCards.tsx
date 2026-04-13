import { Info, Bell, Newspaper } from "lucide-react";

const AboutCard = () => (
  <div className="gradient-card rounded-2xl p-6 border border-border h-full">
    <div className="flex items-center gap-2 mb-4">
      <Info className="h-5 w-5 text-primary" />
      <h3 className="text-lg font-bold text-primary">About</h3>
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed">
      PonyCardTracker is your ultimate hub for tracking My Little Pony Kayou cards. Browse your collection, monitor completion across every set and rarity, grade your most prized pulls, and connect with fellow collectors. Supporting all MLP Kayou sets including Series 1, Series 2, Promo, Special Edition, and collectibles like boxes, binders, badges and more.
    </p>
  </div>
);

const ChangelogCard = () => {
  const logs = [
    { version: "v0.3.0-beta", text: "Series 3 & Wishlist feature added" },
    { version: "v0.2.1-beta", text: "Leaderboards and trade list added" },
    { version: "v0.1.5-beta", text: "Statistics dashboard released" },
    { version: "v0.1.2-beta", text: "Mobile responsive release" },
    { version: "v0.1.0-beta", text: "Open Beta launch 🎉" },
  ];

  return (
    <div className="gradient-card rounded-2xl p-6 border border-border h-full">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-primary">Updates & Changelog</h3>
      </div>
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.version} className="flex gap-3 items-start">
            <span className="text-xs font-mono bg-secondary text-primary px-2 py-0.5 rounded-md whitespace-nowrap mt-0.5">
              {log.version}
            </span>
            <span className="text-sm text-muted-foreground">{log.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const NewsCard = () => (
  <div className="gradient-card rounded-2xl p-6 border border-border h-full">
    <div className="flex items-center gap-2 mb-4">
      <Newspaper className="h-5 w-5 text-primary" />
      <h3 className="text-lg font-bold text-primary">News & Announcements</h3>
    </div>
    <div className="space-y-4">
      <div>
        <span className="text-xs font-semibold bg-secondary text-primary px-2 py-0.5 rounded-md">
          Now available
        </span>
        <p className="text-sm text-muted-foreground mt-2">
          Series 3 cards added! Browse and track the latest My Little Pony Kayou release with over 100 new cards.
        </p>
      </div>
      <div>
        <span className="text-xs font-semibold bg-secondary text-primary px-2 py-0.5 rounded-md">
          Community
        </span>
        <p className="text-sm text-muted-foreground mt-2">
          We launched our Official Community Discord! Join now to connect with fellow collectors.
        </p>
      </div>
    </div>
  </div>
);

const InfoCards = () => (
  <section className="container px-4 pb-16">
    <div className="grid md:grid-cols-3 gap-6">
      <AboutCard />
      <ChangelogCard />
      <NewsCard />
    </div>
  </section>
);

export default InfoCards;
