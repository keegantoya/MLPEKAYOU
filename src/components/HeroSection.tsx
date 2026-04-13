import { Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => (
  <section className="relative py-20 px-4 text-center overflow-hidden">
    <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" width={1920} height={640} />
    <div className="absolute inset-0 bg-background/80" />
    <div className="relative container max-w-3xl mx-auto">
      <Sparkles className="h-12 w-12 mx-auto mb-6 text-primary animate-pulse" />
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gradient">
        Welcome to PonyCardTracker
      </h1>
      <p className="text-lg text-muted-foreground max-w-xl mx-auto">
        Your ultimate hub for tracking My Little Pony Kayou card collections. Browse, manage, and share your progress across multiple sets.
      </p>
    </div>
  </section>
);

export default HeroSection;
