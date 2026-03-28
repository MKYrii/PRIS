import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Plus, MessageSquare, Trash2, Scale, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { 
  useListChats, 
  useCreateChat, 
  useDeleteChat,
  getListChatsQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const { data: chats, isLoading } = useListChats();
  const { mutate: createChat, isPending: isCreating } = useCreateChat({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListChatsQueryKey() });
        setLocation(`/chats/${data.id}`);
      }
    }
  });

  const { mutate: deleteChat } = useDeleteChat({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: getListChatsQueryKey() });
        setIsDeleting(null);
        if (location === `/chats/${variables.chatId}`) {
          setLocation("/");
        }
      },
      onError: () => setIsDeleting(null)
    }
  });

  const handleCreateChat = () => {
    createChat({ data: { title: "Новый чат" } });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(id);
    deleteChat({ chatId: id });
  };

  return (
    <div className="flex flex-col h-full w-72 bg-zinc-50/50 border-r border-border backdrop-blur-xl">
      {/* Header */}
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-none tracking-tight">LegalAssist <span className="text-primary">AI</span></h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Право собственности</p>
          </div>
        </Link>
      </div>

      {/* New Chat Button */}
      <div className="px-4 pb-4">
        <button
          onClick={handleCreateChat}
          disabled={isCreating}
          className="w-full flex items-center gap-2 px-4 py-3 bg-white border border-border rounded-xl text-sm font-medium hover:border-primary/30 hover:bg-accent/50 hover:text-primary transition-all shadow-sm hover:shadow-md disabled:opacity-50"
        >
          {isCreating ? (
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>Новый диалог</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Загрузка...</div>
        ) : chats?.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Нет активных чатов</div>
        ) : (
          <AnimatePresence>
            {chats?.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              >
                <Link
                  href={`/chats/${chat.id}`}
                  className={cn(
                    "group flex items-center justify-between p-3 rounded-xl transition-all relative overflow-hidden",
                    location === `/chats/${chat.id}` 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "hover:bg-zinc-100 text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className={cn(
                      "w-4 h-4 shrink-0",
                      location === `/chats/${chat.id}` ? "text-primary-foreground/80" : "text-muted-foreground"
                    )} />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium truncate">{chat.title}</span>
                      <span className={cn(
                        "text-[10px] truncate",
                        location === `/chats/${chat.id}` ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {format(new Date(chat.createdAt), "d MMM, HH:mm", { locale: ru })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, chat.id)}
                    disabled={isDeleting === chat.id}
                    className={cn(
                      "opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-colors shrink-0",
                      location === `/chats/${chat.id}` 
                        ? "hover:bg-black/10 text-primary-foreground/90" 
                        : "hover:bg-red-50 text-muted-foreground hover:text-destructive"
                    )}
                  >
                    {isDeleting === chat.id ? (
                      <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* User Area */}
      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-border shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">{user?.firstName || "Пользователь"}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email || "Без email"}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-lg transition-colors shrink-0"
            title="Выйти"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
