import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white-50 py-5 mt-auto border-top border-secondary border-opacity-25">
      <div className="container">
        <div className="row g-4">
          {/* Brand Col */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center mb-3">
              <span className="bg-primary text-white rounded-3 px-2 py-1 fs-5 me-2">
                <i className="bi bi-mortarboard-fill"></i>
              </span>
              <h5 className="fw-bold text-white mb-0">Quiz<span className="text-primary">Master</span></h5>
            </div>
            <p className="small text-muted mb-3">
              An enterprise-grade, full-stack Online Quiz & Assessment System built with React, Python Flask, and MySQL. Featuring server-side evaluation, anti-cheat security, interactive analytics, and an integrated AI study assistant.
            </p>
            <div className="d-flex gap-3 fs-5 text-white-50">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white-50 hover-primary" aria-label="GitHub Repository">
                <i className="bi bi-github"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white-50 hover-primary" aria-label="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="mailto:support@quizmaster.edu" className="text-white-50 hover-primary" aria-label="Email Support">
                <i className="bi bi-envelope-at"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white fw-bold text-uppercase small mb-3">Platform</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li><Link to="/" className="text-white-50 text-decoration-none hover-white">Home</Link></li>
              <li><Link to="/student/quizzes" className="text-white-50 text-decoration-none hover-white">All Quizzes</Link></li>
              <li><Link to="/student/leaderboard" className="text-white-50 text-decoration-none hover-white">Leaderboard</Link></li>
              <li><Link to="/student/chatbot" className="text-white-50 text-decoration-none hover-white">AI Assistant</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white fw-bold text-uppercase small mb-3">Resources</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li><Link to="/about" className="text-white-50 text-decoration-none hover-white">About System</Link></li>
              <li><Link to="/contact" className="text-white-50 text-decoration-none hover-white">Help & Support</Link></li>
              <li><Link to="/login" className="text-white-50 text-decoration-none hover-white">Sign In</Link></li>
              <li><Link to="/register" className="text-white-50 text-decoration-none hover-white">Register</Link></li>
            </ul>
          </div>

          {/* Technology Stack */}
          <div className="col-lg-4 col-md-6">
            <h6 className="text-white fw-bold text-uppercase small mb-3">Architecture Stack</h6>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge bg-secondary bg-opacity-25 text-white border border-secondary border-opacity-50 px-2.5 py-1.5">React 18</span>
              <span className="badge bg-secondary bg-opacity-25 text-white border border-secondary border-opacity-50 px-2.5 py-1.5">Vite</span>
              <span className="badge bg-secondary bg-opacity-25 text-white border border-secondary border-opacity-50 px-2.5 py-1.5">Python Flask</span>
              <span className="badge bg-secondary bg-opacity-25 text-white border border-secondary border-opacity-50 px-2.5 py-1.5">MySQL 8.0</span>
              <span className="badge bg-secondary bg-opacity-25 text-white border border-secondary border-opacity-50 px-2.5 py-1.5">Bootstrap 5</span>
              <span className="badge bg-secondary bg-opacity-25 text-white border border-secondary border-opacity-50 px-2.5 py-1.5">Chart.js</span>
              <span className="badge bg-secondary bg-opacity-25 text-white border border-secondary border-opacity-50 px-2.5 py-1.5">Google Gemini AI</span>
            </div>
          </div>
        </div>

        <hr className="my-4 border-secondary border-opacity-25" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-muted">
          <div>&copy; {new Date().getFullYear()} QuizMaster Online Quiz Platform. All rights reserved.</div>
          <div className="d-flex gap-3 mt-2 mt-md-0">
            <span>Production-Grade Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
