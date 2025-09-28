import { useState } from "react";
import {
  AnimatedBackground,
  Header,
  HomePage,
  UploadSection,
  RecentsSection,
  DemoSection,
  TeamSection,
} from "./components";
import { AuthModal } from "./components/AuthModal";
import { ToastContainer } from "./components/Toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./index.css";
import "./App.css";

function AppContent() {
  const [activeSection, setActiveSection] = useState<
    "home" | "upload" | "recents" | "demo" | "team"
  >("home");
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: "login" | "signup";
  }>({
    isOpen: false,
    mode: "login",
  });

  const { isAuthenticated, logout } = useAuth();

  const handleNavigate = (
    section: "home" | "upload" | "recents" | "demo" | "team"
  ) => {
    // Redirect to login if trying to access protected sections while not authenticated
    if (
      !isAuthenticated &&
      (section === "recents" || section === "upload" || section === "team")
    ) {
      setAuthModal({ isOpen: true, mode: "login" });
      return;
    }
    setActiveSection(section);
  };

  const openAuth = (mode: "login" | "signup") => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuth = () => {
    setAuthModal({ isOpen: false, mode: "login" });
  };

  const switchAuthMode = (mode: "login" | "signup") => {
    setAuthModal((prev) => ({ ...prev, mode }));
  };

  return (
    <div className="min-h-screen w-full relative max-w-screen overflow-x-hidden">
      <AnimatedBackground />

      <Header
        onNavigate={handleNavigate}
        activeSection={activeSection}
        onLogin={() => openAuth("login")}
        onSignUp={() => openAuth("signup")}
        onLogout={logout}
        isAuthenticated={isAuthenticated}
      />

      <main className="relative z-10 w-full">
        {activeSection === "home" && <HomePage onNavigate={handleNavigate} />}

        {activeSection === "demo" && (
          <DemoSection onNavigate={handleNavigate} />
        )}

        {activeSection === "upload" && isAuthenticated && <UploadSection />}

        {activeSection === "recents" && isAuthenticated && <RecentsSection />}

        {activeSection === "team" && isAuthenticated && <TeamSection />}
      </main>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuth}
        mode={authModal.mode}
        onModeChange={switchAuthMode}
      />

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
