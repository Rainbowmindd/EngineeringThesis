"use client"

import { useState } from "react"
import { Link } from "react-router-dom"

import { Card, CardContent } from "../ui/Card"
import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { Calendar, Clock, Users, MapPin, ChevronRight, Check } from "lucide-react"

import Header from "../layout/Header"
import Footer from "../layout/Footer"

export function StudentDashboard() {
  const [selectedDate, setSelectedDate] = useState<number>(15)

  // Sample data
  const upcomingConsultations = [
    { id: 1, professor: "dr. Anna Nowak", subject: "Matematyka dyskretna", date: "2024-12-15", time: "14:00", status: "confirmed", location: "Bud. A, pok. 215" },
    { id: 2, professor: "Prof. Jan Kowalski", subject: "Algorytmy i struktury danych", date: "2024-12-18", time: "10:30", status: "pending", location: "Bud. C, pok. 102" },
    { id: 3, professor: "dr. Piotr Wiśniewski", subject: "Bazy danych", date: "2024-12-20", time: "15:00", status: "confirmed", location: "Online" },
  ]

  const reservations = [
    { id: 1, professor: "dr. Maria Lewandowska", subject: "Systemy operacyjne", date: "Jutro, 09:00", status: "available" },
    { id: 2, professor: "dr. Katarzyna Szymańska", subject: "Programowanie obiektowe", date: "Wtorek, 11:00", status: "available" },
    { id: 3, professor: "Prof. Tadeusz Nowak", subject: "Sieci komputerowe", date: "Środa, 16:00", status: "reserved" },
  ]

  const calendarDays = Array.from({ length: 7 }, (_, i) => ({
    day: i + 13,
    weekday: ["Pt", "Sb", "Nd", "Pn", "Wt", "Sr", "Cz"][i],
    hasEvent: i === 2 || i === 5,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Witaj, <span className="text-green-600">Jan</span>!
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
                  <p className="text-3xl font-bold text-gray-900">{upcomingConsultations.length}</p>
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
                  <p className="text-3xl font-bold text-gray-900">{0}</p>
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
                  <p className="text-3xl font-bold text-gray-900">12</p>
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
                <Link to="#" className="text-green-600 hover:text-green-700 flex items-center space-x-1 text-sm font-medium">
                  <span>Zobacz wszystkie</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {upcomingConsultations.map((consultation) => (
                  <Card key={consultation.id} className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{consultation.professor}</h3>
                            <Badge variant="secondary" className={consultation.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                              {consultation.status === "confirmed" ? "Potwierdzone" : "Oczekujące"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{consultation.subject}</p>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            <div className="flex items-center space-x-1"><Calendar className="h-4 w-4" /><span>{consultation.date}</span></div>
                            <div className="flex items-center space-x-1"><Clock className="h-4 w-4" /><span>{consultation.time}</span></div>
                            <div className="flex items-center space-x-1"><MapPin className="h-4 w-4" /><span>{consultation.location}</span></div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent">
                            Szczegóły
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Available Reservations */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Dostępne rezerwacje</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {reservations.map((reservation) => (
                  <Card key={reservation.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{reservation.professor}</h3>
                          <p className="text-sm text-gray-600 mb-2">{reservation.subject}</p>
                          <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
                            <Clock className="h-4 w-4" />
                            <span>{reservation.date}</span>
                          </div>
                          {reservation.status === "available" && <Badge variant="secondary" className="bg-blue-100 text-blue-800">Dostępne</Badge>}
                        </div>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white ml-2">
                          Zarezerwuj
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Calendar */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Kalendarz</h2>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Grudzień 2024</h3>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost">←</Button>
                      <Button size="sm" variant="ghost">→</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => (
                      <button key={index} onClick={() => setSelectedDate(day.day)}
                        className={`flex flex-col items-center py-3 rounded-lg transition-all ${selectedDate === day.day ? "bg-green-600 text-white" : "hover:bg-gray-100"}`}>
                        <span className="text-xs font-medium text-gray-600 mb-1">{day.weekday}</span>
                        <span className={`text-sm font-bold ${selectedDate === day.day ? "text-white" : "text-gray-900"}`}>{day.day}</span>
                        {day.hasEvent && <div className={`w-1.5 h-1.5 rounded-full mt-1 ${selectedDate === day.day ? "bg-white" : "bg-orange-500"}`} />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Konsultacje: {selectedDate} grudnia</h4>
                    <div className="space-y-2">
                      {upcomingConsultations.filter(c => new Date(c.date).getDate() === selectedDate).map(c => (
                        <div key={c.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm font-medium text-gray-900">{c.time} - {c.professor}</p>
                          <p className="text-xs text-gray-600 mt-1">{c.subject}</p>
                        </div>
                      ))}
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
