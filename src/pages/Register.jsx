import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../api/auth";

function Register() {
  const [formData, setFormData] = useState({
    email: "",
    fullname: "",
    age: "",
    phonenumber: "",
    password: "",
  });

  const [error, setError] = useState("");

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
      await registerUser(formData);
      alert("Registration successful.");
    } catch (err) {
      let msg = "Registration failed.";
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
        <h2>Register</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="text"
          name="fullname"
          placeholder="Full Name"
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="number"
          name="age"
          placeholder="Age"
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="text"
          name="phonenumber"
          placeholder="Phone Number"
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Register
        </button>

        <p style={styles.linkText}>
          Already registered? <Link to="/login" style={styles.link}>Login</Link>
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

export default Register;