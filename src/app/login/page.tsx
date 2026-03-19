"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Box, Lock, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function LoginPage() {
  const { t } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDefaultLoginActive, setIsDefaultLoginActive] = useState(false);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => setIsDefaultLoginActive(data.isDefaultLoginActive))
      .catch(console.error);
  }, []);

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        toast.success(t.login.success);
        window.location.href = "/";
      } else {
        const data = await res.json();
        toast.error(
          data.error || t.login.fail,
        );
      }
    } catch (error) {
      toast.error(t.login.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-zinc-950">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-slate-900" />
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vh] rounded-full bg-blue-500/20 dark:bg-blue-600/15 blur-[120px] z-0 animate-pulse duration-[10000ms]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vh] rounded-full bg-purple-500/20 dark:bg-purple-600/15 blur-[120px] z-0 animate-pulse duration-[12000ms]" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/40 dark:bg-zinc-950/60 backdrop-blur-2xl border border-white/40 dark:border-zinc-800/50 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Box className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {t.login.title}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {t.login.subtitle}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2 relative">
              <Label
                htmlFor="username"
                className="text-zinc-700 dark:text-zinc-300 ml-1"
              >
                {t.login.username}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="pl-10 bg-white/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-800/50 h-11 focus-visible:ring-blue-500"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2 relative">
              <Label
                htmlFor="password"
                className="text-zinc-700 dark:text-zinc-300 ml-1"
              >
                {t.login.password}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-white/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-800/50 h-11 focus-visible:ring-blue-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all hover:shadow-blue-500/25"
              disabled={loading}
            >
              {loading ? t.common.loading : t.login.button}
            </Button>
          </form>
        </div>

        {isDefaultLoginActive && (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-500 mt-6 bg-white/20 dark:bg-black/20 backdrop-blur-sm py-2 px-4 rounded-full mx-auto w-fit">
            {t.login.defaultText} <strong>admin</strong> /{" "}
            <strong>admin</strong>
          </p>
        )}
      </div>
    </div>
  );
}
