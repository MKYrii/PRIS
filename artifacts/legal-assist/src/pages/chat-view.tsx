import { useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetChat, 
  useSendMessage, 
  useUploadDocument,
  getGetChatQueryKey
} from "@workspace/api-client-react";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { Scale, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatView() {
  const { chatId } = useParams<{ chatId: string }>();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: chatData, isLoading, isError } = useGetChat(chatId, {
    query: {
      refetchInterval: false,
    }
  });

  const invalidateChat = () => {
    queryClient.invalidateQueries({ queryKey: getGetChatQueryKey(chatId) });
  };

  const { mutate: sendText, isPending: isSendingText } = useSendMessage({
    mutation: { onSuccess: invalidateChat }
  });

  const { mutate: sendFile, isPending: isUploading } = useUploadDocument({
    mutation: { onSuccess: invalidateChat }
  });

  const isPending = isSendingText || isUploading;

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatData?.messages, isPending]);

  const handleSendText = (text: string) => {
    sendText({ chatId, data: { content: text } });
  };

  const handleSendFile = (file: File) => {
    sendFile({ chatId, data: { file } });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4 opacity-50">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-medium">Загрузка диалога...</p>
        </div>
      </div>
    );
  }

  if (isError || !chatData) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-destructive font-medium">Ошибка загрузки чата.</p>
          <p className="text-sm text-muted-foreground mt-2">Возможно, он был удален.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Top Bar for Mobile (Optional extension later, right now minimal border) */}
      <div className="md:hidden flex items-center p-4 border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <h2 className="font-semibold text-sm truncate">{chatData.title}</h2>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 md:px-12 lg:px-24 custom-scrollbar scroll-smooth"
      >
        <div className="max-w-4xl mx-auto w-full">
          {chatData.messages.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-70">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6">
                <Scale className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-medium text-foreground mb-2">Начните диалог</h3>
              <p className="text-muted-foreground max-w-md">
                Опишите вашу ситуацию или прикрепите документ (договор, свидетельство) для анализа.
              </p>
            </div>
          ) : (
            chatData.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}

          {/* Typing indicator */}
          {isPending && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center">
                <Scale className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="bg-white border border-border px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center h-[52px]">
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 py-6 md:px-12 lg:px-24 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-4xl mx-auto w-full">
          <ChatInput 
            onSendText={handleSendText} 
            onSendFile={handleSendFile}
            isPending={isPending} 
          />
        </div>
      </div>
    </div>
  );
}
