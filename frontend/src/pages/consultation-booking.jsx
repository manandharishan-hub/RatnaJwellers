import { useEffect, useMemo, useState } from "react";
import ConnectionStatus from "../components/ConnectionStatus";
import { consultationAPI } from "../services/consultationApi";
import { apiPost } from "../services/api";
import { openDynamicJoinUrl } from "../services/api";
import "./dashboard.css";
import "./consultation-booking.css";

const concernOptions = [
  "acne",
  "pigmentation",
  "wrinkles",
  "dryness",
  "dullness",
  "redness",
];

const formatAmount = (value) => Number(value ?? 0).toFixed(2);

const ConsultationBooking = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [search, setSearch] = useState("");

  const [catalog, setCatalog] = useState({
    services: [],
    experts: [],
    consultation_modes: [],
    payment_methods: [],
  });
  const [availableDates, setAvailableDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedMode, setSelectedMode] = useState("Video Call");
  const [selectedExpertId, setSelectedExpertId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("eSewa");

  const [skinType, setSkinType] = useState("oily");
  const [skinConcerns, setSkinConcerns] = useState([]);
  const [allergies, setAllergies] = useState("");
  const [routine, setRoutine] = useState("");
  const [ageRange, setAgeRange] = useState("18-24");
  const [files, setFiles] = useState([]);

  const selectedService = useMemo(
    () => catalog.services.find((service) => service.id === selectedServiceId),
    [catalog.services, selectedServiceId],
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

  const toggleConcern = (concern) => {
    setSkinConcerns((prev) =>
      prev.includes(concern)
        ? prev.filter((item) => item !== concern)
        : [...prev, concern],
    );
  };

  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const response = await consultationAPI.mine();
      setAppointments(response.appointments || []);
    } catch (loadErr) {
      console.error(loadErr);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.name) {
        setUsername(parsed.name);
      }
    }

    const loadCatalog = async () => {
      try {
        const response = await consultationAPI.catalog();
        setCatalog(response);
        if (response.services?.[0]?.id) {
          setSelectedServiceId(response.services[0].id);
        }
        if (response.experts?.[0]?.id) {
          setSelectedExpertId(response.experts[0].id);
        }
        if (response.consultation_modes?.[0]) {
          setSelectedMode(response.consultation_modes[0]);
        }
        if (response.payment_methods?.[0]) {
          setSelectedPaymentMethod(response.payment_methods[0]);
        }
      } catch (catalogErr) {
        setError(catalogErr.message || "Failed to load consultation data.");
      }
    };

    loadCatalog();
    loadAppointments();
  }, []);

  useEffect(() => {
    const loadAvailableDates = async () => {
      if (!selectedExpertId) {
        setAvailableDates([]);
        return;
      }
      try {
        setLoadingDates(true);
        const response = await consultationAPI.availableDates(
          selectedExpertId,
          30,
        );
        setAvailableDates(response.available_dates || []);
      } catch (datesErr) {
        setAvailableDates([]);
        console.error(datesErr);
      } finally {
        setLoadingDates(false);
      }
    };

    loadAvailableDates();
  }, [selectedExpertId]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedExpertId || !selectedDate) return;
      try {
        setLoadingSlots(true);
        setSelectedTime("");
        const duration = selectedService?.duration_minutes || 30;
        const response = await consultationAPI.slots(
          selectedExpertId,
          selectedDate,
          duration,
        );
        setSlots(response.slots || []);
      } catch (slotErr) {
        setSlots([]);
        console.error(slotErr);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedExpertId, selectedDate, selectedService]);

  const handleBookConsultation = async () => {
    setError("");
    setSuccess("");

    if (
      !selectedServiceId ||
      !selectedExpertId ||
      !selectedDate ||
      !selectedTime ||
      !selectedMode
    ) {
      setError(
        "Please complete service, expert, date, time, and mode selection.",
      );
      return;
    }

    if (skinConcerns.length === 0) {
      setError("Please select at least one skin concern.");
      return;
    }

    try {
      setSubmitting(true);

      // If eSewa selected, initiate eSewa flow similar to Checkout
      if (selectedPaymentMethod === "eSewa") {
        // minimal amount is the service price
        const amount = formatAmount(selectedService?.price);
        const productCode = "EPAYTEST";
        if (!amount || Number(amount) <= 0) {
          setError("Invalid service amount for payment.");
          setSubmitting(false);
          return;
        }

        const generateUUID = () => {
          return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[[xy]]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
        };

        const transactionUUID = generateUUID();

        // Request signature from backend
        let signature = "";
        try {
          const resp = await apiPost("/orders/generate-signature", {
            total_amount: amount,
            transaction_uuid: transactionUUID,
            product_code: productCode,
          });
          signature = resp.signature;
        } catch (sigErr) {
          console.error("Failed to generate signature", sigErr);
          setError("Failed to initiate eSewa payment. Try again later.");
          setSubmitting(false);
          return;
        }

        // Store consultation details in localStorage under order_{txn} so callback can create booking
        const consultPayload = {
          service_id: selectedServiceId,
          expert_id: selectedExpertId,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          consultation_mode: selectedMode,
          skin_type: skinType,
          skin_concerns: skinConcerns,
          allergies_or_sensitivities: allergies,
          current_skincare_routine: routine,
          age_range: ageRange,
          payment_method: "eSewa",
          payment_status: "Pending",
          payment_reference: transactionUUID,
          amount: Number(amount),
        };

        localStorage.setItem(`order_${transactionUUID}`, JSON.stringify(consultPayload));

        // Build eSewa form and submit
        const esewaForm = document.createElement("form");
        esewaForm.setAttribute("action", "https://rc-epay.esewa.com.np/api/epay/main/v2/form");
        esewaForm.setAttribute("method", "POST");
        esewaForm.setAttribute("id", "esewaForm");

        const formFields = {
          amount: String(amount),
          tax_amount: String(0),
          total_amount: String(amount),
          transaction_uuid: transactionUUID,
          product_code: productCode,
          product_service_charge: "0",
          product_delivery_charge: "0",
          success_url: `${window.location.origin}/#checkout-success?txn=${transactionUUID}`,
          failure_url: `${window.location.origin}/#checkout-failure?txn=${transactionUUID}`,
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature: signature,
        };

        Object.keys(formFields).forEach((key) => {
          const input = document.createElement("input");
          input.setAttribute("type", "hidden");
          input.setAttribute("name", key);
          input.setAttribute("value", formFields[key]);
          esewaForm.appendChild(input);
        });

        document.body.appendChild(esewaForm);
        esewaForm.submit();
        return; // will redirect to eSewa
      }

      // Cash in person — create booking immediately with Pending payment
      const formData = new FormData();
      formData.append("service_id", selectedServiceId);
      formData.append("expert_id", selectedExpertId);
      formData.append("appointment_date", selectedDate);
      formData.append("appointment_time", selectedTime);
      formData.append("consultation_mode", selectedMode);
      formData.append("skin_type", skinType);
      formData.append("skin_concerns", JSON.stringify(skinConcerns));
      formData.append("allergies_or_sensitivities", allergies);
      formData.append("current_skincare_routine", routine);
      formData.append("age_range", ageRange);
      formData.append("payment_method", selectedPaymentMethod);
      formData.append("payment_status", "Pending");
      formData.append("payment_reference", `CASH-${Date.now()}`);

      files.forEach((file) => {
        formData.append("images[]", file);
      });

      const response = await consultationAPI.book(formData);
      setSuccess(response.message || "Consultation booked successfully.");
      setSelectedTime("");
      setFiles([]);
      await loadAppointments();
    } catch (bookErr) {
      setError(bookErr.message || "Failed to book consultation.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await consultationAPI.cancel(appointmentId);
      await loadAppointments();
    } catch (cancelErr) {
      setError(cancelErr.message || "Failed to cancel appointment.");
    }
  };

  const handleReschedule = async (appointmentId) => {
    const newDate = window.prompt("Enter new date (YYYY-MM-DD):");
    const newTime = window.prompt("Enter new time (HH:MM):");

    if (!newDate || !newTime) {
      return;
    }

    try {
      await consultationAPI.reschedule(appointmentId, {
        appointment_date: newDate,
        appointment_time: newTime,
      });
      await loadAppointments();
    } catch (resErr) {
      setError(resErr.message || "Failed to reschedule appointment.");
    }
  };

  return (
    <div className="consultation-page">
      <ConnectionStatus />
      <main className="consultation-content">
        <section className="consultation-hero">
          <h1>Online Consultation Appointment Booking</h1>
          <p>
            Select a beauty service, pick your expert, complete skin details,
            upload reference images, and join your session with a dedicated Room
            ID.
          </p>
        </section>

        <section className="consultation-grid">
          <div className="consultation-panel">
            <h2 className="consultation-section-title">1. Select Service</h2>
            <div className="service-grid">
              {catalog.services.map((service) => (
                <button
                  key={service.id}
                  className={`select-card ${selectedServiceId === service.id ? "active" : ""}`}
                  onClick={() => setSelectedServiceId(service.id)}
                >
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="meta">
                    <span>NPR {Number(service.price).toFixed(2)}</span>
                    <span>{service.duration_minutes} min</span>
                  </div>
                </button>
              ))}
            </div>

            <h2 className="consultation-section-title">2. Consultation Mode</h2>
            <div className="mode-grid">
              {catalog.consultation_modes.map((mode) => (
                <button
                  key={mode}
                  className={`select-card ${selectedMode === mode ? "active" : ""}`}
                  onClick={() => setSelectedMode(mode)}
                >
                  <h4>{mode}</h4>
                </button>
              ))}
            </div>

            <h2 className="consultation-section-title">3. Choose Expert</h2>
            <div className="expert-grid">
              {catalog.experts.map((expert) => (
                <button
                  key={expert.id}
                  className={`select-card ${selectedExpertId === expert.id ? "active" : ""}`}
                  onClick={() => setSelectedExpertId(expert.id)}
                >
                  <div className="expert-header">
                    <img
                      src={expert.profile_picture}
                      alt={expert.name}
                      className="expert-avatar"
                    />
                    <div>
                      <h4>{expert.name}</h4>
                      <p>{expert.specialization}</p>
                    </div>
                  </div>
                  <div className="meta">
                    <span>{expert.years_of_experience} yrs exp.</span>
                    <span>
                      {expert.rating} ({expert.review_count} reviews)
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <h2 className="consultation-section-title">4. Date & Slot</h2>
            <div className="form-grid">
              <div>
                <label>Available Dates</label>
                {loadingDates && (
                  <p className="info-text">Loading available dates...</p>
                )}
                {!loadingDates && availableDates.length === 0 && (
                  <p className="info-text">
                    No available dates for this expert.
                  </p>
                )}
                <div className="date-grid" style={{ marginTop: 8 }}>
                  {availableDates.map((date) => {
                    const dateObj = new Date(date);
                    const dayName = dateObj.toLocaleDateString("en-US", {
                      weekday: "short",
                    });
                    const dateStr = dateObj.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                    return (
                      <button
                        key={date}
                        className={`select-card date-card ${selectedDate === date ? "active" : ""}`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div>{dayName}</div>
                        <div>{dateStr}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="slot-grid" style={{ marginTop: 10 }}>
              {selectedDate && (
                <h3 style={{ marginBottom: 10 }}>Available Times</h3>
              )}
              {loadingSlots && (
                <p className="info-text">Loading available slots...</p>
              )}
              {!loadingSlots && slots.length === 0 && selectedDate && (
                <p className="info-text">No available slots for this date.</p>
              )}
              {slots.map((slot) => (
                <button
                  key={slot}
                  className={`select-card ${selectedTime === slot ? "active" : ""}`}
                  onClick={() => setSelectedTime(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>

            <h2 className="consultation-section-title">5. Skin Information</h2>
            <div className="form-grid">
              <div>
                <label>Skin Type</label>
                <select
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value)}
                >
                  <option value="oily">Oily</option>
                  <option value="dry">Dry</option>
                  <option value="combination">Combination</option>
                  <option value="sensitive">Sensitive</option>
                </select>
              </div>
              <div>
                <label>Age Range</label>
                <select
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                >
                  <option>Below 18</option>
                  <option>18-24</option>
                  <option>25-34</option>
                  <option>35-44</option>
                  <option>45+</option>
                </select>
              </div>
              <div className="form-grid-full">
                <label>Main Skin Concerns</label>
                <div className="concerns-grid">
                  {concernOptions.map((concern) => (
                    <button
                      key={concern}
                      className={`select-card ${skinConcerns.includes(concern) ? "active" : ""}`}
                      onClick={() => toggleConcern(concern)}
                    >
                      {concern}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-grid-full">
                <label>Allergies or Sensitivities</label>
                <textarea
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                />
              </div>
              <div className="form-grid-full">
                <label>Current Skincare Routine</label>
                <textarea
                  value={routine}
                  onChange={(e) => setRoutine(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="consultation-panel">
            <h2 className="consultation-section-title">6. Upload Images</h2>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
            <div className="image-list">
              {files.map((file) => (
                <div className="image-item" key={file.name + file.size}>
                  <span>{file.name}</span>
                  <span>{Math.round(file.size / 1024)} KB</span>
                </div>
              ))}
            </div>

            <h2
              className="consultation-section-title"
              style={{ marginTop: 16 }}
            >
              7. Payment Method
            </h2>
            <div className="payment-grid">
              {catalog.payment_methods.map((method) => (
                <button
                  key={method}
                  className={`select-card ${selectedPaymentMethod === method ? "active" : ""}`}
                  onClick={() => setSelectedPaymentMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>

            <h2
              className="consultation-section-title"
              style={{ marginTop: 16 }}
            >
              8. Confirmation
            </h2>
            <div className="booking-summary">
              <p>
                <strong>Service:</strong> {selectedService?.name || "-"}
              </p>
              <p>
                <strong>Date & Time:</strong> {selectedDate || "-"}{" "}
                {selectedTime || ""}
              </p>
              <p>
                <strong>Mode:</strong> {selectedMode}
              </p>
              <p>
                <strong>Payment:</strong> {selectedPaymentMethod}
              </p>
              <p>
                <strong>Amount:</strong> NPR{" "}
                {formatAmount(selectedService?.price)}
              </p>
            </div>
            <div className="booking-actions">
              <button
                className="primary-btn"
                disabled={submitting}
                onClick={handleBookConsultation}
              >
                {submitting ? "Processing..." : "Confirm Booking"}
              </button>
            </div>
            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}
          </div>
        </section>

        <section className="consultation-panel" style={{ marginTop: 20 }}>
          <h2 className="consultation-section-title">
            My Consultation Dashboard
          </h2>
          {loadingAppointments ? (
            <p className="info-text">Loading your sessions...</p>
          ) : appointments.length === 0 ? (
            <p className="info-text">No consultations booked yet.</p>
          ) : (
            <div className="appointments-list">
              {appointments.map((appointment) => (
                <div className="appointment-card" key={appointment.id}>
                  <div className="appointment-card-header">
                    <div>
                      <h3>{appointment.service?.name}</h3>
                      <p className="info-text">
                        Expert: {appointment.expert?.name} |{" "}
                        {appointment.appointment_date}{" "}
                        {appointment.appointment_time}
                      </p>
                      <p className="info-text">
                        Mode: {appointment.consultation_mode} | Room ID:{" "}
                        {appointment.room_id || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`badge ${String(appointment.status || "").toLowerCase()}`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  </div>

                  <div className="booking-actions">
                    {appointment.join_url &&
                      appointment.status !== "Completed" &&
                      appointment.status !== "Cancelled" && (
                        <button
                          className="primary-btn"
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
                      <>
                        <button
                          className="secondary-btn"
                          onClick={() => handleReschedule(appointment.id)}
                        >
                          Reschedule
                        </button>
                        <button
                          className="danger-btn"
                          onClick={() =>
                            handleCancelAppointment(appointment.id)
                          }
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>

                  {appointment.consultation_notes && (
                    <div className="booking-summary" style={{ marginTop: 10 }}>
                      <strong>Expert Notes:</strong>
                      <p>{appointment.consultation_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ConsultationBooking;
