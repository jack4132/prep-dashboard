import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { PreviewPage } from './pages/PreviewPage'
import { QuestionsPage } from './pages/QuestionsPage'
import { TestFormPage } from './pages/TestFormPage'

function NotFoundPage() {
  return (
    <section className="page-card">
      <h2>Page not found</h2>
      <p className="muted">Route does not exist.</p>
    </section>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* <Route element={<ProtectedRoute />}> */}
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tracking" element={<DashboardPage />} />
          <Route path="/tests/new" element={<TestFormPage />} />
          <Route path="/tests/:testId/edit" element={<TestFormPage />} />
          <Route path="/tests/:testId/questions" element={<QuestionsPage />} />
          <Route path="/tests/:testId/preview" element={<PreviewPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      {/* </Route> */}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
