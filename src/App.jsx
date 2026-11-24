import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell/AppShell.jsx'
import { LandingPage } from './pages/LandingPage/LandingPage.jsx'
import { TracksPage } from './pages/TracksPage/TracksPage.jsx'
import { DiscoveryPage } from './pages/DiscoveryPage/DiscoveryPage.jsx'
import { DiscoveryResultPage } from './pages/DiscoveryResultPage/DiscoveryResultPage.jsx'
import { RoadmapPage } from './pages/RoadmapPage/RoadmapPage.jsx'
import { StagePage } from './pages/StagePage/StagePage.jsx'
import { QuizPage } from './pages/QuizPage/QuizPage.jsx'
import { DashboardPage } from './pages/DashboardPage/DashboardPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage.jsx'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tracks" element={<TracksPage />} />
        <Route path="/discover" element={<DiscoveryPage />} />
        <Route path="/discover/result" element={<DiscoveryResultPage />} />
        <Route path="/tracks/:trackId" element={<RoadmapPage />} />
        <Route path="/tracks/:trackId/stages/:stageId" element={<StagePage />} />
        <Route path="/tracks/:trackId/stages/:stageId/quiz" element={<QuizPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  )
}
