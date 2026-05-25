import { useEffect, useState } from "react";
import ConnectionStatus from "../components/ConnectionStatus";
import { consultationAPI } from "../services/consultationApi";
import { openDynamicJoinUrl } from "../services/api";
import "./admin.css";

const ConsultationAdmin = () => {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [notesMap, setNotesMap] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [assigningSlot, setAssigningSlot] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const loadAppointments = async () => {
    try {
      setError("");
      const response = await consultationAPI.adminList(
        statusFilter || undefined,
      );
      setAppointments(response.appointments || []);
    } catch (loadErr) {
      setError(loadErr.message || "Failed to load consultations.");
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  const saveNotes = async (appointmentId) => {
    try {
      await consultationAPI.addNotes(
        appointmentId,
        notesMap[appointmentId] || "",
      );
      setMessage("Notes saved.");
      await loadAppointments();
    } catch (saveErr) {
      setError(saveErr.message || "Failed to save notes.");
    }
  };

  const markComplete = async (appointmentId) => {
    try {
      await consultationAPI.markComplete(appointmentId);
      setMessage("Session marked as completed.");
      await loadAppointments();
    } catch (completeErr) {
      setError(completeErr.message || "Failed to update status.");
    }
  };

  const handleAssignSlot = async () => {
    if (!newDate || !newTime) {
      setError("Please provide both date and time.");
      return;
    }
    try {
      await consultationAPI.assignSlot(assigningSlot, {
        appointment_date: newDate,
        appointment_time: newTime,
      });
      setMessage("Appointment slot assigned successfully.");
      setAssigningSlot(null);
      setNewDate("");
      setNewTime("");
      await loadAppointments();
    } catch (assignErr) {
      setError(assignErr.message || "Failed to assign slot.");
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Consultation Admin Dashboard</h1>
          <p>Manage expert sessions, uploads, and post-consultation notes.</p>
        </div>
        <div className="admin-header-actions">
          <button onClick={() => (window.location.hash = "#admin")}>
            Back to Main Admin
          </button>
          <button onClick={() => (window.location.hash = "#dashboard")}>
            Home
          </button>
        </div>
      </header>

      <ConnectionStatus />

      <main className="admin-content">
        <section className="admin-panel">
          <div className="panel-header">
            <h2>Scheduled Consultations</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button onClick={loadAppointments}>Refresh</button>
            </div>
          </div>

          {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
          {message && <p style={{ color: "#166534" }}>{message}</p>}

          <div className="admin-table orders-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Expert</th>
                  <th>Date/Time</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th>Room</th>
                  <th>Uploads</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>#{appointment.id}</td>
                    <td>
                      {appointment.user?.name || "Guest"}
                      <br />
                      <small>{appointment.user?.email || "-"}</small>
                    </td>
                    <td>{appointment.service?.name}</td>
                    <td>{appointment.expert?.name}</td>
                    <td>
                      {appointment.appointment_date}{" "}
                      {appointment.appointment_time}
                    </td>
                    <td>{appointment.consultation_mode}</td>
                    <td>{appointment.status}</td>
                    <td>{appointment.room_id || "-"}</td>
                    <td>
                      {(appointment.attachments || []).map((file) => (
                        <div key={file.id}>
                          <a href={file.url} target="_blank" rel="noreferrer">
                            {file.file_name}
                          </a>
                        </div>
                      ))}
                    </td>
                    <td>
                      <div style={{ display: "grid", gap: 6 }}>
                        <button
                          onClick={() => setAssigningSlot(appointment.id)}
                          style={{ background: "#2563eb" }}
                        >
                          Assign Slot
                        </button>
                        {appointment.join_url && (
                          <button
                            onClick={() =>
                              openDynamicJoinUrl(
                                appointment.join_url,
                                appointment.join_url_candidates || [],
                              )
                            }
                          >
                            Join
                          </button>
                        )}
                        <button onClick={() => markComplete(appointment.id)}>
                          Complete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {appointments.map((appointment) => (
            <div
              key={`notes-${appointment.id}`}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: 12,
                marginTop: 12,
              }}
            >
              <h4>
                Notes for #{appointment.id} - {appointment.service?.name}
              </h4>
              <textarea
                style={{ width: "100%", minHeight: 90, marginTop: 8 }}
                value={
                  notesMap[appointment.id] !== undefined
                    ? notesMap[appointment.id]
                    : appointment.consultation_notes || ""
                }
                onChange={(e) =>
                  setNotesMap((prev) => ({
                    ...prev,
                    [appointment.id]: e.target.value,
                  }))
                }
                placeholder="Skin diagnosis, routine recommendations, suggested products, follow-up advice..."
              />
              <button
                style={{ marginTop: 8 }}
                onClick={() => saveNotes(appointment.id)}
              >
                Save Notes
              </button>
            </div>
          ))}

          {assigningSlot && (
            <div
              style={{
                border: "2px solid #2563eb",
                borderRadius: 10,
                padding: 16,
                marginTop: 20,
                background: "#f0f9ff",
              }}
            >
              <h3>Assign Appointment Slot</h3>
              <p>
                <strong>Appointment ID:</strong> {assigningSlot}
              </p>
              <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                <div>
                  <label>
                    Date:
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      style={{
                        width: "100%",
                        padding: 8,
                        marginTop: 4,
                        borderRadius: 4,
                        border: "1px solid #d1d5db",
                      }}
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Time:
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      style={{
                        width: "100%",
                        padding: 8,
                        marginTop: 4,
                        borderRadius: 4,
                        border: "1px solid #d1d5db",
                      }}
                    />
                  </label>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  onClick={handleAssignSlot}
                  style={{ background: "#16a34a" }}
                >
                  Confirm Slot Assignment
                </button>
                <button
                  onClick={() => {
                    setAssigningSlot(null);
                    setNewDate("");
                    setNewTime("");
                    setError("");
                  }}
                  style={{ background: "#6b7280" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ConsultationAdmin;
