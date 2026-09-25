import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import StudentRoute from './components/StudentRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import QuizManagement from './pages/admin/QuizManagement';
import AddQuiz from './pages/admin/AddQuiz';
import EditQuiz from './pages/admin/EditQuiz';
import QuestionManagement from './pages/admin/QuestionManagement';
import AddQuestion from './pages/admin/AddQuestion';
import EditQuestion from './pages/admin/EditQuestion';
import UserManagement from './pages/admin/UserManagement';
import Reports from './pages/admin/Reports';
import AdminProfile from './pages/admin/AdminProfile';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import AvailableQuizzes from './pages/student/AvailableQuizzes';
import QuizInstructions from './pages/student/QuizInstructions';
import TakeQuiz from './pages/student/TakeQuiz';
import QuizResult from './pages/student/QuizResult';
import ReviewAnswers from './pages/student/ReviewAnswers';
import QuizHistory from './pages/student/QuizHistory';
import Leaderboard from './pages/student/Leaderboard';
import StudentProfile from './pages/student/StudentProfile';
import Chatbot from './pages/student/Chatbot';

// 404 Not Found Page Component
const NotFound = () => (
  <div className="container py-5 text-center my-auto">
    <div className="display-1 fw-bold text-primary mb-3">404</div>
    <h3 className="fw-bold text-dark mb-2">Page Not Found</h3>
    <p className="text-muted mb-4">The page or assessment route you are looking for does not exist.</p>
    <Link to="/" className="btn btn-primary rounded-pill px-4 py-2">
      <i className="bi bi-house me-2"></i> Return Home
    </Link>
  </div>
);

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1 d-flex flex-column">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/quizzes"
            element={
              <AdminRoute>
                <QuizManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/quizzes/add"
            element={
              <AdminRoute>
                <AddQuiz />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/quizzes/edit/:id"
            element={
              <AdminRoute>
                <EditQuiz />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/quizzes/:id/questions"
            element={
              <AdminRoute>
                <QuestionManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/questions/add"
            element={
              <AdminRoute>
                <AddQuestion />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/questions/edit/:id"
            element={
              <AdminRoute>
                <EditQuestion />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <Reports />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <AdminRoute>
                <AdminProfile />
              </AdminRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <StudentRoute>
                <StudentDashboard />
              </StudentRoute>
            }
          />
          <Route
            path="/student/quizzes"
            element={
              <StudentRoute>
                <AvailableQuizzes />
              </StudentRoute>
            }
          />
          <Route
            path="/student/quizzes/:id/instructions"
            element={
              <StudentRoute>
                <QuizInstructions />
              </StudentRoute>
            }
          />
          <Route
            path="/student/quizzes/:id/start"
            element={
              <StudentRoute>
                <TakeQuiz />
              </StudentRoute>
            }
          />
          <Route
            path="/student/result/:attemptId"
            element={
              <StudentRoute>
                <QuizResult />
              </StudentRoute>
            }
          />
          <Route
            path="/student/review/:attemptId"
            element={
              <StudentRoute>
                <ReviewAnswers />
              </StudentRoute>
            }
          />
          <Route
            path="/student/history"
            element={
              <StudentRoute>
                <QuizHistory />
              </StudentRoute>
            }
          />
          <Route
            path="/student/leaderboard"
            element={
              <StudentRoute>
                <Leaderboard />
              </StudentRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <StudentRoute>
                <StudentProfile />
              </StudentRoute>
            }
          />
          <Route
            path="/student/chatbot"
            element={
              <StudentRoute>
                <Chatbot />
              </StudentRoute>
            }
          />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
