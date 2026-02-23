import { useState, useEffect } from "react";
import { getConsultations, createConsultation, generateSummary } from "../api/consultations";
import { getAllPatients } from "../api/patients";

function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    symptoms: "",
    diagnosis: "",
    ai_summary: "",
    patient: "",
  });
  const [formError, setFormError] = useState("");
  const [generatingId, setGeneratingId] = useState(null);

  const pageSize = 10;

  useEffect(() => {
    fetchConsultations();
    fetchPatients();
  }, [currentPage]);

  const fetchConsultations = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getConsultations(currentPage, pageSize);
      // Handle different API response formats
      if (data.results) {
        setConsultations(data.results);
        setTotalPages(Math.ceil(data.count / pageSize));
      } else if (Array.isArray(data)) {
        setConsultations(data);
        setTotalPages(1);
      } else {
        setConsultations([]);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        // Token expired/invalid - redirect handled by interceptor
        return;
      }
      setError(err.message || "Failed to load consultations");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await getAllPatients();
      setPatients(data);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "patient" ? parseInt(value, 10) : value,
    });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    try {
      await createConsultation({
        ...formData,
        patient: parseInt(formData.patient, 10),
      });
      setShowForm(false);
      setFormData({ symptoms: "", diagnosis: "", ai_summary: "", patient: "" });
      fetchConsultations(); // Refresh the list
    } catch (err) {
      if (err.response?.status === 401) {
        // Token expired/invalid - redirect handled by interceptor
        return;
      }
      let msg = "Failed to create consultation.";
      if (typeof err === "string") msg = err;
      else if (err?.message) msg = err.message;
      else if (typeof err === "object") {
        const first = Object.values(err).flat().find(Boolean);
        if (first) msg = first;
      }
      setFormError(msg);
    }
  };

  const handleGenerateSummary = async (id) => {
    setGeneratingId(id);
    setError("");
    try {
      await generateSummary(id);
      fetchConsultations(); // Refresh to show new ai_summary
    } catch (err) {
      if (err.response?.status === 401) return;
      let msg = "Failed to generate AI summary.";
      if (typeof err === "string") msg = err;
      else if (err?.message) msg = err.message;
      else if (typeof err === "object") {
        const first = Object.values(err).flat().find(Boolean);
        if (first) msg = first;
      }
      setError(msg);
    } finally {
      setGeneratingId(null);
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.full_name : `Patient #${patientId}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Consultations</h1>
        <button onClick={() => setShowForm(true)} style={styles.addButton}>
          Add Consultation
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Add New Consultation</h2>
            {formError && <p style={styles.error}>{formError}</p>}
            <form onSubmit={handleSubmit}>
              <select
                name="patient"
                value={formData.patient}
                onChange={handleInputChange}
                required
                style={styles.input}
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.full_name} ({patient.email})
                  </option>
                ))}
              </select>
              <textarea
                name="symptoms"
                placeholder="Symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                required
                style={{ ...styles.input, ...styles.textarea }}
                rows="4"
              />
              <textarea
                name="diagnosis"
                placeholder="Diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                required
                style={{ ...styles.input, ...styles.textarea }}
                rows="4"
              />
              <textarea
                name="ai_summary"
                placeholder="AI Summary (optional)"
                value={formData.ai_summary}
                onChange={handleInputChange}
                style={{ ...styles.input, ...styles.textarea }}
                rows="4"
              />
              <div style={styles.formActions}>
                <button type="submit" style={styles.submitButton}>
                  Add Consultation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      symptoms: "",
                      diagnosis: "",
                      ai_summary: "",
                      patient: "",
                    });
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
                <th style={styles.th}>Patient</th>
                <th style={styles.th}>Symptoms</th>
                <th style={styles.th}>Diagnosis</th>
                <th style={styles.th}>AI Summary</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {consultations.length === 0 ? (
                <tr>
                  <td colSpan="6" style={styles.noData}>
                    No consultations found
                  </td>
                </tr>
              ) : (
                consultations.map((consultation) => (
                  <tr key={consultation.id}>
                    <td style={styles.td}>{consultation.id}</td>
                    <td style={styles.td}>
                      {getPatientName(
                        consultation.patient?.id || consultation.patient
                      )}
                    </td>
                    <td style={styles.td}>{consultation.symptoms}</td>
                    <td style={styles.td}>{consultation.diagnosis}</td>
                    <td style={styles.tdSummary}>{consultation.ai_summary || "—"}</td>
                    <td style={styles.td}>
                      <button
                        type="button"
                        onClick={() => handleGenerateSummary(consultation.id)}
                        disabled={generatingId === consultation.id}
                        style={styles.summaryButton}
                      >
                        {generatingId === consultation.id
                          ? "Generating..."
                          : "Create AI Summary"}
                      </button>
                    </td>
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
                  ...(currentPage === totalPages
                    ? styles.pageButtonDisabled
                    : {}),
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
    maxWidth: "200px",
  },
  tdSummary: {
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
    width: "500px",
    maxWidth: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
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
  textarea: {
    resize: "vertical",
    fontFamily: "inherit",
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

export default Consultations;
