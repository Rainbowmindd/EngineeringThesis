interface Consulation {
    id: number;
    professor: string;
    subject: string;
    date: string;
    time: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    location: string;
}

interface Reservation {
    id: number;
    professor: string;
    subject: string;
    date: string;
    status: 'active' | 'completed' | 'cancelled'
}

interface CalendarDay {
    day: number;
    weekday: string;
    hasEvent: boolean;
}