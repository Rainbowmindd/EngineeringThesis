import api from "./axios"
import apiClient from "./axios"
import { type TimeWindow, type BlockedTime, type Reservation, type ScheduleItem, type ScheduleItemCreate, type ScheduleUploadResponse } from "./types"
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
    api.delete(`${BASE_URL}/calendar/time-windows/${id}/`),
    bulkCreateTimeWindows: (data: any[]) =>
        api.post(`${BASE_URL}/calendar/time-windows/bulk_create/`, data),

    //zablokowane okresy
    getBlockedTimes: () =>
        api.get<BlockedTime[]>(`${BASE_URL}/calendar/blocked-times/`),

    createBlockedTime: (data: Omit<BlockedTime, "id">) =>
        api.post<BlockedTime>(`${BASE_URL}/calendar/blocked-times/`, data),
    updateBlockedTime: (id: number, data: Partial<BlockedTime>) =>
    api.put<BlockedTime>(`${BASE_URL}/calendar/blocked-times/${id}/`, data),

    deleteBlockedTime: (id: number) =>
        api.delete(`${BASE_URL}/calendar/blocked-times/${id}/`),

    //public
    getPublicSlots: () =>
        api.get("/api/schedules/public-available-slots/"),

    //import
  importSchedule: (data: FormData) =>
    api.post(`${BASE_URL}/import/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),


    // ============================================
    // PLAN ZAJĘĆ (Schedule Items)
    // ============================================

    /**
     * Get all schedule items for the current user
     */
    getMySchedule: () =>
        api.get<ScheduleItem[]>(`${BASE_URL}/schedule/`),

    /**
     * Create a new schedule item
     */
    createScheduleItem: (data: ScheduleItemCreate) =>
        api.post<ScheduleItem>(`${BASE_URL}/schedule/`, data),

    /**
     * Update an existing schedule item
     */
    updateScheduleItem: (id: number, data: Partial<ScheduleItemCreate>) =>
        api.patch<ScheduleItem>(`${BASE_URL}/schedule/${id}/`, data),

    /**
     * Delete a schedule item
     */
    deleteScheduleItem: (id: number) =>
        api.delete(`${BASE_URL}/schedule/${id}/`),

    /**
     * Upload CSV file with schedule
     */
    uploadSchedule: (file: File) => {
        const formData = new FormData()
        formData.append("file", file)

        return api.post<ScheduleUploadResponse>(`${BASE_URL}/schedule/upload/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
    },

    /**
     * Upload Google Calendar ICS file
     */
    uploadGoogleCalendar: (file: File) => {
        const formData = new FormData()
        formData.append("file", file)

        return api.post<ScheduleUploadResponse>(`${BASE_URL}/schedule/upload-ics/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
    },
};

//export
export const exportScheduleCSV = async () => {
  const response = await api.get(EXPORT_SCHEDULE_URL, {
    responseType: 'blob'
  });
  return response.data;
}