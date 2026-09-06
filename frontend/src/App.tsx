import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PomodoroPage } from '@/pages/PomodoroPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { BrainMapPage } from '@/pages/BrainMapPage';
import { StudyPlannerPage } from '@/pages/StudyPlannerPage';

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/pomodoro" element={<PomodoroPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/brain-map" element={<BrainMapPage />} />
        <Route path="/study" element={<StudyPlannerPage />} />
      </Route>
    </Routes>
  );
}
