import api from "./axios"
import { type TimeWindow, type BlockedTime, type Reservation } from "./types"
const BASE_URL = "/api/schedules";
const BACKEND_URL = "http://localhost:8000";

// --- EKSPORT URL DO CSV ---
export const EXPORT_SCHEDULE_URL = `${BACKEND_URL}${BASE_URL}/export/`;


// --- GLÓWNY OBIEKT API ---

export const schedulesAPI = {
  // Aktualizujemy ścieżkę do konwencji /schedules
  getCalendar: () => api.get(`${BASE_URL}/calendar/`),

  getTimeWindows: () =>
    api.get<TimeWindow[]>(`${BASE_URL}/windows/`), // np. /api/schedules/windows/

  createTimeWindow: (data: Omit<TimeWindow, "id">) =>
    api.post<TimeWindow>(`${BASE_URL}/windows/create/`, data), // np. /api/schedules/windows/create/

  updateTimeWindow: (id: number, data: Partial<TimeWindow>) =>
    api.put<TimeWindow>(`${BASE_URL}/windows/${id}/update/`, data), // NOWY, oparty na poprzednich funkcjach

  deleteTimeWindow: (id: number) =>
    api.delete(`${BASE_URL}/windows/${id}/delete/`), // np. /api/schedules/windows/1/delete/

  getBlockedTimes: () =>
    api.get<BlockedTime[]>(`${BASE_URL}/blocks/`), // np. /api/schedules/blocks/

  createBlockedTime: (data: Omit<BlockedTime, "id">) =>
    api.post<BlockedTime>(`${BASE_URL}/blocks/create/`, data), // np. /api/schedules/blocks/create/

  updateBlockedTime: (id: number, data: Partial<BlockedTime>) =>
    api.put<BlockedTime>(`${BASE_URL}/blocks/${id}/update/`, data), // NOWY, oparty na poprzednich funkcjach

  deleteBlockedTime: (id: number) =>
    api.delete(`${BASE_URL}/blocks/${id}/delete/`), // np. /api/schedules/blocks/1/delete/

  // =======================================================
  // 4. REZERWACJE (RESERVATIONS)
  // =======================================================

  // Zakładamy, że ten endpoint filtruje dla prowadzącego
  getReservations: () =>
    api.get<Reservation[]>(`${BASE_URL}/reservations/lecturer/`),


  importSchedule: (data: FormData) =>
    api.post(`${BASE_URL}/import/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const exportScheduleCSV=async () =>{
  const response = await api.get(EXPORT_SCHEDULE_URL, {
    responseType: 'blob' });
  return response.data;
}