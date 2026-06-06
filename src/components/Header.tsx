import { auth, loginWithGoogle, logout } from "../firebase";
import { User } from "firebase/auth";
import { Heart, ShieldCheck, LogOut, User as UserIcon } from "lucide-react";
import { motion } from "motion/react";

interface HeaderProps {
  user: User | null;
  loading: boolean;
}

export default function Header({ user, loading }: HeaderProps) {
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      alert("Erreur de connexion : " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      alert("Erreur de déconnexion : " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel py-3 px-4 md:px-8 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo BeSafe */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-600 shadow-md shadow-green-200">
            <ShieldCheck className="w-6 h-6 text-white" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-500 rounded-full"
            >
              <Heart className="w-2.5 h-2.5 text-white fill-white" />
            </motion.div>
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-slate-800 leading-none">
              Be<span className="text-emerald-500">Safe</span>
            </h1>
            <p className="text-[10px] font-sans text-slate-500 font-medium uppercase tracking-wider">
              Health-Tech Coach
            </p>
          </div>
        </motion.div>

        {/* User profile controls */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          ) : user ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 bg-white/70 pl-2 pr-3 py-1.5 rounded-full border border-slate-100 shadow-sm"
            >
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || "Profil"} 
                  className="w-7 h-7 rounded-full border border-emerald-400 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
              <span className="hidden sm:inline text-xs font-semibold text-slate-700 max-w-[124px] truncate">
                {user.displayName || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="p-1 px-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all duration-200"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-sans text-xs font-bold rounded-full shadow-md shadow-green-200 hover:shadow-lg hover:shadow-green-300 transition-all duration-200"
            >
              Se connecter
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
