import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import { Card, CardContent } from "../ui/Card"
import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { Calendar, Clock, Users, MapPin, ChevronRight, Check, AlertCircle, Plus, Upload } from "lucide-react"

import Header from "../layout/Header"
import Footer from "../layout/Footer"

import { fetchUserProfile, type UserProfile } from "../../api/auth"
import { schedulesAPI } from "../../api/schedule"
import type { TimeWindow, Reservation } from "../../api/types"
import { reservationsAPI } from "@/api/reservations.ts"

interface ScheduleItem {
  id: number
  subject: string
  day: string
  time: string
  location?: string
}

export function StudentDashboard() {
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate())
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [myReservations, setMyReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  // Schedule management state
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [newScheduleItem, setNewScheduleItem] = useState({
    subject: "",
    day: "",
    time: "",
    location: ""
  })

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const profile = await fetchUserProfile()
      setUserProfile(profile)

      const reservationsResponse = await reservationsAPI.getMyReservations()
      setMyReservations(reservationsResponse.data)

      // Load schedule items from backend
      const scheduleResponse = await schedulesAPI.getMySchedule()
      setScheduleItems(scheduleResponse.data)
    } catch (error) {
      console.error("Błąd podczas pobierania danych:", error)
    } finally {
      setLoading(false)
    }
  }

