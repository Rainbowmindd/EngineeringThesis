import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Check, X, Clock3, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { lecturerReservationsAPI } from '@/api/schedule';
import type { LecturerReservation, ReservationStatistics } from '@/api/types';

const LecturerReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<LecturerReservation[]>([]);
  const [statistics, setStatistics] = useState<ReservationStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'completed' | 'rejected'>('pending');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch reservations
  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await lecturerReservationsAPI.getReservations();
      setReservations(response.data);
    } catch (err: any) {
      console.error('Error fetching reservations:', err);
      setError(err.response?.data?.detail || 'Błąd pobierania rezerwacji');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await lecturerReservationsAPI.getStatistics();
      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchStatistics();
  }, []);

  // Accept reservation
  const handleApprove = async (id: number) => {
    if (!confirm('Czy na pewno chcesz zaakceptować tę rezerwację?')) return;

    try {
      await lecturerReservationsAPI.acceptReservation(id);
      alert('Rezerwacja została zaakceptowana!');
      fetchReservations();
      fetchStatistics();
    } catch (err: any) {
      console.error('Error accepting reservation:', err);
      alert(err.response?.data?.detail || 'Błąd przy akceptacji rezerwacji');
    }
  };

  // Reject reservation
  const handleReject = async (id: number) => {
    setSelectedReservationId(id);
    setRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedReservationId) return;

    try {
      await lecturerReservationsAPI.rejectReservation(selectedReservationId, rejectionReason);
      alert('Rezerwacja została odrzucona');
      setRejectModalOpen(false);
      setRejectionReason('');
      setSelectedReservationId(null);
      fetchReservations();
      fetchStatistics();
    } catch (err: any) {
      console.error('Error rejecting reservation:', err);
      alert(err.response?.data?.detail || 'Błąd przy odrzuceniu rezerwacji');
    }
  };

  // Filter reservations by status
  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const acceptedReservations = reservations.filter(r => r.status === 'accepted');
  const completedReservations = reservations.filter(r => r.status === 'completed');
  const rejectedReservations = reservations.filter(r => r.status === 'rejected');

  // Format date and time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    return Math.round(durationMs / (1000 * 60)); // minutes
  };

  // Reservation Card Component
  const ReservationCard: React.FC<{ reservation: LecturerReservation; showActions?: boolean }> = ({
    reservation,
    showActions = false
  }) => {
    const getBorderColor = () => {
      switch (reservation.status) {
        case 'pending': return 'border-l-yellow-500';
        case 'accepted': return 'border-l-green-500';
        case 'rejected': return 'border-l-red-500';
        default: return 'border-l-gray-500';
      }
    };

    const getBadgeColor = () => {
      switch (reservation.status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'accepted': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getStatusIcon = () => {
      switch (reservation.status) {
        case 'pending': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
        case 'accepted': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
        case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
        default: return null;
      }
    };

    return (
      <div className={`bg-white border-l-4 rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 ${getBorderColor()}`}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900">{reservation.student_name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor()}`}>
                  {reservation.status_display}
                </span>
              </div>
              <p className="text-sm text-gray-600">{reservation.student_email}</p>
            </div>
            {getStatusIcon()}
          </div>

          {/* Details */}
          <div>
            <p className="font-medium text-gray-900 mb-2">{reservation.slot.subject}</p>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(reservation.slot.start_time)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>
                  {formatTime(reservation.slot.start_time)} - {formatTime(reservation.slot.end_time)}
                  ({calculateDuration(reservation.slot.start_time, reservation.slot.end_time)} min)
                </span>
              </div>
              <div className="flex items-center space-x-2 col-span-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{reservation.slot.meeting_location}</span>
              </div>
            </div>
          </div>

          {/* Topic/Notes */}
          {reservation.topic && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Temat: </span>
                {reservation.topic}
              </p>
            </div>
          )}

          {/* Rejection reason */}
          {reservation.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <span className="font-medium">Powód odrzucenia: </span>
                {reservation.rejection_reason}
              </p>
            </div>
          )}

          {/* Actions */}
          {showActions && reservation.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center"
                onClick={() => handleApprove(reservation.id)}
              >
                <Check className="h-4 w-4 mr-2" />
                Akceptuj
              </button>
              <button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center"
                onClick={() => handleReject(reservation.id)}
              >
                <X className="h-4 w-4 mr-2" />
                Odrzuć
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Stats Card Component
  const StatsCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    bgColor: string;
    iconBg: string;
    iconColor: string;
  }> = ({ title, value, icon, bgColor, iconBg, iconColor }) => (
    <div className={`bg-gradient-to-br ${bgColor} rounded-lg shadow-sm p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie rezerwacji...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer">
              K
            </div>
            <span className="text-xl font-bold text-gray-900">Zarządzanie Rezerwacjami</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/lecturer" className="text-gray-600 hover:text-gray-900 transition-colors">
              Moje sloty
            </a>
            <a href="/lecturer/calendar" className="text-gray-600 hover:text-gray-900 transition-colors">
              Kalendarz
            </a>
            <a href="/lecturer/reservations" className="text-green-600 font-medium">
              Rezerwacje
            </a>
          </nav>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Wyloguj
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Zarządzaj rezerwacjami</h1>
          <p className="text-gray-600">Akceptuj lub odrzucaj rezerwacje studentów</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        {statistics && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Oczekujące"
              value={statistics.pending}
              icon={<Clock3 className="h-6 w-6" />}
              bgColor="from-yellow-50 to-white"
              iconBg="bg-yellow-100"
              iconColor="text-yellow-600"
            />
            <StatsCard
              title="Zaakceptowane"
              value={statistics.accepted}
              icon={<CheckCircle2 className="h-6 w-6" />}
              bgColor="from-green-50 to-white"
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />
            <StatsCard
              title="Zakończone"
              value={statistics.completed}
              icon={<Check className="h-6 w-6" />}
              bgColor="from-gray-50 to-white"
              iconBg="bg-gray-100"
              iconColor="text-gray-600"
            />
            <StatsCard
              title="Odrzucone"
              value={statistics.rejected}
              icon={<XCircle className="h-6 w-6" />}
              bgColor="from-red-50 to-white"
              iconBg="bg-red-100"
              iconColor="text-red-600"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="space-y-6">
          {/* Tab List */}
          <div className="bg-white rounded-lg p-1 shadow-sm grid grid-cols-4 gap-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Oczekujące ({pendingReservations.length})
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'accepted'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Zaakceptowane ({acceptedReservations.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Zakończone ({completedReservations.length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'rejected'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Odrzucone ({rejectedReservations.length})
            </button>
          </div>

          {/* Tab Content - Pending */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingReservations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <p className="text-center text-gray-600">Brak oczekujących rezerwacji</p>
                </div>
              ) : (
                pendingReservations.map(reservation => (
                  <ReservationCard key={reservation.id} reservation={reservation} showActions={true} />
                ))
              )}
            </div>
          )}

          {/* Tab Content - Accepted */}
          {activeTab === 'accepted' && (
            <div className="space-y-4">
              {acceptedReservations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <p className="text-center text-gray-600">Brak zaakceptowanych rezerwacji</p>
                </div>
              ) : (
                acceptedReservations.map(reservation => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))
              )}
            </div>
          )}

          {/* Tab Content - Completed */}
          {activeTab === 'completed' && (
            <div className="space-y-4">
              {completedReservations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <p className="text-center text-gray-600">Brak zakończonych rezerwacji</p>
                </div>
              ) : (
                completedReservations.map(reservation => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))
              )}
            </div>
          )}

          {/* Tab Content - Rejected */}
          {activeTab === 'rejected' && (
            <div className="space-y-4">
              {rejectedReservations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <p className="text-center text-gray-600">Brak odrzuconych rezerwacji</p>
                </div>
              ) : (
                rejectedReservations.map(reservation => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Odrzucenie rezerwacji</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Podaj powód odrzucenia (opcjonalnie)..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex gap-2">
              <button
                onClick={confirmReject}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Potwierdź odrzucenie
              </button>
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectionReason('');
                  setSelectedReservationId(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerReservationsPage;