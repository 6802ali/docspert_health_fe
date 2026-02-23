import { useState, useEffect } from "react";
import { getPatients, createPatient } from "../api/patients";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    email: "",
  });
  const [formError, setFormError] = useState("");

  const pageSize = 10;

  useEffect(() => {
    fetchPatients();
  }, [currentPage]);

  const fetchPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPatients(currentPage, pageSize);
      // Handle different API response formats
      if (data.results) {
        setPatients(data.results);
        setTotalPages(Math.ceil(data.count / pageSize));
      } else if (Array.isArray(data)) {
        setPatients(data);
        setTotalPages(1);
      } else {
        setPatients([]);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        // Token expired/invalid - redirect handled by interceptor
        return;
      }
      setError(err.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    try {
      await createPatient(formData);
      setShowForm(false);
      setFormData({ full_name: "", date_of_birth: "", email: "" });
      fetchPatients(); // Refresh the list
    } catch (err) {
      if (err.response?.status === 401) {
        // Token expired/invalid - redirect handled by interceptor
        return;
      }
      let msg = "Failed to create patient.";
      if (typeof err === "string") msg = err;
      else if (err?.message) msg = err.message;
      else if (typeof err === "object") {
        const first = Object.values(err).flat().find(Boolean);
        if (first) msg = first;
      }
      setFormError(msg);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Patients</h1>
        <button onClick={() => setShowForm(true)} style={styles.addButton}>
          Add Patient
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Add New Patient</h2>
            {formError && <p style={styles.error}>{formError}</p>}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="full_name"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
              <input
                type="date"
                name="date_of_birth"
                placeholder="Date of Birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
              <div style={styles.formActions}>
                <button type="submit" style={styles.submitButton}>
                  Add Patient
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ full_name: "", date_of_birth: "", email: "" });
                    setFormError("");
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Full Name</th>
                <th style={styles.th}>Date of Birth</th>
                <th style={styles.th}>Email</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="4" style={styles.noData}>
                    No patients found
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id}>
                    <td style={styles.td}>{patient.id}</td>
                    <td style={styles.td}>{patient.full_name}</td>
                    <td style={styles.td}>{formatDate(patient.date_of_birth)}</td>
                    <td style={styles.td}>{patient.email}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  ...styles.pageButton,
                  ...(currentPage === 1 ? styles.pageButtonDisabled : {}),
                }}
              >
                Previous
              </button>
              <span style={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  ...styles.pageButton,
                  ...(currentPage === totalPages ? styles.pageButtonDisabled : {}),
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  addButton: {
    padding: "10px 20px",
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    tableLayout: "auto",
  },
  th: {
    backgroundColor: "#f3f4f6",
    padding: "12px",
    textAlign: "left",
    fontWeight: "600",
    borderBottom: "2px solid #e5e7eb",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    wordBreak: "break-word",
    overflowWrap: "break-word",
    maxWidth: "250px",
  },
  noData: {
    textAlign: "center",
    padding: "40px",
    color: "#6b7280",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    marginTop: "20px",
  },
  pageButton: {
    padding: "8px 16px",
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  pageButtonDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed",
  },
  pageInfo: {
    fontSize: "14px",
    color: "#374151",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    width: "400px",
    maxWidth: "90%",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  formActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  submitButton: {
    padding: "10px 20px",
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#6b7280",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  error: {
    color: "#dc2626",
    marginBottom: "15px",
  },
};

export default Patients;