const handleAddScheduleItem = async () => {
  if (!newScheduleItem.subject || !newScheduleItem.day || !newScheduleItem.time) {
    alert("Wypełnij wszystkie wymagane pola")
    return
  }

  try {
    // Wyślij do backendu
    await schedulesAPI.createScheduleItem({
      subject: newScheduleItem.subject,
      day: newScheduleItem.day,
      time: newScheduleItem.time,
      location: newScheduleItem.location || undefined
    })

    // Odśwież całą listę z backendu (najpewniejsze!)
    const scheduleResponse = await schedulesAPI.getMySchedule()
    setScheduleItems(scheduleResponse.data)

    setNewScheduleItem({ subject: "", day: "", time: "", location: "" })
    setShowScheduleForm(false)
  } catch (error) {
    console.error("Błąd podczas dodawania zajęć:", error)
  }
}

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      alert("Proszę wybrać plik w formacie CSV")
      return
    }

    try {
      // Send CSV to backend for parsing
      const response = await schedulesAPI.uploadSchedule(file)

      // Add imported items to local state
      setScheduleItems([...scheduleItems, ...response.data.items])

      // Show success message with any errors
      if (response.data.errors && response.data.errors.length > 0) {
        alert(`${response.data.message}\n\nOstrzeżenia:\n${response.data.errors.join('\n')}`)
      } else {
        alert(response.data.message)
      }

      console.log("CSV file uploaded successfully:", file.name)
    } catch (error) {
      console.error("Błąd podczas wgrywania pliku:", error)
      alert("Nie udało się wgrać pliku CSV. Sprawdź format pliku.")
    }

    // Reset file input
    event.target.value = ''
  }

  const handleGoogleCalendarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type (ICS format)
    if (!file.name.endsWith('.ics')) {
      alert("Proszę wybrać plik w formacie .ics (Google Calendar export)")
      return
    }

    try {
      // Send ICS file to backend for parsing
      const response = await schedulesAPI.uploadGoogleCalendar(file)

      // Add imported items to local state
      setScheduleItems([...scheduleItems, ...response.data.items])

      // Show success message with any errors
      if (response.data.errors && response.data.errors.length > 0) {
        alert(`${response.data.message}\n\nOstrzeżenia:\n${response.data.errors.join('\n')}`)
      } else {
        alert(response.data.message)
      }

      console.log("Google Calendar ICS file uploaded successfully:", file.name)
    } catch (error) {
      console.error("Błąd podczas wgrywania pliku Google Calendar:", error)
      alert("Nie udało się wgrać pliku .ics. Sprawdź format pliku.")
    }

    // Reset file input
    event.target.value = ''
  }

  const handleDeleteScheduleItem = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć te zajęcia?")) {
      return
    }

    try {
      // Delete from backend
      await schedulesAPI.deleteScheduleItem(id)

      // Remove from local state
      setScheduleItems(scheduleItems.filter(item => item.id !== id))

      alert("Zajęcia zostały usunięte")
    } catch (error) {
      console.error("Błąd podczas usuwania zajęć:", error)
      alert("Nie udało się usunąć zajęć. Spróbuj ponownie.")
    }
  }

  const parseDate = (dateStr?: string | null) => {
    if (!dateStr) return null
    const isoDateStr = dateStr.replace(" ", "T")
    const parsed = new Date(isoDateStr)
    return isNaN(parsed.getTime()) ? null : parsed
  }

  const formatDate = (dateStr?: string | null) => {
    const date = parseDate(dateStr)
    if (!date) return "Invalid Date"
    return date.toLocaleDateString("pl-PL", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateStr?: string | null) => {
    const date = parseDate(dateStr)
    if (!date) return "Inval"
    return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })
  }

  const getRelativeDate = (dateStr?: string | null) => {
    const date = parseDate(dateStr)
    if (!date) return "Brak daty"

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return "Dziś"
    if (date.toDateString() === tomorrow.toDateString()) return "Jutro"

    const daysOfWeek = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"]
    return daysOfWeek[date.getDay()]
  }

  const upcomingConsultations = myReservations
    .filter(r => r.status === "Confirmed" || r.status === "Pending")
    .map(r => ({
      id: r.id,
      start_time: r.slot.start_time,
      status: r.status,
      student_name: r.student_name,
      slot: r.slot,
    }))
    .sort((a, b) => {
      const dateA = parseDate(a.slot.start_time)?.getTime() ?? 0
      const dateB = parseDate(b.slot.start_time)?.getTime() ?? 0
      return dateA - dateB
    })
    .slice(0, 5)

  const availableReservations: TimeWindow[] = myReservations
    .map(r => r.slot)
    .filter(slot => (slot.reservations_count ?? 0) < slot.max_attendees)
    .sort((a, b) => {
      const dateA = parseDate(a.start_time)?.getTime() ?? 0
      const dateB = parseDate(b.start_time)?.getTime() ?? 0
      return dateA - dateB
    })
    .slice(0, 6)

  const today = new Date()
  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dayNumber = date.getDate()
    const hasEvent = upcomingConsultations.some(c => parseDate(c.slot.start_time)?.getDate() === dayNumber)
    return {
      day: dayNumber,
      weekday: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"][date.getDay()],
      hasEvent,
      fullDate: date,
    }
  })

  const consultationsOnSelectedDate = upcomingConsultations.filter(
    c => parseDate(c.slot.start_time)?.getDate() === selectedDate
  )

  const stats = {
    upcoming: upcomingConsultations.length,
    completed: myReservations.filter(r => r.status === "Completed").length,
    lecturers: new Set(availableReservations.map(s => s.lecturer_details)).size,
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
            Witaj, <span className="text-green-600">{userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : "Student"}</span>!
          </h1>
          <p className="text-gray-600">Zarządzaj swoimi konsultacjami i rezerwacjami w jednym miejscu</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6 flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Zaplanowane konsultacje</p>
                <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-6 flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Twoi wykładowcy</p>
                <p className="text-3xl font-bold text-gray-900">{stats.lecturers}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6 flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Zrealizowane konsultacje</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Check className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Management Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Mój Plan Zajęć</h2>

          {/* Schedule Actions */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {/* Manual Schedule Entry */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">Dodaj ręcznie</h3>
                    <p className="text-sm text-gray-600 mb-4">Wprowadź swoje zajęcia bezpośrednio</p>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                      onClick={() => setShowScheduleForm(!showScheduleForm)}
                    >
                      Nowe zajęcia
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/*/!* CSV Upload *!/*/}
            {/*<Card className="border-0 shadow-sm hover:shadow-md transition-shadow">*/}
            {/*  <CardContent className="p-6">*/}
            {/*    <div className="flex items-start space-x-4">*/}
            {/*      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">*/}
            {/*        <Upload className="h-6 w-6 text-purple-600" />*/}
            {/*      </div>*/}
            {/*      <div className="flex-1 min-w-0">*/}
            {/*        <h3 className="font-semibold text-gray-900 mb-1">Wgraj plik CSV</h3>*/}
            {/*        <p className="text-sm text-gray-600 mb-4">Importuj plan z pliku</p>*/}
            {/*        <label className="block">*/}
            {/*          <input*/}
            {/*            type="file"*/}
            {/*            accept=".csv"*/}
            {/*            className="hidden"*/}
            {/*            onChange={handleFileUpload}*/}
            {/*          />*/}
            {/*          <Button*/}
            {/*            size="sm"*/}
            {/*            className="bg-purple-600 hover:bg-purple-700 text-white w-full cursor-pointer"*/}
            {/*            onClick={() => document.querySelector('input[type="file"][accept=".csv"]')?.click()}*/}
            {/*          >*/}
            {/*            Wybierz plik*/}
            {/*          </Button>*/}
            {/*        </label>*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*  </CardContent>*/}
            {/*</Card>*/}

            {/* Google Calendar Upload */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Upload className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">Google Calendar</h3>
                    <p className="text-sm text-gray-600 mb-4">Wgraj plik .ics z Google Calendar</p>
                    <label className="block">
                      <input
                        type="file"
                        accept=".ics"
                        className="hidden"
                        onChange={handleGoogleCalendarUpload}
                      />
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white w-full cursor-pointer"
                        onClick={() => {
                          const input = document.querySelectorAll('input[type="file"][accept=".ics"]')[0] as HTMLInputElement
                          input?.click()
                        }}
                      >
                        Wybierz plik .ics
                      </Button>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schedule Form */}
          {showScheduleForm && (
            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Dodaj nowe zajęcia</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Przedmiot *
                    </label>
                    <input
                      type="text"
                      value={newScheduleItem.subject}
                      onChange={(e) => setNewScheduleItem({ ...newScheduleItem, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="np. Matematyka dyskretna"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dzień tygodnia *
                    </label>
                    <select
                      value={newScheduleItem.day}
                      onChange={(e) => setNewScheduleItem({ ...newScheduleItem, day: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Wybierz dzień</option>
                      <option value="Poniedziałek">Poniedziałek</option>
                      <option value="Wtorek">Wtorek</option>
                      <option value="Środa">Środa</option>
                      <option value="Czwartek">Czwartek</option>
                      <option value="Piątek">Piątek</option>
                      <option value="Sobota">Sobota</option>
                      <option value="Niedziela">Niedziela</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Godziny *
                    </label>
                    <input
                      type="text"
                      value={newScheduleItem.time}
                      onChange={(e) => setNewScheduleItem({ ...newScheduleItem, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="np. 10:00-12:00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lokalizacja
                    </label>
                    <input
                      type="text"
                      value={newScheduleItem.location}
                      onChange={(e) => setNewScheduleItem({ ...newScheduleItem, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="np. Bud. A, pok. 215"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleAddScheduleItem}
                  >
                    Dodaj zajęcia
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowScheduleForm(false)
                      setNewScheduleItem({ subject: "", day: "", time: "", location: "" })
                    }}
                  >
                    Anuluj
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Schedule List */}
          {scheduleItems.length > 0 && (
            <div className="space-y-3">
              {scheduleItems.map((item) => (
                <Card key={item.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.subject}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                          <span>{item.day}</span>
                          <span>•</span>
                          <span>{item.time}</span>
                          {item.location && (
                            <>
                              <span>•</span>
                              <span>{item.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          Zaplanowane
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteScheduleItem(item.id)}
                        >
                          Usuń
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {scheduleItems.length === 0 && !showScheduleForm && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Nie masz jeszcze dodanego planu zajęć</p>
                <p className="text-sm text-gray-500">
                  Dodaj swoje zajęcia ręcznie, wgraj plik CSV lub zsynchronizuj z Google Calendar
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Najbliższe konsultacje</h2>
                <Link to="/student-reservations" className="text-green-600 hover:text-green-700 flex items-center space-x-1 text-sm font-medium">
                  <span>Zobacz wszystkie</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              {upcomingConsultations.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Nie masz jeszcze żadnych zaplanowanych konsultacji</p>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">Zarezerwuj konsultację</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingConsultations.map(c => {
                    const slot = c.slot
                    if (!slot) return null
                    return (
                      <Card key={c.id} className="border-0 border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900">{slot.lecturer_details?.name || slot.lecturer_details || "Wykładowca"}</h3>
                                <Badge className={c.status === "Confirmed" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                                  {c.status === "Confirmed" ? "Potwierdzone" : "Oczekujące"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{slot.subject || "Konsultacje"}</p>
                            </div>
                            <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50 ml-4">Szczegóły</Button>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(slot.start_time)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(slot.start_time)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{slot.meeting_location || "Online"}</span>
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
                  <CardContent className="p-6 text-center text-gray-600">Brak dostępnych slotów w najbliższym czasie</CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {availableReservations.map(slot => (
                    <Card key={slot.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-5 flex flex-col h-full">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{slot.lecturer_details || "Wykładowca"}</h3>
                          <p className="text-sm text-gray-600 mb-2">{slot.subject || "Konsultacje"}</p>
                          <div className="space-y-1 mb-3">
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{getRelativeDate(slot.start_time)}, {formatTime(slot.start_time)}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{slot.meeting_location || "Online"}</span>
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">{slot.max_attendees - (slot.reservations_count ?? 0)} miejsc dostępnych</Badge>
                        </div>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white mt-4 w-full">Zarezerwuj</Button>
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
                      {new Date().toLocaleDateString("pl-PL", { month: "long", year: "numeric" })}
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
                          selectedDate === day.day ? "bg-green-600 text-white" : "hover:bg-gray-100"
                        }`}
                      >
                        <span className={`text-xs font-medium mb-1 ${selectedDate === day.day ? "text-white" : "text-gray-600"}`}>
                          {day.weekday}
                        </span>
                        <span className={`text-sm font-bold ${selectedDate === day.day ? "text-white" : "text-gray-900"}`}>
                          {day.day}
                        </span>
                        {day.hasEvent && (
                          <div className={`w-1.5 h-1.5 rounded-full mt-1 ${selectedDate === day.day ? "bg-white" : "bg-orange-500"}`} />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Konsultacje: {selectedDate} {new Date().toLocaleDateString("pl-PL", { month: "long" })}
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
                                {formatTime(slot.start_time)} - {slot.lecturer_details || "Wykładowca"}
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