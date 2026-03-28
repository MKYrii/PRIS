import { useAuth } from "@workspace/replit-auth-web";
import { Scale, ArrowRight, ShieldCheck, FileCheck, Building2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex w-full bg-white selection:bg-primary/20">
      
      {/* Left side - Visual/Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-50 border-r border-border overflow-hidden">
        <img 
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
          alt="Abstract legal background" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/90" />
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <div>
            <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 mb-8">
              <Scale className="w-6 h-6" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight">
              Ваш личный <br/>
              <span className="text-primary">юридический</span> ассистент
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md">
              Мгновенный анализ документов и консультации по вопросам права собственности и сделок.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Сделки с недвижимостью</h3>
                <p className="text-xs text-muted-foreground">Договоры, проверка чистоты</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Анализ документов</h3>
                <p className="text-xs text-muted-foreground">PDF и Word файлы</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
              <Scale className="w-8 h-8" />
            </div>
          </div>

          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">Вход в систему</h2>
            <p className="text-muted-foreground mt-3">
              Авторизуйтесь, чтобы продолжить работу с вашими документами и чатами.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-border shadow-xl shadow-black/[0.03]">
            <div className="flex items-center justify-center mb-8">
              <ShieldCheck className="w-12 h-12 text-primary/20" />
            </div>
            
            <button
              onClick={login}
              className="w-full group flex items-center justify-center gap-3 px-6 py-4 bg-foreground text-background rounded-2xl font-medium text-lg hover:bg-primary hover:text-white transition-all duration-300 shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
            >
              <span>Войти через Replit</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-center text-xs text-muted-foreground mt-6">
              Используя сервис, вы соглашаетесь с условиями обработки персональных данных.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
