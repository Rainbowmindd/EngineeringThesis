import api from "./axios"
import { type TimeWindow, type BlockedTime, type Reservation } from "./types"
const BASE_URL = "/api/schedules";
const BACKEND_URL = "http://localhost:8000";


export const EXPORT_SCHEDULE_URL = `${BACKEND_URL}${BASE_URL}/export/`;


export const schedulesAPI = {
    //sloty dla prowadzacego
    getLecturerSlots: () =>
        api.get<TimeWindow[]>(`${BASE_URL}/lecturer-slots`),

    createLecturerSlot: (data: Omit<TimeWindow, "id">) =>
         api.post<TimeWindow>(`${BASE_URL}/lecturer-slots/`, data),
    updateLecturerSlot: (id: number, data: Partial<TimeWindow>) =>
        api.put<TimeWindow>(`${BASE_URL}/lecturer-slots/${id}/`, data),
    deactivateLecturerSlot: (id: number) =>
        api.post(`${BASE_URL}/lecturer-slots/${id}/deactivate/`),

    //kalendarz prowadzacego

    //przedzialy/okna dostepnosci
    getTimeWindows: () =>
        api.get<TimeWindow[]>(`${BASE_URL}/calendar/time-windows/`),

    createTimeWindow: (data: Omit<TimeWindow, "id">) =>
        api.post<TimeWindow>(`${BASE_URL}/calendar/time-windows/`, data),
    updateTimeWindow: (id: number, data: Partial<TimeWindow>) =>
        api.put<TimeWindow>(`${BASE_URL}/calendar/time-windows/${id}/`, data),

    deleteTimeWindow: (id: number) =>
        api.patch(`${BASE_URL}/calendar/time-windows/${id}/`,{
        is_active: false,
        }),

    //zablokowane okresy
    getBlockedTimes: () =>
        api.get<BlockedTime[]>(`${BASE_URL}/calendar/blocked-times/`),

    createBlockedTime: (data: Omit<BlockedTime, "id">) =>
        api.post<BlockedTime>(`${BASE_URL}/calendar/blocked-times/`, data),

    // //rezerwacje konsultacji
    // getReservations: () =>
    //     api.get<Reservation[]>(`${BASE_URL}/my-reservations/`),


    //public
    getPublicSlots: () =>
        api.get("/api/schedules/public-available-slots/"),

    //import
  importSchedule: (data: FormData) =>
    api.post(`${BASE_URL}/import/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};
//export
export const exportScheduleCSV=async () =>{
  const response = await api.get(EXPORT_SCHEDULE_URL, {
    responseType: 'blob' });
  return response.data;
}