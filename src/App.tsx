import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";

import Profile from "./pages/Profile";
import Index from "./pages/Index";
import Collections from "./pages/Collections";
import Collection from "./pages/Collection";
import MyProgress from "./pages/MyProgress";
import MyISO from "./pages/MyISO";
import Community from "./pages/Community";
import CommunitySet from "./pages/CommunitySet";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import Moon3 from "./pages/Moon3";
import Star1 from "./pages/Star1";
import Rainbow2 from "./pages/Rainbow2";
import FantasyWonderland from "./pages/Fantasy-Wonderland";
import FunMoments2 from "./pages/FunMoments2";
import FunMoments1 from "./pages/FunMoments1";
import Promos from "./pages/promos";
import FriendshipBegins from "./pages/friendship-begins";
import Selling from "@/pages/selling";
import LimitedCards from "@/pages/limited-cards";
import PasswordReset from "./pages/password-reset";
import AccountConfirmation from "./pages/accountconfirmation";
import TradingPost from "./pages/trading-post";
import TradingPostInner from "./pages/trading-post-inner";
import MyTrades from "@/pages/MyTrades";
import MyTradesSets from "@/pages/MyTradesSets";
import AboutMe from "@/pages/AboutMe";
import MyTradesView from "@/pages/MyTradesView";
import FunMoments3 from "./pages/FunMoments3";
import PublicISO from "@/pages/PublicISO";
import PublicISOSet from "@/pages/PublicISOSet";

const queryClient = new QueryClient();

const AppRoutes = () => {

  useEffect(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      console.log("Auth changed:", session.user);
    }
  });

  return () => subscription.unsubscribe();
}, []);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/collections" element={<Collections />} />
      <Route path="/collection/:id" element={<Collection />} />
      <Route path="/my-progress" element={<MyProgress />} />
      <Route path="/my-iso" element={<MyISO />} />
      <Route path="/my-trades" element={<MyTrades />} />
      <Route path="/community" element={<Community />} />
      <Route path="/community/:id" element={<CommunitySet />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/moon3" element={<Moon3 />} />
      <Route path="/star1" element={<Star1 />} />
      <Route path="/rainbow2" element={<Rainbow2 />} />
      <Route path="/fantasy-wonderland" element={<FantasyWonderland />} />
      <Route path="/fun-moments-2" element={<FunMoments2 />} />
      <Route path="/fun-moments-1" element={<FunMoments1 />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/promos" element={<Promos />} />
      <Route path="/friendship-begins" element={<FriendshipBegins />} />
      <Route path="/selling" element={<Selling />} />
      <Route path="/limited-cards" element={<LimitedCards />} />
      <Route path="/trading-post" element={<TradingPost />} />
      <Route path="/trading-post/:setId" element={<TradingPostInner />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/my-trades/:setId" element={<MyTradesSets />} />
      <Route path="/about" element={<AboutMe />} />
      <Route path="/my-trades/view/:setId" element={<MyTradesView />} />
      <Route path="/fun-moments-3" element={<FunMoments3 />} />
      <Route path="/public-iso" element={<PublicISO />} />
      <Route path="/public-iso/:setId" element={<PublicISOSet />} />
      <Route path="/account-confirmation" element={<AccountConfirmation />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};


export default App;