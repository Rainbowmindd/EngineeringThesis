// ============= GENERAL TYPES =============

interface Consultation {
  id: number;
  professor: string;
  subject: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  location: string;
}

export interface CalendarDay {
  day: number;
  weekday: string;
  hasEvent: boolean;
}

// ============= SCHEDULE TYPES =============

export interface TimeWindow {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  meeting_location?: string;
  max_attendees: number;
  is_active: boolean;
  subject?: string;
}

export interface BlockedTime {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
}

export interface ScheduleItem {
  id: number;
  subject: string;
  day: string;
  time: string;
  location?: string;
  user?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleItemCreate {
  subject: string;
  day: string;
  time: string;
  location?: string;
}

export interface ScheduleUploadResponse {
  message: string;
  items: ScheduleItem[];
  errors?: string[];
}

// ============= ATTACHMENT TYPES =============

export interface AttachmentInfo {
  name: string;
  size: number;
  url: string;
}

// ============= RESERVATION TYPES =============

// Student Reservation (basic)
export interface Reservation {
  id: number;
  start_time: string;
  status: "Confirmed" | "Pending" | "Completed";
  student_name?: string;
  subject?: string;
  // NOWE POLA:
  student_notes?: string;
  student_attachment?: string;  // URL do pliku
  student_attachment_url?: string;
  lecturer_notes?: string;
  lecturer_attachment?: string;  // URL do pliku
  lecturer_attachment_url?: string;
  rejection_reason?: string;
}

// UI only
export interface Consultaiton {
  id: number;
  professor: string;
  subject: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled";
  location: string;
}

// ============= LECTURER RESERVATION TYPES =============

export interface SlotDetails {
  id: number;
  start_time: string;
  end_time: string;
  lecturer_details: string;
  lecturer_email: string;
  subject: string;
  meeting_location: string;
  max_attendees: number;
  reservations_count: number;
  accepted_reservations_count: number;
  is_active: boolean;
}

export interface LecturerReservation {
  id: number;
  slot: SlotDetails;
  student: number;
  student_name: string;
  student_email: string;
  topic: string;
  // NOWE POLA:
  student_notes?: string;
  student_attachment?: string;  // URL do pliku
  student_attachment_url?: string;
  lecturer_notes?: string;
  lecturer_attachment?: string;  // URL do pliku
  lecturer_attachment_url?: string;
  // ISTNIEJĄCE:
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed' | 'no_show_student' | 'no_show_lecturer';
  status_display: string;
  rejection_reason: string | null;
  booked_at: string;
  updated_at: string;
  accepted_at: string | null;
  accepted_by: number | null;
}

export interface ReservationStatistics {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  cancelled: number;
  completed: number;
  no_show_student: number;
  no_show_lecturer: number;
}

// ============= CREATE/UPDATE TYPES =============

export interface CreateReservationData {
  slot_id: number;
  topic?: string;
  student_notes?: string;
  student_attachment?: File;
}

export interface UpdateReservationData {
  topic?: string;
  student_notes?: string;
  student_attachment?: File;
}

export interface AddLecturerNotesData {
  lecturer_notes?: string;
  lecturer_attachment?: File;
}