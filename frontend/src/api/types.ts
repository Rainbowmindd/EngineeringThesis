interface Consulation {
    id: number;
    professor: string;
    subject: string;
    date: string;
    time: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    location: string;

}

// interface Reservation {
//     id: number;
//     professor: string;
//     subject: string;
//     date: string;
//     status: 'active' | 'completed' | 'cancelled'
// }

interface CalendarDay {
    day: number;
    weekday: string;
    hasEvent: boolean;
}


export interface TimeWindow {
  id: number;
  start_time: string;
  end_time: string;
  meeting_location: string;
  max_attendees: number;
  is_active: boolean;
  reservations_count?: number;
  lecturer_details?: string;
  subject?: string;
}

export interface BlockedTime {
  id: number
  start_time: string
  end_time: string
  reason: string
}

export interface Reservation {
  id: number
  start_time: string
  status: "confirmed" | "pending" | "completed"
  student_name?: string
}

// ui only
export interface Consultaiton {
    id: number
  professor: string
  subject: string
  date: string
  time: string
  status: "confirmed" | "pending" | "cancelled"
  location: string
}