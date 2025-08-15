import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Game from "@/pages/game";
import Challenges from "@/pages/challenges";
import SkillTree from "@/pages/skill-tree";
import Leaderboard from "@/pages/leaderboard";
import Collections from "@/pages/collections";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Game} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/skill-tree" component={SkillTree} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/collections" component={Collections} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
