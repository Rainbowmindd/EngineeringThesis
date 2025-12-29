import api from "./axios"
import {
  type TimeWindow,
  type BlockedTime,
  type Reservation,
  type ScheduleItem,
  type ScheduleItemCreate,
  type ScheduleUploadResponse,
  type LecturerReservation,
  type ReservationStatistics
} from "./types"

const BASE_URL = "/api/schedules";
const BACKEND_URL = "http://localhost:8000";

export const EXPORT_SCHEDULE_URL = `${BACKEND_URL}${BASE_URL}/export/`;

// ============= SCHEDULES API =============

export const schedulesAPI = {
  // Sloty dla prowadzącego
  getLecturerSlots: () =>
    api.get<TimeWindow[]>(`${BASE_URL}/lecturer-slots`),

  createLecturerSlot: (data: Omit<TimeWindow, "id">) =>
    api.post<TimeWindow>(`${BASE_URL}/lecturer-slots/`, data),

  updateLecturerSlot: (id: number, data: Partial<TimeWindow>) =>
    api.put<TimeWindow>(`${BASE_URL}/lecturer-slots/${id}/`, data),

  deactivateLecturerSlot: (id: number) =>
    api.post(`${BASE_URL}/lecturer-slots/${id}/deactivate/`),

  // Kalendarz prowadzącego - przedziały/okna dostępności
  getTimeWindows: () =>
    api.get<TimeWindow[]>(`${BASE_URL}/calendar/time-windows/`),

  createTimeWindow: (data: Omit<TimeWindow, "id">) =>
    api.post<TimeWindow>(`${BASE_URL}/calendar/time-windows/`, data),

  updateTimeWindow: (id: number, data: Partial<TimeWindow>) =>
    api.put<TimeWindow>(`${BASE_URL}/calendar/time-windows/${id}/`, data),

  deleteTimeWindow: (id: number) =>
    api.delete(`${BASE_URL}/calendar/time-windows/${id}/`),

  bulkCreateTimeWindows: (data: any[]) =>
    api.post(`${BASE_URL}/calendar/time-windows/bulk_create/`, data),

  // Zablokowane okresy
  getBlockedTimes: () =>
    api.get<BlockedTime[]>(`${BASE_URL}/calendar/blocked-times/`),

  createBlockedTime: (data: Omit<BlockedTime, "id">) =>
    api.post<BlockedTime>(`${BASE_URL}/calendar/blocked-times/`, data),

  updateBlockedTime: (id: number, data: Partial<BlockedTime>) =>
    api.put<BlockedTime>(`${BASE_URL}/calendar/blocked-times/${id}/`, data),

  deleteBlockedTime: (id: number) =>
    api.delete(`${BASE_URL}/calendar/blocked-times/${id}/`),

  // Public
  getPublicSlots: () =>
    api.get("/api/schedules/public-available-slots/"),

  // Import
  importSchedule: (data: FormData) =>
    api.post(`${BASE_URL}/import/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // My Schedule
  getMySchedule: () =>
    api.get<ScheduleItem[]>(`${BASE_URL}/schedule/`),

  createScheduleItem: (data: ScheduleItemCreate) =>
    api.post<ScheduleItem>(`${BASE_URL}/schedule/`, data),

  updateScheduleItem: (id: number, data: Partial<ScheduleItemCreate>) =>
    api.patch<ScheduleItem>(`${BASE_URL}/schedule/${id}/`, data),

  deleteScheduleItem: (id: number) =>
    api.delete(`${BASE_URL}/schedule/${id}/`),

  uploadSchedule: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    return api.post<ScheduleUploadResponse>(`${BASE_URL}/schedule/upload/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },

  uploadGoogleCalendar: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    return api.post(`${BASE_URL}/schedule/upload_ics/`, formData)
  },
};

// Export
export const exportScheduleCSV = async () => {
  const response = await api.get(EXPORT_SCHEDULE_URL, {
    responseType: 'blob'
  });
  return response.data;
}

// ============= STUDENT RESERVATIONS API =============

export const reservationsAPI = {
  // Rezerwacja slotu
  reserveSlot: (slotId: number, topic?: string) =>
    api.post("/api/reservations/student/", {
      slot_id: slotId,
      topic: topic ?? "",
    }),

  // Lista swoich rezerwacji
  getMyReservations: () =>
    api.get<Reservation[]>("/api/reservations/student/"),

  // Anulowanie rezerwacji
  cancelReservation: (reservationId: number) =>
    api.post(`/api/reservations/student/${reservationId}/cancel/`),
}

// ============= LECTURER RESERVATIONS API =============

export const lecturerReservationsAPI = {
  // Lista wszystkich rezerwacji prowadzącego
  getReservations: (status?: string) => {
    const params = status ? { status } : {};
    return api.get<LecturerReservation[]>("/api/reservations/lecturer/", { params });
  },

  // Statystyki rezerwacji
  getStatistics: () =>
    api.get<ReservationStatistics>("/api/reservations/lecturer/statistics/"),

  // Akceptacja rezerwacji
  acceptReservation: (reservationId: number) =>
    api.post(`/api/reservations/lecturer/${reservationId}/accept/`),

  // Odrzucenie rezerwacji
  rejectReservation: (reservationId: number, reason?: string) =>
    api.post(`/api/reservations/lecturer/${reservationId}/reject/`, {
      reason: reason || "Brak podanego powodu"
    }),

  // Zmiana statusu (completed, no-show, etc.)
  updateStatus: (reservationId: number, status: string) =>
    api.post(`/api/reservations/lecturer/${reservationId}/update_status/`, {
      status
    }),
}