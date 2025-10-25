import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateClassPage from './pages/CreateClassPage';
import InviteStudentsPage from './pages/InviteStudentsPage';
import CreateHomeworkPage from './pages/CreateHomeworkPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-class"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <CreateClassPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invite-students/:classId"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <InviteStudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-homework/:classId"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <CreateHomeworkPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
