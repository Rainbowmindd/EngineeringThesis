import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import { Button } from "../ui/Button"
import { Card, CardContent } from "../ui/Card"
import { Badge } from "../ui/Badge"
import { Calendar, Clock, MapPin, Users, Search, Filter, AlertCircle, Upload, FileText, X } from "lucide-react"

import Header from "../layout/Header"
import Footer from "../layout/Footer"

import { schedulesAPI, reservationsAPI } from "../../api/schedule"
import type { TimeWindow } from "../../api/types"

export function ReservationsPage() {
  const [availableSlots, setAvailableSlots] = useState<TimeWindow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProfessor, setSelectedProfessor] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")

  // Modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeWindow | null>(null)
  const [bookingNotes, setBookingNotes] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    loadSlots()
  }, [])

  const loadSlots = async () => {
    setLoading(true)
    try {
      const response = await schedulesAPI.getPublicSlots()
      console.log("Dostępne konsultacje:", response.data)

      // Filtruj tylko aktywne sloty z wolnymi miejscami
      const activeSlots = response.data.filter(slot => {
        const hasSpace = (slot.reservations_count ?? 0) < slot.max_attendees
        const isFuture = new Date(slot.start_time) > new Date()
        return slot.is_active && hasSpace && isFuture
      })

      setAvailableSlots(activeSlots)
    } catch (error) {
      console.error("Błąd pobierania slotów:", error)
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // FILTERS
  // =========================
  const professors = [...new Set(availableSlots.map(slot => slot.lecturer_details || "Nieznany wykładowca"))]
  const subjects = [...new Set(availableSlots.map(slot => slot.subject || "Brak tematu").filter(Boolean))]

  const filteredSlots = availableSlots.filter(slot => {
    if (selectedProfessor && (slot.lecturer_details || "Nieznany wykładowca") !== selectedProfessor) {
      return false
    }
    if (selectedSubject && (slot.subject || "Brak tematu") !== selectedSubject) {
      return false
    }
    return true
  })

  // =========================
  // HELPERS
  // =========================
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toTimeString().slice(0, 5)
  }

  const getDuration = (startStr: string, endStr: string) => {
    const start = new Date(startStr)
    const end = new Date(endStr)
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000)
    return `${minutes} min`
  }

  const getSlotStatus = (slot: TimeWindow): "available" | "full" => {
    return (slot.reservations_count ?? 0) < slot.max_attendees ? "available" : "full"
  }

  // =========================
  // FILE UPLOAD HANDLER
  // =========================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = [
        'application/pdf',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!validTypes.includes(file.type)) {
        alert('Nieprawidłowy typ pliku. Dozwolone: PDF, TXT, DOCX')
        return
      }

      if (file.size > maxSize) {
        alert('Plik jest za duży. Maksymalny rozmiar: 5MB')
        return
      }

      setUploadedFile(file)
    }
  }

  // =========================
  // RESERVATION HANDLER
  // =========================
  const openBookingModal = (slot: TimeWindow) => {
    setSelectedSlot(slot)
    setIsBookingModalOpen(true)
  }

  const handleBookingConfirm = async () => {
    if (!selectedSlot) return

    try {
      setLoading(true)
      await reservationsAPI.reserveSlot({
        slot_id: selectedSlot.id,
        topic: selectedSlot.subject || '',
        student_notes: bookingNotes,
        student_attachment: uploadedFile || undefined,
      })

      alert("Rezerwacja potwierdzona ✅")
      setIsBookingModalOpen(false)
      setBookingNotes("")
      setUploadedFile(null)
      setSelectedSlot(null)
      loadSlots()
    } catch (e: any) {
      alert(
        e?.response?.data?.detail ??
        JSON.stringify(e?.response?.data) ??
        "Nie udało się zarezerwować slotu"
      )
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // STATS
  // =========================
  const stats = {
    available: filteredSlots.filter(s => getSlotStatus(s) === "available").length,
    professors: professors.length,
    subjects: subjects.length,
  }

  if (loading && availableSlots.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie dostępnych slotów...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Dostępne <span className="text-green-600">rezerwacje</span>
          </h1>
          <p className="text-gray-600">Przeglądaj i rezerwuj terminy konsultacji</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Dostępne terminy</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.available}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Dostępni wykładowcy</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.professors}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Przedmioty</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.subjects}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Search className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Filter className="h-4 w-4 inline mr-2" />
                  Filtruj po wykładowcy
                </label>
                <select
                  value={selectedProfessor}
                  onChange={(e) => setSelectedProfessor(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Wszyscy wykładowcy</option>
                  {professors.map((prof) => (
                    <option key={prof} value={prof}>
                      {prof}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="h-4 w-4 inline mr-2" />
                  Filtruj po przedmiocie
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Wszystkie przedmioty</option>
                  {subjects.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSelectedProfessor("")
                    setSelectedSubject("")
                  }}
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  Wyczyść filtry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Slots List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredSlots.length} dostępnych terminów
            </h2>
          </div>

          {filteredSlots.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Brak dostępnych terminów spełniających kryteria wyszukiwania.
                </p>
                <Button
                  onClick={() => {
                    setSelectedProfessor("")
                    setSelectedSubject("")
                  }}
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  Wyczyść filtry
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredSlots.map((slot) => {
              const status = getSlotStatus(slot)
              const enrolled = slot.reservations_count ?? 0
              const capacity = slot.max_attendees
              const percentage = Math.round((enrolled / capacity) * 100)

              return (
                <Card
                  key={slot.id}
                  className={`border-l-4 hover:shadow-md transition-shadow ${
                    status === "available" ? "border-l-green-500" : "border-l-gray-300"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Slot Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {slot.lecturer_details || "Nieznany wykładowca"}
                          </h3>
                          <Badge
                            className={
                              status === "available"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {status === "available" ? "Dostępne" : "Pełne"}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 font-medium mb-4">
                          {slot.subject || "Analiza Matematyczna"}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-green-600" />
                            <span>{formatDate(slot.start_time)}</span>
                          </div>

                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4 text-green-600" />
                            <span>
                              {formatTime(slot.start_time)} ({getDuration(slot.start_time, slot.end_time)})
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span>{slot.meeting_location}</span>
                          </div>

                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Users className="h-4 w-4 text-green-600" />
                            <span>
                              {enrolled}/{capacity} osób
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Capacity Bar & Button */}
                      <div className="md:w-48">
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-700">Obłożenie</span>
                            <span className="text-xs font-bold text-gray-900">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                status === "available" ? "bg-green-600" : "bg-gray-400"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>

                        <Button
                          disabled={status === "full" || loading}
                          onClick={() => openBookingModal(slot)}
                          className={`w-full ${
                            status === "available"
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {status === "available" ? "Zarezerwuj" : "Pełne"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </main>

      <Footer />

      {/* Booking Modal */}
      {isBookingModalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Potwierdź rezerwację</h2>
            <p className="text-sm text-gray-600 mb-6">
              {selectedSlot.lecturer_details} - {selectedSlot.subject}
            </p>

            <div className="space-y-4 mb-6">
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notatki (opcjonalnie)
                </label>
                <textarea
                  placeholder="Opisz temat konsultacji lub dodaj pytania..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px]"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Załącznik (opcjonalnie)
                  <span className="text-xs text-gray-500 ml-2">PDF, TXT, DOCX - max 5MB</span>
                </label>

                {uploadedFile ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-600">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm text-green-600 font-medium hover:text-green-700">
                        Kliknij, aby wybrać plik
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.txt,.docx"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">lub przeciągnij i upuść plik tutaj</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setIsBookingModalOpen(false)
                  setBookingNotes("")
                  setUploadedFile(null)
                }}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Anuluj
              </Button>
              <Button
                onClick={handleBookingConfirm}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={loading}
              >
                {loading ? "Rezerwuję..." : "Potwierdź rezerwację"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}