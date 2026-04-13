import { Sparkles, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

const CollaborationSection = () => (
  <section className="container max-w-3xl mx-auto my-10 px-4">
    <div className="gradient-card rounded-2xl p-10 text-center border border-border glow-pink">
      <Sparkles className="h-10 w-10 mx-auto mb-4 text-primary" />
      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
        MLP Kayou Collectors Community
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Join our growing community of My Little Pony Kayou card collectors! Share your pulls, trade cards, and stay up to date on the latest releases.
      </p>
      <Button className="gap-2">
        Join Discord <ExternalLink className="h-4 w-4" />
      </Button>
    </div>
  </section>
);

export default CollaborationSection;
