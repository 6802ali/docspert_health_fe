import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await loginUser(formData.email, formData.password);
      // Save JWT (support both "access" and "token" from API)
      const jwt = response.access ?? response.token;
      if (jwt) {
        localStorage.setItem("token", jwt);
      }
      // Save user email
      localStorage.setItem("email", formData.email);
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }
      // Redirect to home page
      navigate("/");
    } catch (err) {
      let msg = "Login failed.";
      if (typeof err === "string") msg = err;
      else if (err?.message) msg = err.message;
      else if (typeof err === "object") {
        const first = Object.values(err).flat().find(Boolean);
        if (first) msg = first;
      }
      setError(msg);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Login</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Login
        </button>

        <p style={styles.linkText}>
          Haven't registered yet? <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f4f4",
  },
  form: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    width: "350px",
    display: "flex",
    flexDirection: "column",
  },
  input: {
    marginBottom: "1rem",
    padding: "0.6rem",
  },
  button: {
    padding: "0.6rem",
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  error: {
    color: "red",
  },
  linkText: {
    marginTop: "15px",
    textAlign: "center",
    fontSize: "14px",
  },
  link: {
    color: "#16a34a",
    textDecoration: "none",
    fontWeight: "500",
  },
};

export default Login;
