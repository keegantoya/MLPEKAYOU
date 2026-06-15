import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import ScrollToTop from "@/components/ScrollToTop";
import KayouHeader from "@/components/KayouHeader";

import Forum from "@/pages/Forum";
import Index from "./pages/Index";
import Collections from "./pages/Collections";
import Collection from "@/pages/Collection";
import MyProgress from "./pages/MyProgress";
import MyISO from "./pages/MyISO";
import Community from "./pages/Community";
import CommunitySet from "./pages/CommunitySet";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import Moon3 from "./pages/Moon3";
import Star1 from "./pages/Star1";
import RainbowTwo from "./pages/RainbowTwo";
import FantasyWonderland from "./pages/Fantasy-Wonderland";
import FunMoments2 from "./pages/FunMoments2";
import FunMoments1 from "./pages/FunMoments1";
import Promos from "./pages/promos";
import TCGPromos from "./pages/tcgpromos";
import FriendshipsBegin from "./pages/friendshipsbegin";
import Selling from "@/pages/selling";
import LimitedCards from "@/pages/limited-cards";
import PasswordReset from "./pages/password-reset";
import AccountConfirmation from "./pages/accountconfirmation";
import TradingPost from "./pages/trading-post";
import TradingPostInner from "./pages/trading-post-inner";
import MyTrades from "@/pages/MyTrades";
import MyTradesSets from "@/pages/MyTradesSets";
import MyTradesView from "@/pages/MyTradesView";
import FunMoments3 from "./pages/FunMoments3";
import RequireAuth from "./components/RequireAuth";
import FAQ from "@/pages/FAQ";
import MyProgressTCG from "./pages/MyProgressTCG";
import OtherKayouMerch from "./pages/Other-Kayou-Merch";
import UserMenu from "@/pages/UserMenu";
import Wishlist from "./pages/Wishlist";
import LinksPage from "./pages/linkspage";


const queryClient = new QueryClient();

const AppRoutes = () => {

  useEffect(() => {
  let lastUserId: string | null = null;

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    const currentUserId = session?.user?.id ?? null;

    if (currentUserId !== lastUserId) {
      lastUserId = currentUserId;
    }
  });

  const handleRightClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    if (target.tagName === "IMG") {
      e.preventDefault();
    }
  };

  const preventDrag = (e: DragEvent) => e.preventDefault();

  document.addEventListener("contextmenu", handleRightClick);
  document.addEventListener("dragstart", preventDrag);

  return () => {
    subscription.unsubscribe();
    document.removeEventListener("contextmenu", handleRightClick);
    document.removeEventListener("dragstart", preventDrag);
  };
}, []);
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/collections" element={<Collections />} />
      <Route path="/collection/:id" element={<Collection />} />
      <Route path="/forum" element={<Forum />} />
<Route path="/eternal-moon-one" element={<Collection />} />
<Route path="/eternal-moon-two" element={<Collection />} />
<Route path="/rainbow-one" element={<Collection />} />
<Route path="/promotional-cards" element={<Promos />} />
      <Route
  path="/my-progress"
  element={
    <RequireAuth>
      <MyProgress />
    </RequireAuth>
  }
/>
<Route
  path="/my-iso"
  element={
    <RequireAuth>
      <MyISO />
    </RequireAuth>
  }
/>
<Route
  path="/Wishlist"
  element={
    <RequireAuth>
      <Wishlist />
    </RequireAuth>
  }
/>
<Route
  path="/inventory"
  element={
    <RequireAuth>
      <MyTrades />
    </RequireAuth>
  }
/>

      <Route path="/community" element={<Community />} />
      <Route path="/community/:id" element={<CommunitySet />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
<Route path="/eternal-moon-three" element={<Moon3 />} />
      <Route path="/star-one" element={<Star1 />} />
      <Route path="/rainbow-two" element={<RainbowTwo />} />
      <Route path="/fantasy-wonderland" element={<FantasyWonderland />} />
      <Route path="/fun-moments-2" element={<FunMoments2 />} />
<Route path="/fun-moments-two" element={<FunMoments2 />} />
      <Route path="/fun-moments-1" element={<FunMoments1 />} />
<Route path="/fun-moments-one" element={<FunMoments1 />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/promos" element={<Promos />} />
<Route path="/promotional-cards" element={<Promos />} />
      <Route path="/tcgpromos" element={<TCGPromos />} />
<Route path="/tcg-promos" element={<TCGPromos />} />
      <Route path="/friendshipsbegin" element={<FriendshipsBegin />} />
<Route path="/friendships-begin" element={<FriendshipsBegin />} />
      <Route path="/selling" element={<Selling />} />
      <Route path="/limited-cards" element={<LimitedCards />} />
      <Route path="/trading-post" element={<TradingPost />} />
      <Route path="/trading-post/:setId" element={<TradingPostInner />} />
      <Route path="/inventory/:setId" element={<MyTradesSets />} />
      <Route path="/other-kayou-merch" element={<OtherKayouMerch />} />
      <Route path="/faq" element={<FAQ />} />
      <Route
  path="/UserMenu"
  element={
    <RequireAuth>
      <UserMenu />
    </RequireAuth>
  }
/>

<Route
  path="/profile-mobile"
  element={
    <RequireAuth>
      <UserMenu />
    </RequireAuth>
  }
/>
      <Route
  path="/progress-tcg"
  element={
    <RequireAuth>
      <MyProgressTCG />
    </RequireAuth>
  }
/>
     <Route
  path="/my-trades/view/:setId"
  element={
    <RequireAuth>
      <MyTradesView />
    </RequireAuth>
  }
/>
      <Route path="/fun-moments-3" element={<FunMoments3 />} />
<Route path="/fun-moments-three" element={<FunMoments3 />} />
      <Route path="/account-confirmation" element={<AccountConfirmation />} />
      <Route path="/links" element={<LinksPage />} />
      <Route path="*" element={<NotFound />} />
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

<ScrollToTop />

{window.location.pathname !== "/links" && <KayouHeader />}

<div
  className={
    window.location.pathname === "/links"
      ? "min-h-screen"
      : `min-h-screen sm:pt-[64px] sm:pb-0 ${
          window.matchMedia('(display-mode: standalone)').matches
            ? 'pt-[88px]'
            : 'pt-[52px]'
        }`
  }
>
  <AppRoutes />
</div>

</BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};


export default App;