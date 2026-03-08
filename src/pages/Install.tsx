import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Share, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Detect iOS
    const ua = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg">
            <img src="/pwa-192x192.png" alt="LODR" className="w-full h-full object-cover" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Install LODR</h1>
          <p className="text-muted-foreground mb-8">
            Add LODR to your home screen for a faster, app-like experience
          </p>

          {isInstalled ? (
            <div className="p-6 rounded-xl bg-success/10 border border-success/20">
              <Smartphone className="w-10 h-10 text-success mx-auto mb-3" />
              <p className="font-semibold text-foreground">Already installed!</p>
              <p className="text-sm text-muted-foreground mt-1">LODR is on your home screen</p>
              <Button variant="accent" className="mt-4" onClick={() => navigate("/")}>
                Open App
              </Button>
            </div>
          ) : isIOS ? (
            <div className="p-6 rounded-xl bg-card border border-border text-left space-y-4">
              <p className="font-semibold text-foreground text-center">Install on iPhone / iPad</p>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">1</div>
                <p className="text-sm text-muted-foreground pt-1">
                  Tap the <Share className="w-4 h-4 inline text-primary" /> <strong>Share</strong> button in Safari
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">2</div>
                <p className="text-sm text-muted-foreground pt-1">
                  Scroll down and tap <strong>"Add to Home Screen"</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">3</div>
                <p className="text-sm text-muted-foreground pt-1">
                  Tap <strong>"Add"</strong> to install
                </p>
              </div>
            </div>
          ) : deferredPrompt ? (
            <Button variant="accent" size="xl" className="w-full" onClick={handleInstall}>
              <Download className="w-5 h-5 mr-2" />
              Install LODR
            </Button>
          ) : (
            <div className="p-6 rounded-xl bg-card border border-border">
              <p className="text-sm text-muted-foreground">
                Open this page in Chrome or Safari on your phone to install LODR
              </p>
            </div>
          )}

          <button
            onClick={() => navigate("/")}
            className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Continue in browser instead
          </button>
        </div>
      </main>
    </div>
  );
};

export default Install;
