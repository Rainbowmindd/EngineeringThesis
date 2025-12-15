import api from "./axios"

const BASE_URL = "/api/admin"

// =========================
// TYPES
// =========================
export interface AdminStats {
  active_users: number
  total_lecturers: number
  total_reservations: number
  average_rating: number
}

export interface AdminLecturer {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name?: string
  role: string
  is_active: boolean
  date_joined: string
  consultations_count: number
  department?: string
}

export interface AdminStudent {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name?: string
  role: string
  is_active: boolean
  date_joined: string
  reservations_count: number
}

export interface AdminReservation {
  id: number
  student: number
  student_name: string
  time_window: number
  lecturer_name: string
  start_time: string
  status: "confirmed" | "pending" | "completed" | "cancelled"
  created_at: string
}

export interface SystemLog {
  id: number
  action: string
  user: string
  timestamp: string
  status: "success" | "warning" | "error"
}

export interface SystemHealth {
  uptime: number
  response_time: number
  active_connections: number
}

// =========================
// API FUNCTIONS
// =========================
export const adminAPI = {
  // Stats
  getStats: () =>
    api.get<AdminStats>(`${BASE_URL}/stats/`),

  // Lecturers
  getLecturers: () =>
    api.get<AdminLecturer[]>(`${BASE_URL}/lecturers/`),

  getLecturer: (id: number) =>
    api.get<AdminLecturer>(`${BASE_URL}/lecturers/${id}/`),

  createLecturer: (data: any) =>
    api.post<AdminLecturer>(`${BASE_URL}/lecturers/`, data),

  updateLecturer: (id: number, data: any) =>
    api.put<AdminLecturer>(`${BASE_URL}/lecturers/${id}/`, data),

  deleteLecturer: (id: number) =>
    api.delete(`${BASE_URL}/lecturers/${id}/`),

  toggleLecturerStatus: (id: number) =>
    api.patch(`${BASE_URL}/lecturers/${id}/toggle-status/`),

  // Students
  getStudents: () =>
    api.get<AdminStudent[]>(`${BASE_URL}/students/`),

  getStudent: (id: number) =>
    api.get<AdminStudent>(`${BASE_URL}/students/${id}/`),

  createStudent: (data: any) =>
    api.post<AdminStudent>(`${BASE_URL}/students/`, data),

  updateStudent: (id: number, data: any) =>
    api.put<AdminStudent>(`${BASE_URL}/students/${id}/`, data),

  deleteStudent: (id: number) =>
    api.delete(`${BASE_URL}/students/${id}/`),

  toggleStudentStatus: (id: number) =>
    api.patch(`${BASE_URL}/students/${id}/toggle-status/`),

  // Reservations
  getReservations: () =>
    api.get<AdminReservation[]>(`${BASE_URL}/reservations/`),

  getReservation: (id: number) =>
    api.get<AdminReservation>(`${BASE_URL}/reservations/${id}/`),

  updateReservationStatus: (id: number, status: string) =>
    api.patch(`${BASE_URL}/reservations/${id}/`, { status }),

  deleteReservation: (id: number) =>
    api.delete(`${BASE_URL}/reservations/${id}/`),

  // System
  getLogs: (params?: any) =>
    api.get<SystemLog[]>(`${BASE_URL}/logs/`, { params }),

  getSystemHealth: () =>
    api.get<SystemHealth>(`${BASE_URL}/system/health/`),
}