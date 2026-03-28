import { Scale, ArrowRight } from "lucide-react";
import { useCreateChat } from "@workspace/api-client-react";
import { useLocation } from "wouter";

export default function ChatList() {
  const [, setLocation] = useLocation();
  const { mutate: createChat, isPending } = useCreateChat({
    mutation: {
      onSuccess: (data) => setLocation(`/chats/${data.id}`)
    }
  });

  const examples = [
    "Как оформить договор купли-продажи квартиры?",
    "Какие документы нужны для регистрации ИП?",
    "Как переоформить автомобиль при покупке с рук?"
  ];

  const handleExampleClick = (title: string) => {
    // We create a chat with this title, then the user can send the text.
    // In a real app, we might create a chat AND send the initial message at once,
    // but based on the API we just create a chat for now.
    createChat({ data: { title: "Новый вопрос" } });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white p-8">
      <div className="max-w-2xl w-full text-center">
        <div className="inline-flex items-center justify-center p-4 bg-accent/50 rounded-3xl mb-8">
          <Scale className="w-12 h-12 text-primary" />
        </div>
        
        <h1 className="text-4xl font-display font-bold text-foreground mb-4">
          LegalAssist <span className="text-primary">AI</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-12">
          Ваш эксперт в области права собственности, сделок с жильём, транспортом и коммерческой деятельности.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {examples.map((ex, i) => (
            <button
              key={i}
              disabled={isPending}
              onClick={() => handleExampleClick(ex)}
              className="p-5 rounded-2xl border border-border bg-white shadow-sm hover:border-primary/40 hover:shadow-md hover:-translate-y-1 transition-all group disabled:opacity-50 text-left flex flex-col justify-between min-h-[140px]"
            >
              <p className="text-sm font-medium text-foreground leading-relaxed">{ex}</p>
              <div className="mt-4 flex justify-end">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
