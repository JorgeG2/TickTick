import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PomodoroPage } from '@/pages/PomodoroPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { StudyPlannerPage } from '@/pages/StudyPlannerPage';

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/pomodoro" element={<PomodoroPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/study" element={<StudyPlannerPage />} />
      </Route>
    </Routes>
  );
}
