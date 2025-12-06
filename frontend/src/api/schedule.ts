import api from "./axios"
import { type TimeWindow, type BlockedTime, type Reservation } from "./types"
const BASE_URL = "/api/schedules";
const BACKEND_URL = "http://localhost:8000";


export const EXPORT_SCHEDULE_URL = `${BACKEND_URL}${BASE_URL}/export/`;


export const schedulesAPI = {
  getCalendar: () => api.get(`${BASE_URL}/calendar/`),

  getTimeWindows: () =>
    api.get<TimeWindow[]>(`${BASE_URL}/windows/`),

  createTimeWindow: (data: Omit<TimeWindow, "id">) =>
    api.post<TimeWindow>(`${BASE_URL}/windows/create/`, data),

  updateTimeWindow: (id: number, data: Partial<TimeWindow>) =>
    api.put<TimeWindow>(`${BASE_URL}/windows/${id}/update/`, data),

  deleteTimeWindow: (id: number) =>
    api.delete(`${BASE_URL}/windows/${id}/delete/`),

  getBlockedTimes: () =>
    api.get<BlockedTime[]>(`${BASE_URL}/blocks/`),

  createBlockedTime: (data: Omit<BlockedTime, "id">) =>
    api.post<BlockedTime>(`${BASE_URL}/blocks/create/`, data),

  updateBlockedTime: (id: number, data: Partial<BlockedTime>) =>
    api.put<BlockedTime>(`${BASE_URL}/blocks/${id}/update/`, data),

  deleteBlockedTime: (id: number) =>
    api.delete(`${BASE_URL}/blocks/${id}/delete/`),

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