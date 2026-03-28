import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@workspace/replit-auth-web";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import ChatList from "@/pages/chat-list";
import ChatView from "@/pages/chat-view";
import { Sidebar } from "@/components/layout/sidebar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthenticatedLayout() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>
      <main className="flex-1 h-full relative overflow-hidden bg-white shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)]">
        <Switch>
          <Route path="/" component={ChatList} />
          <Route path="/chats/:chatId">
            {/* Using a key forces remount when chatId changes, clearing old state cleanly */}
            {(params) => <ChatView key={params.chatId} />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-accent rounded-full"></div>
          <div className="w-16 h-16 border-4 border-primary rounded-full border-t-transparent animate-spin absolute inset-0"></div>
        </div>
        <h2 className="text-xl font-display font-medium text-foreground tracking-tight animate-pulse">Запуск ассистента...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <AuthenticatedLayout />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <MainApp />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
