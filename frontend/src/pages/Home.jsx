import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizService } from '../services/quizService';
import QuizCard from '../components/QuizCard';
import { SkeletonCard } from '../components/ui/SkeletonLoader';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, isStudent, isAdmin } = useAuth();
  const [featuredQuizzes, setFeaturedQuizzes] = useState([]);
  const [stats, setStats] = useState({
    total_quizzes: 0,
    total_questions: 0,
    total_categories: 0,
    total_attempts: 0,
    average_score: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [quizRes, statsRes] = await Promise.allSettled([
          quizService.getQuizzes(),
          quizService.getPublicStats(),
        ]);

        if (quizRes.status === 'fulfilled' && quizRes.value.success && quizRes.value.data?.quizzes) {
          setFeaturedQuizzes(quizRes.value.data.quizzes.slice(0, 3));
        }

        if (statsRes.status === 'fulfilled' && statsRes.value.success && statsRes.value.data) {
          setStats(statsRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const categories = [
    {
      title: 'Python Programming',
      icon: 'bi-code-square',
      color: 'primary',
      desc: 'Data structures, OOP, lambda expressions, and core language idioms.',
    },
    {
      title: 'Database & SQL',
      icon: 'bi-database-fill-check',
      color: 'success',
      desc: 'ACID transactions, relational normalization (1NF-BCNF), and complex joins.',
    },
    {
      title: 'Web Technologies',
      icon: 'bi-globe2',
      color: 'info',
      desc: 'Modern HTML5 semantics, CSS3 Flexbox/Grid systems, and DOM APIs.',
    },
    {
      title: 'General Aptitude',
      icon: 'bi-lightbulb-fill',
      color: 'warning',
      desc: 'Logical deduction, quantitative problem solving, and analytical reasoning.',
    },
  ];

  const faqs = [
    {
      q: 'How does the automated timer and submission work?',
      a: 'Each assessment features an active countdown timer. You receive a visual alert when time is critical (under 2 minutes). The instant the countdown reaches 00:00, your current selections are submitted automatically to ensure fair testing.',
    },
    {
      q: 'Are correct answers kept confidential during the test?',
      a: 'Yes. Answers are strictly kept on the server. The client receives only question prompts and options without the solution keys, preventing DevTools tampering or inspect-element exploitation.',
    },
    {
      q: 'How does the integrated AI Tutor support my learning?',
      a: 'The built-in AI Study Tutor acts as a personal academic assistant. You can ask conceptual questions about Python, SQL, DBMS, or Web Development, or request explanations for topics you missed during quizzes.',
    },
    {
      q: 'How are leaderboard positions determined?',
      a: 'Leaderboard rankings are computed dynamically based on percentage accuracy, overall score, and the time taken to complete each attempt.',
    },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section py-5 py-lg-6 bg-dark text-white position-relative overflow-hidden">
        <div className="container py-4 position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1.5 fw-semibold mb-3">
                <i className="bi bi-mortarboard-fill me-1"></i> Academic Assessment Platform
              </span>
              <h1 className="display-4 fw-extrabold text-white mb-3 lh-sm">
                Master Technical Concepts with <span className="text-primary">Timed Assessments</span> & Instant Analytics
              </h1>
              <p className="lead text-white-50 mb-4 fs-5">
                Practice topic-focused quizzes with verified questions, rigorous countdown timers, server-side anti-cheat evaluation, and an integrated AI study tutor.
              </p>
              <div className="d-flex flex-wrap gap-3">
                {isAuthenticated ? (
                  isAdmin ? (
                    <Link to="/admin/dashboard" className="btn btn-primary btn-lg rounded-pill px-4 py-2.5 fw-semibold shadow">
                      <i className="bi bi-speedometer2 me-2"></i> Go to Admin Dashboard
                    </Link>
                  ) : (
                    <Link to="/student/quizzes" className="btn btn-primary btn-lg rounded-pill px-4 py-2.5 fw-semibold shadow">
                      <i className="bi bi-play-circle-fill me-2"></i> Browse All Quizzes
                    </Link>
                  )
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg rounded-pill px-4 py-2.5 fw-semibold shadow">
                      Get Started Free <i className="bi bi-arrow-right ms-2"></i>
                    </Link>
                    <Link to="/login" className="btn btn-outline-light btn-lg rounded-pill px-4 py-2.5 fw-semibold">
                      Student / Admin Login
                    </Link>
                  </>
                )}
              </div>

              {/* Trust Badges */}
              <div className="d-flex flex-wrap gap-4 mt-5 pt-3 border-top border-secondary border-opacity-25 text-white-50 small">
                <div className="d-flex align-items-center">
                  <i className="bi bi-shield-check text-success fs-4 me-2"></i>
                  <span>Server-Side Evaluated</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-stopwatch text-warning fs-4 me-2"></i>
                  <span>Zero-Latency Countdown</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-robot text-info fs-4 me-2"></i>
                  <span>Interactive AI Study Tutor</span>
                </div>
              </div>
            </div>

            {/* Hero Interactive Feature Card */}
            <div className="col-lg-5">
              <div className="card bg-secondary bg-opacity-10 border border-secondary border-opacity-25 shadow-lg rounded-4 p-4 text-start">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="badge bg-primary rounded-pill px-3 py-1">Online Assessment Engine</span>
                  <span className="text-white-50 small font-monospace"><i className="bi bi-clock me-1"></i> Active Session</span>
                </div>
                <div className="p-3 rounded-3 bg-dark bg-opacity-75 border border-secondary border-opacity-25 mb-3">
                  <div className="d-flex justify-content-between text-white-50 small mb-1">
                    <span>Database Systems • ACID Properties</span>
                    <span className="text-warning">1 Mark</span>
                  </div>
                  <h6 className="text-white fw-bold mb-2">What does the "I" in ACID properties guarantee?</h6>
                  <div className="d-flex flex-column gap-2 mt-2">
                    <div className="p-2 rounded bg-secondary bg-opacity-25 text-white-50 small">A) Indexing optimization</div>
                    <div className="p-2 rounded bg-primary text-white small fw-semibold d-flex align-items-center">
                      <i className="bi bi-check-circle-fill me-2"></i> B) Isolation of concurrent transactions
                    </div>
                    <div className="p-2 rounded bg-secondary bg-opacity-25 text-white-50 small">C) Integrity constraints</div>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center text-white-50 small pt-2 border-top border-secondary border-opacity-25">
                  <span className="text-success fw-semibold"><i className="bi bi-check2-all me-1"></i> Evaluated Server-Side</span>
                  <span className="font-monospace">Auto-submit at 00:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Platform Statistics Bar */}
      <section className="py-4 bg-white border-bottom">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-6 col-md-3">
              <div className="p-2">
                <h2 className="display-6 fw-bold text-primary mb-1">{stats.total_quizzes || 5}+</h2>
                <div className="text-muted small fw-semibold text-uppercase">Active Quizzes</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-2">
                <h2 className="display-6 fw-bold text-success mb-1">{stats.total_questions || 25}+</h2>
                <div className="text-muted small fw-semibold text-uppercase">Curated Questions</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-2">
                <h2 className="display-6 fw-bold text-info mb-1">{stats.total_attempts || 0}</h2>
                <div className="text-muted small fw-semibold text-uppercase">Evaluated Attempts</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-2">
                <h2 className="display-6 fw-bold text-warning mb-1">{stats.average_score || 0}%</h2>
                <div className="text-muted small fw-semibold text-uppercase">Average Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore By Category */}
      <section className="py-5 bg-light">
        <div className="container py-3">
          <div className="text-center max-w-700 mx-auto mb-5">
            <span className="text-primary fw-bold text-uppercase small">Curriculum Tracks</span>
            <h2 className="fw-bold text-dark">Explore Subjects by Domain</h2>
            <p className="text-muted small">
              Sharpen your core knowledge across key computing subjects with structured problem sets.
            </p>
          </div>

          <div className="row g-4">
            {categories.map((cat, i) => (
              <div key={i} className="col-lg-3 col-md-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100 transition-hover bg-white">
                  <div className={`rounded-3 bg-${cat.color}-subtle text-${cat.color} d-inline-flex align-items-center justify-content-center p-3 mb-3`} style={{ width: '52px', height: '52px' }}>
                    <i className={`bi ${cat.icon} fs-4`}></i>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">{cat.title}</h5>
                  <p className="text-muted small mb-4 flex-grow-1">{cat.desc}</p>
                  <Link to="/student/quizzes" className={`text-${cat.color} fw-semibold text-decoration-none small d-inline-flex align-items-center`}>
                    Browse Track <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Quizzes Section */}
      <section className="py-5 bg-white">
        <div className="container py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small">Featured Catalog</span>
              <h2 className="fw-bold text-dark mb-0">Recommended Assessments</h2>
            </div>
            <Link to="/student/quizzes" className="btn btn-outline-primary rounded-pill px-4 mt-3 mt-md-0 fw-semibold">
              View All Quizzes <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loading ? (
            <SkeletonCard count={3} />
          ) : featuredQuizzes.length > 0 ? (
            <div className="row g-4">
              {featuredQuizzes.map((quiz) => (
                <div key={quiz.id} className="col-lg-4 col-md-6">
                  <QuizCard quiz={quiz} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <p>No featured quizzes found at this moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-light">
        <div className="container py-3">
          <div className="text-center max-w-700 mx-auto mb-5">
            <span className="text-primary fw-bold text-uppercase small">Simple & Structured</span>
            <h2 className="fw-bold text-dark">How QuizMaster Works</h2>
            <p className="text-muted small">
              Three straightforward steps from selecting a test to analyzing your conceptual grasp.
            </p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mx-auto mb-3 fw-bold fs-5" style={{ width: '48px', height: '48px' }}>
                  1
                </div>
                <h5 className="fw-bold text-dark mb-2">Select Your Assessment</h5>
                <p className="text-muted small mb-0">
                  Filter by category (Python, DBMS, Web Tech) and difficulty level. Review instructions and time limits before initiating the session.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mx-auto mb-3 fw-bold fs-5" style={{ width: '48px', height: '48px' }}>
                  2
                </div>
                <h5 className="fw-bold text-dark mb-2">Complete Timed Test</h5>
                <p className="text-muted small mb-0">
                  Navigate questions with the interactive palette, clear choices, or mark questions for review. Enjoy automated submission when the timer expires.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mx-auto mb-3 fw-bold fs-5" style={{ width: '48px', height: '48px' }}>
                  3
                </div>
                <h5 className="fw-bold text-dark mb-2">Analyze & Learn with AI</h5>
                <p className="text-muted small mb-0">
                  Get your score immediately with breakdown charts, review correct explanations question-by-question, and consult the AI Tutor on mistakes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-5 bg-white">
        <div className="container py-3">
          <div className="text-center max-w-700 mx-auto mb-5">
            <span className="text-primary fw-bold text-uppercase small">Got Questions?</span>
            <h2 className="fw-bold text-dark">Frequently Asked Questions</h2>
            <p className="text-muted small">
              Everything you need to know about taking assessments, scoring criteria, and system features.
            </p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="d-flex flex-column gap-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="card border shadow-xs rounded-3 overflow-hidden">
                    <button
                      className="btn d-flex justify-content-between align-items-center w-100 text-start p-3.5 bg-white border-0 fw-semibold text-dark"
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={activeFaq === idx}
                    >
                      <span>{faq.q}</span>
                      <i className={`bi bi-chevron-${activeFaq === idx ? 'up' : 'down'} text-primary`}></i>
                    </button>
                    {activeFaq === idx && (
                      <div className="px-4 pb-3 text-secondary small border-top pt-2 bg-light">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-5 bg-primary text-white">
        <div className="container py-3 text-center">
          <h2 className="display-6 fw-bold mb-3">Ready to Benchmark Your Technical Knowledge?</h2>
          <p className="lead text-white-50 max-w-600 mx-auto mb-4 fs-6">
            Join students testing their mastery in Computer Science, Database Architecture, and Software Engineering.
          </p>
          <div className="d-flex justify-content-center gap-3">
            {isAuthenticated ? (
              <Link to="/student/quizzes" className="btn btn-light rounded-pill px-4 py-2.5 fw-semibold text-primary shadow">
                Go to Available Quizzes <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-light rounded-pill px-4 py-2.5 fw-semibold text-primary shadow">
                  Create Student Account
                </Link>
                <Link to="/login" className="btn btn-outline-light rounded-pill px-4 py-2.5 fw-semibold">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
