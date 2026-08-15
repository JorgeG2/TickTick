import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { PomodoroWidget } from '../widgets/PomodoroWidget';
import { AmbientAudioPlayer } from '../widgets/AmbientAudioPlayer';
import { api, type CategoryDto } from '@/lib/api';

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
    api.getUser().then((u) => setStreak(u.currentStreak)).catch(console.error);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar streak={streak} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet context={{ selectedCategory }} />
        </main>
      </div>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
        <PomodoroWidget />
        <AmbientAudioPlayer />
      </div>
    </div>
  );
}
