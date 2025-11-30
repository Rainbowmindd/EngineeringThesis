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
  id: number
  day: string
  startTime: string
  endTime: string
  capacity: number
    is_recurring: boolean
    location: string
}

export interface BlockedTime {
  id: number
  date: string
  startTime: string
  endTime: string
  reason: string
}

export interface Reservation {
  id: number
  studentName: string
  subject: string
  date: string
  time: string
  status: "confirmed" | "pending" | "completed"
    startTime: string
}