import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-card">
        <div className="landing-icon" aria-hidden="true">
          <span className="dot dot-top" />
          <span className="dot dot-left" />
          <span className="dot dot-right" />
          <span className="dot dot-center">
            <span className="fork">$</span>
          </span>
        </div>

        <h1 className="landing-title">Split bills, not friendships</h1>
        <p className="landing-subtitle">
          The easiest way to track shared costs with friends, roommates, and travel groups, and Family Members.
        </p>

        <div className="landing-actions">
          <button
            className="landing-btn landing-btn-primary"
            onClick={() => navigate("/signup")}
          >
            Get Started
          </button>

          <button
            className="landing-btn landing-btn-secondary"
            onClick={() => navigate("/login")}
          >
            Log In
          </button>
        </div>
        <div className="landing-video">
        <a
          href="https://youtu.be/vi3reMgcl48"
          target="_blank"
          rel="noopener noreferrer"
          className="landing-video-link"
        >
          🎥 How to use This App? Watch 5-minute demo
        </a>
      </div>
      </div>
    </div>
  );
};

export default LandingPage;