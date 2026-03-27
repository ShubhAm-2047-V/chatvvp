import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BackgroundWrapper from './components/BackgroundWrapper';
import Login from './pages/Login';
import StudentDashboard from './pages/student/Dashboard';
import StudentNotes from './pages/student/StudentNotes';
import NoteDetail from './pages/student/NoteDetail';
import StudentHistory from './pages/student/History';
import StudentAI from './pages/student/StudentAI';
import QuizList from './pages/student/QuizList';
import QuizDetail from './pages/student/QuizDetail';
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

function App() {
  return (
    <Router>
      <BackgroundWrapper>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/student" 
            element={
              <PrivateRoute allowedRole="student">
                <StudentDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student/notes" 
            element={
              <PrivateRoute allowedRole="student">
                <StudentNotes />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student/notes/:id" 
            element={
              <PrivateRoute allowedRole="student">
                <NoteDetail />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student/ai" 
            element={
              <PrivateRoute allowedRole="student">
                <StudentAI />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student/quizzes" 
            element={
              <PrivateRoute allowedRole="student">
                <QuizList />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student/quiz/:id" 
            element={
              <PrivateRoute allowedRole="student">
                <QuizDetail />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/student/history" 
            element={
              <PrivateRoute allowedRole="student">
                <StudentHistory />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/teacher" 
            element={
              <PrivateRoute allowedRole="teacher">
                <TeacherDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/teacher/add-notes" 
            element={
              <PrivateRoute allowedRole="teacher">
                <TeacherAddNotes />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/teacher/ai" 
            element={
              <PrivateRoute allowedRole="teacher">
                <TeacherAI />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/teacher/personal-notes" 
            element={
              <PrivateRoute allowedRole="teacher">
                <PersonalNotes />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <PrivateRoute allowedRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <PrivateRoute allowedRole="admin">
                <AdminUsersList />
              </PrivateRoute>
            } 
          />

          <Route path="/" element={<Landing />} />
        </Routes>
      </BackgroundWrapper>
    </Router>
  );
}

export default App;
