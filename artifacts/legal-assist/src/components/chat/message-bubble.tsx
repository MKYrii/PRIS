import { type Message } from "@workspace/api-client-react";
import { FileText, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAI = message.role === "assistant";

  return (
    <div className={cn(
      "flex w-full gap-4 mb-6",
      isAI ? "justify-start" : "justify-end"
    )}>
      {isAI && (
        <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center shadow-md">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      <div className={cn(
        "flex flex-col max-w-[85%] md:max-w-[75%]",
        isAI ? "items-start" : "items-end"
      )}>
        <div className={cn(
          "px-5 py-4 rounded-2xl shadow-sm text-[15px] leading-relaxed",
          isAI 
            ? "bg-white border border-border text-foreground rounded-tl-sm" 
            : "bg-primary text-primary-foreground shadow-primary/25 rounded-tr-sm"
        )}>
          
          {message.fileName && (
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-lg mb-3",
              isAI ? "bg-accent/50 text-accent-foreground" : "bg-black/10 text-primary-foreground"
            )}>
              <div className={cn(
                "p-2 rounded-md",
                isAI ? "bg-white" : "bg-white/20"
              )}>
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium line-clamp-1">{message.fileName}</span>
                <span className="text-xs opacity-70">Документ загружен</span>
              </div>
            </div>
          )}

          {message.content && (
            <div className={cn("prose prose-sm max-w-none", !isAI && "text-primary-foreground prose-p:text-primary-foreground prose-strong:text-primary-foreground")}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        
        <span className="text-[10px] text-muted-foreground mt-1.5 px-1">
          {new Date(message.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {!isAI && (
        <div className="w-10 h-10 shrink-0 rounded-xl bg-accent flex items-center justify-center border border-primary/10">
          <User className="w-5 h-5 text-primary" />
        </div>
      )}
    </div>
  );
}
