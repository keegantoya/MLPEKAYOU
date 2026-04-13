import { Button } from "./ui/button";

const GuestBanner = () => (
  <div className="gradient-accent py-2 px-4 text-center text-sm font-medium text-primary-foreground">
    <span className="mr-2">👋 You are browsing as a guest. Log in or create an account to track your collection!</span>
    <Button variant="outline" size="sm" className="mr-2 h-7 border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
      Log In
    </Button>
    <Button variant="outline" size="sm" className="h-7 border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
      Sign Up
    </Button>
  </div>
);

export default GuestBanner;
