import { useEffect, useMemo, useState } from "react";
import { consultationAPI } from "../services/consultationApi";
import { openDynamicJoinUrl } from "../services/api";
import "./dashboard.css";
import "./my-account.css";
import "./consultations.css";

const STATUS_COLORS = {
  Confirmed: "#166534",
  Pending: "#92400e",
  Completed: "#1e40af",
  Cancelled: "#991b1b",
  Rescheduled: "#5b21b6",
};

const downloadTextFile = (fileName, content, mime = "text/plain") => {
  const blob = new Blob([content], { type: mime });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

const formatValue = (v) => {
  if (v === null || v === undefined) return "-";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
};

const buildReportText = (appointment, username) => {
  const lines = [];
  lines.push(`Consultation Report — ID: ${appointment.id}`);
  lines.push(`User: ${username}`);
  lines.push(`Service: ${appointment.service?.name || "-"}`);
  lines.push(`Expert: ${appointment.expert?.name || "-"}`);
  lines.push(
    `Date/Time: ${appointment.appointment_date || "-"} ${appointment.appointment_time || ""}`,
  );
  lines.push(`Mode: ${appointment.consultation_mode || "-"}`);
  lines.push(`Status: ${appointment.status || "-"}`);
  lines.push(`Payment: ${appointment.payment_method || "-"} ${appointment.payment_status || ""}`);
  if (appointment.consultation_notes) {
    lines.push("");
    lines.push("Expert Notes:");
    lines.push(appointment.consultation_notes);
  }
  return lines.join("\n");
};

const Consultations = ({ consultationId }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [search, setSearch] = useState("");
  const [experts, setExperts] = useState([]);
  const [filterExpert, setFilterExpert] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeConsultationId, setActiveConsultationId] = useState(
    consultationId || "",
  );

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_expires");
    localStorage.removeItem("auth_user");
    window.location.hash = "#";
  };

  const handleSearch = () => {
    if (search.trim()) {
      window.location.hash = `#shop?search=${encodeURIComponent(search)}`;
      setSearch("");
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.name) {
          setUsername(parsed.name);
        }
      } catch {
        setUsername("Guest");
      }
    }
  }, []);

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await consultationAPI.mine();
        const list = response.appointments || [];
        setAppointments(list);
        setActiveConsultationId((current) => current || String(list[0]?.id || ""));
      } catch (loadErr) {
        setError(loadErr.message || "Failed to load consultations.");
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
    (async () => {
      try {
        const c = await consultationAPI.catalog();
        setExperts(c.experts || []);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    if (!consultationId) {
      return;
    }
    setActiveConsultationId(String(consultationId));
  }, [consultationId]);

  const filteredAppointments = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = appointments.slice();

    if (filterExpert) {
      result = result.filter((a) => String(a.expert?.id) === String(filterExpert));
    }

    if (filterStatus && filterStatus !== "All") {
      result = result.filter((a) => String(a.status) === String(filterStatus));
    }

    if (filterFrom) {
      result = result.filter((a) => (a.appointment_date || "") >= filterFrom);
    }

    if (filterTo) {
      result = result.filter((a) => (a.appointment_date || "") <= filterTo);
    }

    if (!term) return result;

    return result.filter((appointment) => {
      const haystack = [
        appointment.service?.name,
        appointment.expert?.name,
        appointment.status,
        appointment.consultation_mode,
        appointment.appointment_date,
        appointment.appointment_time,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [appointments, search]);

  const selectedConsultation = useMemo(
    () =>
      filteredAppointments.find(
        (appointment) => String(appointment.id) === String(activeConsultationId),
      ) || filteredAppointments[0],
    [activeConsultationId, filteredAppointments],
  );

  const stats = useMemo(() => {
    const upcomingStatuses = new Set(["Pending", "Confirmed", "Rescheduled"]);
    return {
      total: appointments.length,
      upcoming: appointments.filter((item) => upcomingStatuses.has(item.status))
        .length,
      completed: appointments.filter((item) => item.status === "Completed")
        .length,
      cancelled: appointments.filter((item) => item.status === "Cancelled")
        .length,
    };
  }, [appointments]);

  const handleDownloadReport = (appointment) => {
    const fileName = `consultation_${appointment.id}_${appointment.appointment_date || "report"}.txt`;
    const report = buildReportText(appointment, username);
    downloadTextFile(fileName, report);
  };

  const handleExportAll = () => {
    const rows = [
      [
        "id",
        "service",
        "expert",
        "appointment_date",
        "appointment_time",
        "mode",
        "status",
        "payment_status",
        "payment_method",
      ],
      ...filteredAppointments.map((appointment) => [
        appointment.id,
        appointment.service?.name || "",
        appointment.expert?.name || "",
        appointment.appointment_date || "",
        appointment.appointment_time || "",
        appointment.consultation_mode || "",
        appointment.status || "",
        appointment.payment_status || "",
        appointment.payment_method || "",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    downloadTextFile(
      `consultations_export_${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      "text/csv",
    );
  };

  const handleExportPdf = async () => {
    try {
      const blob = await consultationAPI.exportMyReport({ format: "pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `consultations_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err?.message || "Failed to export PDF. Make sure server supports PDF generation.");
    }
  };

  return (
    <div className="consultations-page dashboard">
      <section className="consultations-controls">
        <div className="consultations-filters">
          <div className="filter-row">
            <label className="filter-field">
              <span>Expert</span>
              <select value={filterExpert} onChange={(e) => setFilterExpert(e.target.value)}>
                <option value="">All</option>
                {experts.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </label>

            <label className="filter-field">
              <span>Status</span>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option>All</option>
                <option>Pending</option>
                <option>Confirmed</option>
                <option>Rescheduled</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </label>

            <label className="filter-field">
              <span>From</span>
              <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
            </label>

            <label className="filter-field">
              <span>To</span>
              <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
            </label>

            <button className="account-btn-outline filter-clear-btn" onClick={() => { setFilterExpert(''); setFilterStatus('All'); setFilterFrom(''); setFilterTo(''); }}>
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      <main className="consultations-main">
        <section className="consultations-hero">
          <div>
            <p className="consultations-eyebrow">Consultation hub</p>
            <h1>My Consultations</h1>
            <p>
              View every booking, join live sessions, cancel upcoming visits,
              and download a report for each consultation.
            </p>
          </div>
          <div className="consultations-actions">
            <button className="account-btn" onClick={() => (window.location.hash = "#consult")}>
              Book New Consultation
            </button>
            <button className="account-btn-outline" onClick={handleExportAll}>
              Export List as CSV
            </button>
            <button className="account-btn-outline" onClick={handleExportPdf}>
              Export as PDF
            </button>
          </div>
        </section>

        <section className="consultations-stats">
          <div className="consultation-stat-card">
            <span>Total</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="consultation-stat-card">
            <span>Upcoming</span>
            <strong>{stats.upcoming}</strong>
          </div>
          <div className="consultation-stat-card">
            <span>Completed</span>
            <strong>{stats.completed}</strong>
          </div>
          <div className="consultation-stat-card">
            <span>Cancelled</span>
            <strong>{stats.cancelled}</strong>
          </div>
        </section>

        {loading && <p className="account-hint">Loading consultations...</p>}
        {error && <p className="account-error">{error}</p>}

        {!loading && !error && filteredAppointments.length === 0 && (
          <section className="account-section">
            <div className="account-empty">
              <p>You do not have any consultations yet.</p>
              <button className="account-btn" onClick={() => (window.location.hash = "#consult")}>
                Book Your First Consultation
              </button>
            </div>
          </section>
        )}

        {selectedConsultation && (
          <section className="consultations-featured">
            <div className="consultations-featured-header">
              <div>
                <p className="consultations-eyebrow">Highlighted session</p>
                <h2>{selectedConsultation.service?.name || "Consultation"}</h2>
                <p>
                  {selectedConsultation.appointment_date} at {selectedConsultation.appointment_time}
                </p>
              </div>
              <span
                className="order-status-badge"
                style={{ background: STATUS_COLORS[selectedConsultation.status] || "#6b4f35" }}
              >
                {selectedConsultation.status}
              </span>
            </div>
            <div className="consultations-featured-grid">
              <div>
                <strong>Expert</strong>
                <p>{selectedConsultation.expert?.name || "N/A"}</p>
              </div>
              <div>
                <strong>Mode</strong>
                <p>{selectedConsultation.consultation_mode || "N/A"}</p>
              </div>
              <div>
                <strong>Payment</strong>
                <p>{selectedConsultation.payment_status || "N/A"}</p>
              </div>
              <div>
                <strong>Skin Concerns</strong>
                <p>{formatValue(selectedConsultation.skin_concerns)}</p>
              </div>
            </div>
            <div className="consult-actions">
              {selectedConsultation.join_url &&
                selectedConsultation.status !== "Completed" &&
                selectedConsultation.status !== "Cancelled" && (
                  <button
                    className="account-btn"
                    onClick={() =>
                      openDynamicJoinUrl(
                        selectedConsultation.join_url,
                        selectedConsultation.join_url_candidates || [],
                      )
                    }
                  >
                    Join Session
                  </button>
                )}
              {(selectedConsultation.status === "Confirmed" ||
                selectedConsultation.status === "Pending" ||
                selectedConsultation.status === "Rescheduled") && (
                <button
                  className="account-btn-outline"
                  onClick={async () => {
                    if (!window.confirm("Cancel this consultation?")) {
                      return;
                    }
                    await consultationAPI.cancel(selectedConsultation.id);
                    const response = await consultationAPI.mine();
                    setAppointments(response.appointments || []);
                  }}
                >
                  Cancel Consultation
                </button>
              )}
              <button
                className="account-btn-outline"
                onClick={() => handleDownloadReport(selectedConsultation)}
              >
                Download Report
              </button>
            </div>
          </section>
        )}

        <section className="consultations-list">
          {filteredAppointments.map((appointment) => (
            <article className="consult-card consultation-card" key={appointment.id}>
              <div className="consult-card-header">
                <div>
                  <h3>{appointment.service?.name || "Consultation"}</h3>
                  <p className="consult-meta">
                    Expert: <strong>{appointment.expert?.name || "N/A"}</strong>
                  </p>
                  <p className="consult-meta">
                    {appointment.appointment_date} at {appointment.appointment_time} · {appointment.consultation_mode}
                  </p>
                  <p className="consult-meta">Payment: {appointment.payment_status || "N/A"}</p>
                </div>
                <div className="consult-card-meta-right">
                  <span
                    className="order-status-badge"
                    style={{ background: STATUS_COLORS[appointment.status] || "#6b4f35" }}
                  >
                    {appointment.status}
                  </span>
                  <button
                    className={`account-btn-outline ${String(selectedConsultation?.id) === String(appointment.id) ? "is-active-view" : ""}`}
                    onClick={() => setActiveConsultationId(String(appointment.id))}
                  >
                    {String(selectedConsultation?.id) === String(appointment.id) ? "Showing details" : "View Details"}
                  </button>
                </div>
              </div>

              <div className="consultations-body">
                <p className="consult-meta">Skin type: {formatValue(appointment.skin_type)}</p>
                <p className="consult-meta">Concerns: {formatValue(appointment.skin_concerns)}</p>
                <p className="consult-meta">Consultation notes: {formatValue(appointment.consultation_notes)}</p>
                {!!appointment.attachments?.length && (
                  <p className="consult-meta">Attachments: {appointment.attachments.length}</p>
                )}
              </div>

              <div className="consult-actions">
                {appointment.join_url &&
                  appointment.status !== "Completed" &&
                  appointment.status !== "Cancelled" && (
                    <button
                      className="account-btn"
                      onClick={() =>
                        openDynamicJoinUrl(
                          appointment.join_url,
                          appointment.join_url_candidates || [],
                        )
                      }
                    >
                      Join Session
                    </button>
                  )}
                {(appointment.status === "Confirmed" ||
                  appointment.status === "Pending" ||
                  appointment.status === "Rescheduled") && (
                  <button
                    className="account-btn-outline"
                    onClick={async () => {
                      if (!window.confirm("Cancel this consultation?")) {
                        return;
                      }
                      await consultationAPI.cancel(appointment.id);
                      const response = await consultationAPI.mine();
                      setAppointments(response.appointments || []);
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  className="account-btn-outline"
                  onClick={() => handleDownloadReport(appointment)}
                >
                  Download Report
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Consultations;