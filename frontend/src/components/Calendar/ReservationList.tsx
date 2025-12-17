import { Calendar, Clock, CheckCircle, User } from "lucide-react";
import { type Reservation } from "../../api/types";

interface Props {
  reservations: Reservation[];
}

export default function ReservationList({ reservations }: Props) {
  // Sortuj rezerwacje po dacie (jeśli masz datę w start_time)
  const sortedReservations = [...reservations].sort((a, b) => {
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Rezerwacje</h2>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          {reservations.length}
        </span>
      </div>

      <div className="space-y-3">
        {sortedReservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-600 font-medium">Brak rezerwacji</p>
                <p className="text-sm text-gray-500 mt-1">
                  Studenci mogą zarezerwować dostępne terminy
                </p>
              </div>
            </div>
          </div>
        ) : (
          sortedReservations.map((r) => {
            // Parsuj start_time - może być datetime lub osobne pola
            let displayDate = '';
            let displayTime = '';

            if (r.start_time.includes('T')) {
              // Format datetime: "2025-01-15T10:00:00"
              const [date, time] = r.start_time.split('T');
              displayDate = date;
              displayTime = time.substring(0, 5);
            } else {
              // Jeśli API zwraca osobne pola (starszy format)
              displayDate = r.date || r.start_time.split(' ')[0];
              displayTime = r.time || r.start_time.split(' ')[1]?.substring(0, 5) || '';
            }

            // Status badge
            const statusConfig = {
              Confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Potwierdzone', border: 'border-green-500' },
              Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Oczekujące', border: 'border-yellow-500' },
              Completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Zakończone', border: 'border-blue-500' }
            };

            const config = statusConfig[r.status] || statusConfig.Pending;

            return (
              <div
                key={r.id}
                className={`bg-white border-l-4 ${config.border} rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Student name */}
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <p className="font-semibold text-gray-900">
                        {r.student_name || 'Student'}
                      </p>
                      <span className={`px-2 py-1 ${config.bg} ${config.text} rounded text-xs font-medium`}>
                        {config.label}
                      </span>
                    </div>

                    {/* Subject (jeśli jest) */}
                    {r.subject && (
                      <p className="text-sm text-gray-600 mb-2">{r.subject}</p>
                    )}

                    {/* Date and Time */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {displayDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {displayTime}
                      </span>
                    </div>
                  </div>

                  {/* Status Icon */}
                  {r.status === "Confirmed" && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-2 flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      {reservations.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {reservations.filter(r => r.status === 'Confirmed').length}
              </p>
              <p className="text-xs text-gray-600">Potwierdzone</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {reservations.filter(r => r.status === 'Pending').length}
              </p>
              <p className="text-xs text-gray-600">Oczekujące</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {reservations.filter(r => r.status === 'Completed').length}
              </p>
              <p className="text-xs text-gray-600">Zakończone</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}