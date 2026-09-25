import React, { useState, useEffect } from 'react';
import { quizService } from '../../services/quizService';
import QuizCard from '../../components/QuizCard';
import Sidebar from '../../components/Sidebar';
import SearchBar from '../../components/ui/SearchBar';
import { SkeletonCard } from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';

const AvailableQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const res = await quizService.getQuizzes({
          search: searchTerm,
          category: selectedCategory,
          difficulty: selectedDifficulty,
        });
        if (res.success && res.data) {
          setQuizzes(res.data.quizzes || []);
          if (res.data.categories?.length && categories.length === 0) {
            setCategories(res.data.categories);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search/filter
    const timer = setTimeout(() => {
      fetchQuizzes();
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar type="student" />
      <div className="dashboard-content">
        <div className="mb-4">
          <h2 className="fw-bold text-dark mb-1">Available Practice Quizzes</h2>
          <p className="text-muted small mb-0">Select a topic, test your knowledge, and track your performance</p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Search and Filters */}
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-lg-6">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search quizzes by title, topic, or keyword..."
              />
            </div>

            {/* Difficulty Filter */}
            <div className="col-lg-3 col-md-6">
              <select
                className="form-select bg-light"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                aria-label="Filter by difficulty"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Total count badge */}
            <div className="col-lg-3 col-md-6 text-lg-end text-muted small">
              Showing <strong className="text-dark">{quizzes.length}</strong> active assessments
            </div>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mt-3 pt-3 border-top">
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 fw-medium ${
                  selectedCategory === 'all' ? 'btn-primary' : 'btn-light border text-secondary'
                }`}
                onClick={() => setSelectedCategory('all')}
              >
                All Topics
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 fw-medium ${
                    selectedCategory === cat ? 'btn-primary' : 'btn-light border text-secondary'
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quizzes Grid */}
        {loading ? (
          <SkeletonCard count={6} />
        ) : quizzes.length > 0 ? (
          <div className="row g-4">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="col-xl-4 col-md-6">
                <QuizCard quiz={quiz} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="bi-search"
            title="No Matching Quizzes Found"
            description="Try adjusting your search keywords or switching category/difficulty filters."
            action={
              <button className="btn btn-outline-primary rounded-pill px-4" onClick={resetFilters}>
                Reset All Filters
              </button>
            }
          />
        )}
      </div>
    </div>
  );
};

export default AvailableQuizzes;
