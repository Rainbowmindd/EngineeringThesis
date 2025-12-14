import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import { Card, CardContent } from "../ui/Card"
import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { Calendar, Clock, Users, MapPin, ChevronRight, Check, AlertCircle } from "lucide-react"

import Header from "../layout/Header"
import Footer from "../layout/Footer"

import { fetchUserProfile, type UserProfile } from "../../api/auth"
import { schedulesAPI } from "../../api/schedule"
import type { TimeWindow, Reservation } from "../../api/types"

export function StudentDashboard() {
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate())
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeWindow[]>([])
  const [myReservations, setMyReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      // Pobierz profil użytkownika
      const profile = await fetchUserProfile()
      setUserProfile(profile)

      // Pobierz dostępne sloty (time windows)
      const slotsResponse = await schedulesAPI.getTimeWindows()
      console.log("Dostępne sloty:", slotsResponse.data)
      setAvailableSlots(slotsResponse.data.filter(slot => slot.is_active))

      // Pobierz moje rezerwacje
      const reservationsResponse = await schedulesAPI.getReservations()
      console.log("Moje rezerwacje:", reservationsResponse.data)
      setMyReservations(reservationsResponse.data)
    } catch (error) {
      console.error("Błąd podczas pobierania danych:", error)
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // FILTER & TRANSFORM DATA
  // =========================

  // Nadchodzące konsultacje (potwierdzone rezerwacje)
  const upcomingConsultations = myReservations
    .filter(r => r.status === "confirmed" || r.status === "pending")
    .map(r => {
      // Znajdź slot dla tej rezerwacji
      const slot = availableSlots.find(s => s.id === r.id)
      return {
        id: r.id,
        start_time: r.start_time,
        status: r.status,
        student_name: r.student_name,
        slot: slot,
      }
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5) // Pokaż tylko 5 najbliższych

  // Dostępne sloty do zarezerwowania (tylko aktywne, z wolnymi miejscami)
  const availableReservations = availableSlots
    .filter(slot => {
      const hasSpace = (slot.reservations_count ?? 0) < slot.max_attendees
      const isFuture = new Date(slot.start_time) > new Date()
      return hasSpace && isFuture
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 6) // Pokaż 6 najbliższych dostępnych

  // Kalendarz - dni z wydarzeniami
  const today = new Date()
  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    const dayNumber = date.getDate()
    const hasEvent = upcomingConsultations.some(c =>
      new Date(c.start_time).getDate() === dayNumber
    )

    return {
      day: dayNumber,
      weekday: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"][date.getDay()],
      hasEvent,
      fullDate: date,
    }
  })

  // Konsultacje na wybrany dzień
  const consultationsOnSelectedDate = upcomingConsultations.filter(c =>
    new Date(c.start_time).getDate() === selectedDate
  )

  // Stats
  const stats = {
    upcoming: upcomingConsultations.length,
    completed: myReservations.filter(r => r.status === "completed").length,
    // TODO: policzy unikalnych wykładowców gdy backend będzie zwracał te dane
    lecturers: new Set(availableSlots.map(s => s.lecturer_details)).size,
  }

  // =========================
  // HELPERS
  // =========================
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pl-PL', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toTimeString().slice(0, 5)
  }

  const getRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return "Dziś"
    if (date.toDateString() === tomorrow.toDateString()) return "Jutro"

    const daysOfWeek = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"]
    return daysOfWeek[date.getDay()]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie danych...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Witaj, <span className="text-green-600">
              {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : "Student"}
            </span>!
          </h1>
          <p className="text-gray-600">Zarządzaj swoimi konsultacjami i rezerwacjami w jednym miejscu</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Zaplanowane konsultacje</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Twoi wykładowcy</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.lecturers}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Zrealizowane konsultacje</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Check className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main grid: consultations + calendar */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming consultations */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Najbliższe konsultacje</h2>
                <Link to="/student/reservations" className="text-green-600 hover:text-green-700 flex items-center space-x-1 text-sm font-medium">
                  <span>Zobacz wszystkie</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {upcomingConsultations.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Nie masz jeszcze żadnych zaplanowanych konsultacji</p>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Zarezerwuj konsultację
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingConsultations.map((consultation) => {
                    const slot = consultation.slot
                    if (!slot) return null

                    return (
                      <Card key={consultation.id} className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900">
                                  {slot.lecturer_details || "Wykładowca"}
                                </h3>
                                <Badge className={
                                  consultation.status === "confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-orange-100 text-orange-800"
                                }>
                                  {consultation.status === "confirmed" ? "Potwierdzone" : "Oczekujące"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{slot.subject || "Konsultacje"}</p>
                              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(consultation.start_time)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatTime(consultation.start_time)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{slot.meeting_location}</span>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                                Szczegóły
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Available Reservations */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Dostępne rezerwacje</h2>

              {availableReservations.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 text-center text-gray-600">
                    Brak dostępnych slotów w najbliższym czasie
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {availableReservations.map((slot) => (
                    <Card key={slot.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {slot.lecturer_details || "Wykładowca"}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">{slot.subject || "Konsultacje"}</p>
                            <div className="space-y-1 mb-3">
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>{getRelativeDate(slot.start_time)}, {formatTime(slot.start_time)}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{slot.meeting_location}</span>
                              </div>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">
                              {slot.max_attendees - (slot.reservations_count ?? 0)} miejsc dostępnych
                            </Badge>
                          </div>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white mt-4 w-full">
                            Zarezerwuj
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Calendar */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Kalendarz</h2>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      {new Date().toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost">←</Button>
                      <Button size="sm" variant="ghost">→</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(day.day)}
                        className={`flex flex-col items-center py-3 rounded-lg transition-all ${
                          selectedDate === day.day 
                            ? "bg-green-600 text-white" 
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <span className={`text-xs font-medium mb-1 ${
                          selectedDate === day.day ? "text-white" : "text-gray-600"
                        }`}>
                          {day.weekday}
                        </span>
                        <span className={`text-sm font-bold ${
                          selectedDate === day.day ? "text-white" : "text-gray-900"
                        }`}>
                          {day.day}
                        </span>
                        {day.hasEvent && (
                          <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
                            selectedDate === day.day ? "bg-white" : "bg-orange-500"
                          }`} />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Konsultacje: {selectedDate} {new Date().toLocaleDateString('pl-PL', { month: 'long' })}
                    </h4>
                    <div className="space-y-2">
                      {consultationsOnSelectedDate.length === 0 ? (
                        <p className="text-sm text-gray-500">Brak konsultacji tego dnia</p>
                      ) : (
                        consultationsOnSelectedDate.map(c => {
                          const slot = c.slot
                          if (!slot) return null

                          return (
                            <div key={c.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-sm font-medium text-gray-900">
                                {formatTime(c.start_time)} - {slot.lecturer_details || "Wykładowca"}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">{slot.subject || "Konsultacje"}</p>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}