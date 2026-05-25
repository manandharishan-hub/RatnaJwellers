import { apiGet, apiPost, apiPostFormData, apiPut, apiDelete, apiGetBlob } from "./api";

export const consultationAPI = {
  catalog: () => apiGet("/consultations/catalog"),
  availableDates: (expertId, daysAhead = 30) =>
    apiGet(
      `/consultations/available-dates?expert_id=${expertId}&days_ahead=${daysAhead}`,
    ),
  slots: (expertId, date, durationMinutes = 30) =>
    apiGet(
      `/consultations/slots?expert_id=${expertId}&date=${encodeURIComponent(date)}&duration_minutes=${durationMinutes}`,
    ),
  book: (formData) => apiPostFormData("/consultations/book", formData),
  mine: () => apiGet("/consultations/my"),
  exportMyReport: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiGetBlob(`/consultations/my/report${qs ? `?${qs}` : ""}`);
  },
  cancel: (consultationId) =>
    apiPost(`/consultations/${consultationId}/cancel`, {}),
  reschedule: (consultationId, payload) =>
    apiPost(`/consultations/${consultationId}/reschedule`, payload),

  // Admin — appointments
  adminList: (status) =>
    apiGet(`/consultations/admin${status ? `?status=${status}` : ""}`),
  addNotes: (consultationId, consultationNotes) =>
    apiPost(`/consultations/admin/${consultationId}/notes`, {
      consultation_notes: consultationNotes,
    }),
  markComplete: (consultationId) =>
    apiPost(`/consultations/admin/${consultationId}/complete`, {}),
  assignSlot: (consultationId, payload) =>
    apiPost(`/consultations/admin/${consultationId}/assign-slot`, payload),

  // Admin — services
  adminServices: () => apiGet("/consultations/admin/services"),
  adminCreateService: (data) => apiPost("/consultations/admin/services", data),
  adminUpdateService: (id, data) =>
    apiPut(`/consultations/admin/services/${id}`, data),
  adminDeleteService: (id) => apiDelete(`/consultations/admin/services/${id}`),

  // Admin — experts
  adminExperts: () => apiGet("/consultations/admin/experts"),
  adminCreateExpert: (data) => apiPost("/consultations/admin/experts", data),
  adminUpdateExpert: (id, data) =>
    apiPut(`/consultations/admin/experts/${id}`, data),
  adminDeleteExpert: (id) => apiDelete(`/consultations/admin/experts/${id}`),
  adminExpertDates: (expertId) =>
    apiGet(`/consultations/admin/experts/${expertId}/dates`),
  adminCreateExpertDate: (expertId, data) =>
    apiPost(`/consultations/admin/experts/${expertId}/dates`, data),
  adminUpdateExpertDate: (expertId, dateId, data) =>
    apiPut(`/consultations/admin/experts/${expertId}/dates/${dateId}`, data),
  adminDeleteExpertDate: (expertId, dateId) =>
    apiDelete(`/consultations/admin/experts/${expertId}/dates/${dateId}`),
};
