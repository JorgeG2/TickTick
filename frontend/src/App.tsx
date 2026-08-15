import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { StudyPlannerPage } from '@/pages/StudyPlannerPage';
import { HealthPage } from '@/pages/HealthPage';

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/study" element={<StudyPlannerPage />} />
        <Route path="/health" element={<HealthPage />} />
      </Route>
    </Routes>
  );
}
