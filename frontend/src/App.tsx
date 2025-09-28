import { useState } from 'react';

import { AnimatedBackground, Header, HomePage, UploadSection, RecentsSection, DemoSection, TeamSection, AuthDialog } from "./components";
import './index.css';
import './App.css';

interface Deadline {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  source: string;
  status: 'pending' | 'completed' | 'deleted';
}

export default function App() {
  const [activeSection, setActiveSection] = useState<'home' | 'upload' | 'recents' | 'demo' | 'team'>('home');
  const [authDialog, setAuthDialog] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'login'
  });
  
  const [deadlines, setDeadlines] = useState<Deadline[]>([
    // Sample data for demonstration
    {
      id: 1,
      title: "Math Assignment Due",
      description: "Complete chapters 5-7 exercises and submit online",
      date: "2024-10-12",
      time: "11:59 PM",
      priority: "high",
      source: "syllabus.pdf",
      status: "pending"
    },
    {
      id: 2,
      title: "Project Presentation",
      description: "Present final project to the class",
      date: "2024-10-18",
      time: "2:00 PM",
      priority: "medium",
      source: "schedule.jpg",
      status: "pending"
    },
    {
      id: 3,
      title: "Lab Report Submission",
      description: "Submit completed lab report for chemistry",
      date: "2024-10-20",
      time: "5:00 PM",
      priority: "low",
      source: "lab_instructions.pdf",
      status: "completed"
    }
  ]);

  const handleUploadComplete = (newDeadlines: Deadline[]) => {
    setDeadlines(prev => [...prev, ...newDeadlines]);
    setActiveSection('recents');
  };

  const handleUpdateDeadlines = (updatedDeadlines: Deadline[]) => {
    setDeadlines(updatedDeadlines);
  };

  const handleNavigate = (section: 'home' | 'upload' | 'recents' | 'demo' | 'team') => {
    setActiveSection(section);
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthDialog({ isOpen: true, mode });
  };

  const closeAuth = () => {
    setAuthDialog({ isOpen: false, mode: 'login' });
  };

  const switchAuthMode = () => {
    setAuthDialog(prev => ({
      ...prev,
      mode: prev.mode === 'login' ? 'signup' : 'login'
    }));
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <Header 
        onNavigate={handleNavigate}
        activeSection={activeSection}
        onLogin={() => openAuth('login')}
        onSignUp={() => openAuth('signup')}
      />
      
      <main className="relative z-10">
        {activeSection === 'home' && (
          <HomePage onNavigate={handleNavigate} />
        )}
        
        {activeSection === 'demo' && (
          <DemoSection onNavigate={handleNavigate} />
        )}
        
        {activeSection === 'upload' && (
          <UploadSection onUploadComplete={handleUploadComplete} />
        )}
        
        {activeSection === 'recents' && (
          <RecentsSection 
            deadlines={deadlines}
            onUpdateDeadlines={handleUpdateDeadlines}
          />
        )}
        
        {activeSection === 'team' && (
          <TeamSection />
        )}
      </main>

      <AuthDialog
        isOpen={authDialog.isOpen}
        onClose={closeAuth}
        mode={authDialog.mode}
        onSwitchMode={switchAuthMode}
      />
    </div>
  );
}
