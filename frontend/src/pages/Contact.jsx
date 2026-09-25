import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container py-5">
      <div className="text-center max-w-700 mx-auto mb-5">
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1.5 fw-semibold mb-2">
          Get in Touch
        </span>
        <h1 className="fw-bold text-dark">Help & Support</h1>
        <p className="text-muted">
          Have questions about the Online Quiz System, need technical support, or want to report an issue?
        </p>
      </div>

      <div className="row g-5 justify-content-center">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white h-100">
            <h5 className="fw-bold text-dark mb-4">Support Channels</h5>
            
            <div className="d-flex align-items-start mb-4">
              <div className="bg-primary-subtle text-primary rounded-3 p-3 me-3">
                <i className="bi bi-envelope-at fs-4"></i>
              </div>
              <div>
                <div className="fw-semibold text-dark">Email Inquiries</div>
                <div className="text-muted small">support@onlinequizsystem.local</div>
                <div className="text-muted small">admin@quizsystem.com</div>
              </div>
            </div>

            <div className="d-flex align-items-start mb-4">
              <div className="bg-success-subtle text-success rounded-3 p-3 me-3">
                <i className="bi bi-clock-history fs-4"></i>
              </div>
              <div>
                <div className="fw-semibold text-dark">Academic Demonstration Hours</div>
                <div className="text-muted small">Monday – Friday: 9:00 AM – 6:00 PM</div>
                <div className="text-muted small">Saturday: 10:00 AM – 2:00 PM</div>
              </div>
            </div>

            <div className="d-flex align-items-start">
              <div className="bg-info-subtle text-info rounded-3 p-3 me-3">
                <i className="bi bi-github fs-4"></i>
              </div>
              <div>
                <div className="fw-semibold text-dark">Project Repository</div>
                <div className="text-muted small">Available for portfolio review & college demonstration</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
            <h5 className="fw-bold text-dark mb-4">Send Us a Message</h5>

            {submitted ? (
              <div className="alert alert-success d-flex align-items-center py-4" role="alert">
                <i className="bi bi-check-circle-fill fs-3 me-3"></i>
                <div>
                  <h6 className="fw-bold mb-1">Message Received!</h6>
                  <p className="small mb-0">Thank you for contacting QuizMaster support. Our team will review your inquiry shortly.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary small">Your Name</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    placeholder="e.g. Maria Garcia"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary small">Your Email</label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary small">Subject</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    placeholder="Quiz inquiry, question feedback, etc."
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold text-secondary small">Message</label>
                  <textarea
                    className="form-control bg-light"
                    rows="4"
                    placeholder="How can we assist you?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary rounded-pill px-4 py-2.5 fw-semibold shadow-sm w-100">
                  Send Message <i className="bi bi-send-fill ms-1"></i>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
