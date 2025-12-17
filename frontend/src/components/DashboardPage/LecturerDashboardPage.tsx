import { useState, useEffect } from "react"
import { Card, CardContent } from "../ui/Card"
import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { Input } from "../ui/Input"
import { Label } from "../ui/Label"
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
} from "lucide-react"

import LecturerHeader from "../layout/LecturerHeader"
import Footer from "../layout/Footer"

import { fetchUserProfile, type UserProfile } from "../../api/auth"
import { schedulesAPI } from "../../api/schedule"
import type { TimeWindow } from "../../api/types"

function Dialog({ open, children }: { open: boolean; children: React.ReactNode }) {
  if (!open) return null
  return <>{children}</>
}

interface FormData {
  subject: string
  date: string
  start_time: string
  end_time: string
  max_attendees: number
  meeting_location: string
}

export function LecturerDashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [slots, setSlots] = useState<TimeWindow[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>({
    subject: "",
    date: "",
    start_time: "",
    end_time: "",
    max_attendees: 5,
    meeting_location: "",
  })

  useEffect(() => {
    fetchUserProfile().then(setUserProfile)
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      const response = await schedulesAPI.getLecturerSlots()
      console.log("Pobrane sloty:", response.data) // Dodajemy log
      setSlots(response.data)
    } catch (error) {
      console.error("Błąd pobierania slotów:", error)
    }
  }
  const handleSave = async () => {
    // Walidacja - temat jest wymagany
    if (!formData.subject.trim()) {
      alert("Proszę podać temat/przedmiot spotkania")
      return
    }

    const payload = {
      start_time: `${formData.date}T${formData.start_time}`,
      end_time: `${formData.date}T${formData.end_time}`,
      max_attendees: formData.max_attendees,
      meeting_location: formData.meeting_location,
      subject: formData.subject, // Nazwa przedmiotu/tematu
      is_active: true,
    }

    try {
      if (editingId !== null) {
        await schedulesAPI.updateLecturerSlot(editingId, payload)
      } else {
        await schedulesAPI.createLecturerSlot(payload)
      }
      setOpenDialog(false)
      setEditingId(null)
      setFormData({ subject: "", date: "", start_time: "", end_time: "", max_attendees: 5, meeting_location: "" })
      fetchSlots()
    } catch (error) {
      console.error("Błąd zapisu slotu:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć ten slot?")) return

    console.log("Dezaktywuję slot ID:", id)

    try {
      const response = await schedulesAPI.deactivateLecturerSlot(id)
      console.log("Odpowiedź DEACTIVATE:", response)
      setSlots(prev => prev.filter(s => s.id !== id))
      alert("Slot został dezaktywowany!")
    } catch (error: any) {
      console.error("Błąd dezaktywacji slotu:", error)
      console.error("Szczegóły błędu:", error.response?.data)
      alert(`Błąd dezaktywacji: ${error.response?.data?.detail || error.message}`)
    }
  }
  const handleEdit = (slot: LecturerSlot) => {
    const start = new Date(slot.start_time)
    const end = new Date(slot.end_time)
    setFormData({
      subject: slot.subject ?? "", // Pobieramy nazwę przedmiotu/tematu
      date: start.toISOString().split("T")[0],
      start_time: start.toTimeString().slice(0, 5),
      end_time: end.toTimeString().slice(0, 5),
      max_attendees: slot.max_attendees,
      meeting_location: slot.meeting_location,
    })
    setEditingId(slot.id)
    setOpenDialog(true)
  }

  const closeDialog = () => {
    setOpenDialog(false)
    setEditingId(null)
    setFormData({ subject: "", date: "", start_time: "", end_time: "", max_attendees: 5, meeting_location: "" })
  }

  const stats = {
    total: slots.length,
    active: slots.filter(s => s.is_active).length,
    enrolled: slots.reduce((acc, slot) => acc + (slot.reservations_count ?? 0), 0),
    capacity: slots.reduce((acc, slot) => acc + slot.max_attendees, 0),
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
      <LecturerHeader />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Witaj,{" "}
            <span className="text-green-600">
              {userProfile
                ? `${userProfile.first_name} ${userProfile.last_name}`
                : "Prowadzący"}
            </span>
            !
          </h1>
          <p className="text-gray-600">
            Zarządzaj swoimi terminami konsultacji
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            ["Łącznie", stats.total, Calendar, "green"],
            ["Aktywne", stats.active, CheckCircle, "blue"],
            ["Zapisanych studentów", stats.enrolled, Users, "orange"],
            ["Całkowita ilość", stats.capacity, AlertCircle, "purple"],
          ].map(([label, value, Icon, color]: any) => (
            <Card key={label} className="border-0 shadow-sm bg-gradient-to-br from-white to-white">
              <CardContent className="p-6 flex justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">{label}</p>
                  <p className="text-3xl font-bold">{value}</p>
                </div>
                <div className={
                  color === "green" ? "w-12 h-12 rounded-lg flex items-center justify-center bg-green-100" :
                  color === "blue" ? "w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100" :
                  color === "orange" ? "w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100" :
                  "w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100"
                }>
                  <Icon className={
                    color === "green" ? "h-6 w-6 text-green-600" :
                    color === "blue" ? "h-6 w-6 text-blue-600" :
                    color === "orange" ? "h-6 w-6 text-orange-600" :
                    "h-6 w-6 text-purple-600"
                  } />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Slot Button & Dialog */}
        <div className="mb-8">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 mb-4"
            onClick={() => {
              setEditingId(null)
              setFormData({ subject: "", date: "", start_time: "", end_time: "", max_attendees: 5, meeting_location: "" })
              setOpenDialog(true)
            }}
          >
            <Plus className="h-4 w-4" /> Utwórz nowy termin
          </Button>

          {/* Dialog */}
          <Dialog open={openDialog}>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeDialog}>
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold">
                  {editingId !== null ? "Edytuj slot" : "Utwórz nowy slot"}
                </h2>

                <div>
                  <Label htmlFor="subject" className="text-sm font-medium text-gray-900">
                    Temat/Przedmiot *
                  </Label>
                  <Input
                    id="subject"
                    placeholder="np. Matematyka - Analiza, Konsultacje AI, Laboratorium C++"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-sm font-medium text-gray-900">Data *</Label>
                    <Input
                      type="date"
                      id="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="start_time" className="text-sm font-medium text-gray-900">Godzina startu *</Label>
                    <Input
                      type="time"
                      id="start_time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="end_time" className="text-sm font-medium text-gray-900">Godzina końca *</Label>
                    <Input
                      type="time"
                      id="end_time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_attendees" className="text-sm font-medium text-gray-900">Pojemność *</Label>
                    <Input
                      type="number"
                      id="max_attendees"
                      min="1"
                      value={formData.max_attendees}
                      onChange={(e) => setFormData({ ...formData, max_attendees: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="meeting_location" className="text-sm font-medium text-gray-900">Lokalizacja *</Label>
                  <Input
                    id="meeting_location"
                    placeholder="np. Sala 204, Online - Zoom"
                    value={formData.meeting_location}
                    onChange={(e) => setFormData({ ...formData, meeting_location: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={closeDialog}>
                    Anuluj
                  </Button>
                  <Button className="bg-green-600 text-white" onClick={handleSave}>
                    {editingId !== null ? "Zaktualizuj" : "Utwórz"}
                  </Button>
                </div>
              </div>
            </div>
          </Dialog>
        </div>

        {/* Slots List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Moje konsultacje</h2>
          {slots.length === 0 && <p className="text-gray-600">Brak utworzonych slotów.</p>}
          {slots.map((slot) => {
            const start = new Date(slot.start_time)
            const end = new Date(slot.end_time)
            const duration = Math.round((end.getTime() - start.getTime()) / 60000)
            const statusLabel = slot.is_active ? "Aktywny" : "Pełny"

            return (
              <Card key={slot.id} className="border-0.5 border-l-green-500 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {slot.subject || "Bez tematu"}
                        </h3>
                        <Badge className={slot.is_active ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                          {statusLabel}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-green-600" />
                          <span className="font-medium">
                            {start.toLocaleDateString('pl-PL', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span>
                            <span className="font-medium">{start.toTimeString().slice(0,5)}</span>
                            {' - '}
                            <span className="font-medium">{end.toTimeString().slice(0,5)}</span>
                            <span className="text-gray-500 ml-1">({duration} min)</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-orange-600" />
                          <Badge className="bg-blue-100 text-blue-800">
                            {slot.reservations_count ?? 0}/{slot.max_attendees} miejsc
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-3 flex items-center">
                        <span className="font-medium mr-2">📍</span>
                        {slot.meeting_location || "Brak lokalizacji"}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleEdit(slot)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(slot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>

      <Footer />
    </div>
  )
}