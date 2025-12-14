import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Desktop } from "@/pages/Desktop";
import { TeacherDashboard } from "@/pages/TeacherDashboard";
import { StudentPage } from "@/pages/StudentPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Desktop} />
      <Route path="/teacher" component={TeacherDashboard} />
      <Route path="/student" component={StudentPage} />
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
