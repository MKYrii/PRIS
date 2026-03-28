import { useState, useRef, useEffect } from "react";
import { Paperclip, ArrowUp, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendText: (text: string) => void;
  onSendFile: (file: File) => void;
  isPending: boolean;
}

export function ChatInput({ onSendText, onSendFile, isPending }: ChatInputProps) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isPending) return;

    if (selectedFile) {
      onSendFile(selectedFile);
      setSelectedFile(null);
      setText(""); // usually file upload comes with a prompt, but we handle separately here
    } else if (text.trim()) {
      onSendText(text.trim());
      setText("");
    }
    
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="relative">
      {/* Attached file preview */}
      {selectedFile && (
        <div className="absolute bottom-full left-0 mb-3 bg-white border border-border p-3 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="p-2 bg-accent text-primary rounded-lg">
            <Paperclip className="w-4 h-4" />
          </div>
          <div className="flex flex-col max-w-[200px]">
            <span className="text-sm font-medium truncate">{selectedFile.name}</span>
            <span className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <button 
            onClick={() => setSelectedFile(null)}
            className="ml-2 p-1 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form 
        onSubmit={handleSubmit}
        className={cn(
          "bg-white border rounded-2xl shadow-sm transition-colors focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 flex items-end p-2",
          isPending ? "opacity-70 border-border" : "border-border"
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf,.doc,.docx" 
          onChange={handleFileChange}
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending || selectedFile !== null}
          className="p-3 text-muted-foreground hover:text-primary hover:bg-accent rounded-xl transition-colors disabled:opacity-50 shrink-0"
          title="Прикрепить документ (PDF, Word)"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Опишите вашу юридическую ситуацию..."
          disabled={isPending || selectedFile !== null}
          className="flex-1 max-h-[200px] min-h-[44px] bg-transparent border-0 focus:ring-0 resize-none py-3 px-2 text-[15px] outline-none disabled:opacity-50"
          rows={1}
        />

        <button
          type="submit"
          disabled={(!text.trim() && !selectedFile) || isPending}
          className={cn(
            "p-3 rounded-xl transition-all shrink-0 ml-2",
            (text.trim() || selectedFile) && !isPending
              ? "bg-primary text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
              : "bg-zinc-100 text-zinc-400"
          )}
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ArrowUp className="w-5 h-5" />
          )}
        </button>
      </form>
      <div className="text-center mt-2">
        <p className="text-[11px] text-muted-foreground">LegalAssist AI может допускать ошибки. Проверяйте важную информацию.</p>
      </div>
    </div>
  );
}
