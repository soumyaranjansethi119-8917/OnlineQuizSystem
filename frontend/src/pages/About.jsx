import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center max-w-700 mx-auto mb-5">
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1.5 fw-semibold mb-2">
          Architecture & System Design
        </span>
        <h1 className="fw-bold text-dark">About QuizMaster Online Quiz System</h1>
        <p className="lead text-muted fs-6">
          A full-stack, enterprise-grade educational testing platform engineered with modern React, Python Flask, and MySQL.
        </p>
      </div>

      {/* Tech Stack Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm rounded-4 p-4">
            <div className="text-primary mb-3 fs-2"><i className="bi bi-browser-chrome"></i></div>
            <h5 className="fw-bold text-dark mb-2">React Single Page App</h5>
            <p className="text-muted small mb-3">
              Built using React 18, Vite, React Router DOM v6, and Bootstrap 5. Provides fluid client-side routing, responsive UI, real-time timer countdowns, and reactive state management.
            </p>
            <ul className="small text-secondary ps-3 mb-0">
              <li>Axios with JWT Bearer interceptor</li>
              <li>Chart.js / react-chartjs-2 visualizations</li>
              <li>Role-based client guards (AdminRoute, StudentRoute)</li>
            </ul>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm rounded-4 p-4">
            <div className="text-success mb-3 fs-2"><i className="bi bi-server"></i></div>
            <h5 className="fw-bold text-dark mb-2">Python Flask REST API</h5>
            <p className="text-muted small mb-3">
              Modular REST API built with Flask Blueprints, PyMySQL connection pooling, and Werkzeug scrypt password hashing for secure authentication.
            </p>
            <ul className="small text-secondary ps-3 mb-0">
              <li>Secure token authorization with PyJWT</li>
              <li>Server-side score calculation and answer validation</li>
              <li>Zero correct answers exposed to taking endpoints</li>
            </ul>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm rounded-4 p-4">
            <div className="text-info mb-3 fs-2"><i className="bi bi-database-check"></i></div>
            <h5 className="fw-bold text-dark mb-2">MySQL 8.0 Relational DB</h5>
            <p className="text-muted small mb-3">
              Fully normalized relational database schema with cascading foreign keys, performance indexes, and comprehensive audit history.
            </p>
            <ul className="small text-secondary ps-3 mb-0">
              <li>`users`, `quizzes`, `questions` tables</li>
              <li>`attempts` and `answers` for question-level audit</li>
              <li>`chat_messages` for AI tutor session history</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security & Workflow Highlights */}
      <div className="card border-0 bg-light rounded-4 p-4 p-md-5 mb-5 shadow-sm">
        <h4 className="fw-bold text-dark mb-4">Core Design & Anti-Cheat Principles</h4>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="d-flex">
              <div className="me-3 text-primary fs-3"><i className="bi bi-shield-check"></i></div>
              <div>
                <h6 className="fw-bold text-dark mb-1">Hidden Answer Delivery</h6>
                <p className="text-muted small">
                  The `/api/quizzes/:id/questions` endpoint strictly strips the `correct_answer` field. Students cannot open browser Developer Tools or inspect network traffic to cheat.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex">
              <div className="me-3 text-success fs-3"><i className="bi bi-calculator"></i></div>
              <div>
                <h6 className="fw-bold text-dark mb-1">Server-Side Evaluation</h6>
                <p className="text-muted small">
                  Scores, percentages, and correct/wrong counts are calculated entirely on the backend server against verified database records.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex">
              <div className="me-3 text-warning fs-3"><i className="bi bi-hourglass-split"></i></div>
              <div>
                <h6 className="fw-bold text-dark mb-1">Strict Timer Enforcement</h6>
                <p className="text-muted small">
                  The client timer visualizes countdowns and warns at &lt; 2 minutes. When the time runs out, the quiz auto-submits instantly.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex">
              <div className="me-3 text-info fs-3"><i className="bi bi-robot"></i></div>
              <div>
                <h6 className="fw-bold text-dark mb-1">Integrated AI Tutoring</h6>
                <p className="text-muted small">
                  AI endpoints allow students to ask educational follow-up questions, powered by Google Gemini with an intelligent built-in fallback tutor engine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <Link to="/student/quizzes" className="btn btn-primary rounded-pill px-4 py-2.5 fw-semibold shadow-sm me-3">
          Explore Practice Quizzes
        </Link>
        <Link to="/contact" className="btn btn-outline-secondary rounded-pill px-4 py-2.5 fw-semibold">
          Contact Development Team
        </Link>
      </div>
    </div>
  );
};

export default About;
