import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BackgroundWrapper from './components/BackgroundWrapper';
import PageTransition from './components/PageTransition';
import Login from './pages/Login';
import StudentDashboard from './pages/student/Dashboard';
import StudentNotes from './pages/student/StudentNotes';
import NoteDetail from './pages/student/NoteDetail';
import StudentHistory from './pages/student/History';
import StudentAI from './pages/student/StudentAI';
import QuizList from './pages/student/QuizList';
import QuizDetail from './pages/student/QuizDetail';
import StudentPersonalNotes from './pages/student/PersonalNotes';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherAddNotes from './pages/teacher/AddNotes';
import TeacherAI from './pages/teacher/TeacherAI';
import PersonalNotes from './pages/teacher/PersonalNotes';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsersList from './pages/admin/UsersList';
import Landing from './pages/Landing';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token) return <Navigate to="/login" replace />;
  if (role !== allowedRole) return <Navigate to="/" replace />;
  
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

function AppContent() {
  const location = useLocation();

  return (
    <BackgroundWrapper>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          
          <Route 
            path="/student" 
            element={
              <PrivateRoute allowedRole="student">
                <PageTransition><StudentDashboard /></PageTransition>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student/notes" 
            element={
              <PrivateRoute allowedRole="student">
                <PageTransition><StudentNotes /></PageTransition>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student/notes/:id" 
            element={
              <PrivateRoute allowedRole="student">
                <PageTransition><NoteDetail /></PageTransition>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student/ai" 
            element={
              <PrivateRoute allowedRole="student">
                <PageTransition><StudentAI /></PageTransition>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student/quizzes" 
            element={
              <PrivateRoute allowedRole="student">
                <PageTransition><QuizList /></PageTransition>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student/quiz/:id" 
            element={
              <PrivateRoute allowedRole="student">
                <PageTransition><QuizDetail /></PageTransition>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student/history" 
            element={
              <PrivateRoute allowedRole="student">
                <PageTransition><StudentHistory /></PageTransition>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student/personal-notes" 
            element={
              <PrivateRoute allowedRole="student">
                <PageTransition><StudentPersonalNotes /></PageTransition>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/teacher" 
            element={
              <PrivateRoute allowedRole="teacher">
                <PageTransition><TeacherDashboard /></PageTransition>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/teacher/add-notes" 
            element={
              <PrivateRoute allowedRole="teacher">
                <PageTransition><TeacherAddNotes /></PageTransition>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/teacher/ai" 
            element={
              <PrivateRoute allowedRole="teacher">
                <PageTransition><TeacherAI /></PageTransition>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/teacher/personal-notes" 
            element={
              <PrivateRoute allowedRole="teacher">
                <PageTransition><PersonalNotes /></PageTransition>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <PrivateRoute allowedRole="admin">
                <PageTransition><AdminDashboard /></PageTransition>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <PrivateRoute allowedRole="admin">
                <PageTransition><AdminUsersList /></PageTransition>
              </PrivateRoute>
            } 
          />

          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </BackgroundWrapper>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
