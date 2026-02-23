import { Link, Outlet, useNavigate, Navigate } from "react-router-dom";

function DashboardLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Redirect to login if no token
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let user = null;
  try {
    const stored = localStorage.getItem("user");
    user = stored ? JSON.parse(stored) : null;
  } catch (_) {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={{ color: "white" }}>Docspert Health</h2>

        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/patients" style={styles.link}>Patients</Link>
        <Link to="/consultations" style={styles.link}>Consultations</Link>

        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <Outlet context={{ user }} />
      </div>
    </div>
  );
}

const SIDEBAR_WIDTH = 250;

const styles = {
  container: {
    minHeight: "100vh",
  },
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: `${SIDEBAR_WIDTH}px`,
    height: "100vh",
    backgroundColor: "#1f2937",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    zIndex: 10,
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "20px",
  },
  logoutButton: {
    marginTop: "auto",
    padding: "10px 16px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "500",
  },
  content: {
    marginLeft: `${SIDEBAR_WIDTH}px`,
    minHeight: "100vh",
    padding: "40px",
    backgroundColor: "#f9fafb",
    overflowY: "auto",
  },
};

export default DashboardLayout;