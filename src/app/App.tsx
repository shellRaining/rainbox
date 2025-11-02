import { Toaster } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import MainContent from '@/components/layout/MainContent';
import { useInitializeApp } from '@/hooks/useInitializeApp';

function App() {
  useInitializeApp();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Toaster position="top-right" richColors />
      <Sidebar />
      <MainContent />
    </div>
  );
}

export default App;
