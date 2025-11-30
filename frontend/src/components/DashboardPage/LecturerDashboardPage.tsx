"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "../ui/Card"
import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { Input } from "../ui/Input"
import { Label } from "../ui/Label"
import { Calendar, Clock, Users, CheckCircle, AlertCircle, Plus, Trash2, Edit2 } from "lucide-react"

import Header from "../layout/Header"
import Footer from "../layout/Footer"

import { fetchUserProfile, type UserProfile } from "../../api/auth.ts";
import  { useEffect } from "react";

function Dialog({ open, onOpenChange, children }: { open: boolean, onOpenChange: (val: boolean) => void, children: React.ReactNode }) {
  return <>{children}</>
}

export function LecturerDashboard() {

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadProfile=async () => {
      try {
        const data = await fetchUserProfile();
        setUserProfile(data);
      } catch (error) {
        console.error("Błąd podczas pobierania profilu użytkownika:", error);
      }
    };
    loadProfile();
  }, []);
  const [slots, setSlots] = useState([
    { id: 1, subject: "Matematyka dyskretna", date: "2024-12-15", time: "14:00", duration: 30, capacity: 5, enrolled: 3, location: "Bud. A, pok. 215", status: "active" },
    { id: 2, subject: "Algorytmy i struktury danych", date: "2024-12-18", time: "10:30", duration: 45, capacity: 4, enrolled: 4, location: "Bud. C, pok. 102", status: "full" },
    { id: 3, subject: "Bazy danych", date: "2024-12-20", time: "15:00", duration: 30, capacity: 6, enrolled: 1, location: "Online", status: "active" },
  ])

  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    subject: "",
    date: "",
    time: "",
    duration: 30,
    capacity: 5,
    location: "",
  })

  const handleAddSlot = () => {
    if (formData.subject && formData.date && formData.time) {
      if (editingId) {
        setSlots(
          slots.map((slot) => (slot.id === editingId ? { ...slot, ...formData, enrolled: slot.enrolled } : slot))
        )
        setEditingId(null)
      } else {
        const newSlot = {
          id: Math.max(...slots.map((s) => s.id), 0) + 1,
          ...formData,
          enrolled: 0,
          status: "active",
        }
        setSlots([...slots, newSlot])
      }
      setFormData({ subject: "", date: "", time: "", duration: 30, capacity: 5, location: "" })
      setOpenDialog(false)
    }
  }

  const handleDelete = (id: number) => {
    setSlots(slots.filter((slot) => slot.id !== id))
  }

  const handleEdit = (slot: typeof slots[0]) => {
    setFormData({
      subject: slot.subject,
      date: slot.date,
      time: slot.time,
      duration: slot.duration,
      capacity: slot.capacity,
      location: slot.location,
    })
    setEditingId(slot.id)
    setOpenDialog(true)
  }

  const closeDialog = () => {
    setOpenDialog(false)
    setEditingId(null)
    setFormData({ subject: "", date: "", time: "", duration: 30, capacity: 5, location: "" })
  }

  const stats = {
    total: slots.length,
    active: slots.filter((s) => s.status === "active").length,
    enrolled: slots.reduce((acc, s) => acc + s.enrolled, 0),
    capacity: slots.reduce((acc, s) => acc + s.capacity, 0),
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Witaj, <span className="text-green-600}">
              {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : "Lecturer"}
            </span>!
          </h1>
          <p className="text-gray-600">Zarządzaj swoimi slotami rezerwacji i konsultacjami</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Łączne sloty</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
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
                  <p className="text-gray-600 text-sm font-medium mb-2">Aktywne sloty</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Zapisanych studentów</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.enrolled}</p>
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
                  <p className="text-gray-600 text-sm font-medium mb-2">Całkowita pojemność</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.capacity}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Slot Button & Dialog pod Łączne sloty */}
        <div className="mb-8 flex justify-start">
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2" onClick={() => setOpenDialog(true)}>
              <Plus className="h-4 w-4" />
              Utwórz nowy slot
            </Button>

            {openDialog && (
              <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">{editingId ? "Edytuj slot" : "Utwórz nowy slot rezerwacji"}</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subject" className="text-sm font-medium text-gray-900">Przedmiot</Label>
                      <Input id="subject" placeholder="np. Matematyka dyskretna" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date" className="text-sm font-medium text-gray-900">Data</Label>
                        <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="time" className="text-sm font-medium text-gray-900">Godzina</Label>
                        <Input id="time" type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duration" className="text-sm font-medium text-gray-900">Czas trwania (min)</Label>
                        <Input id="duration" type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="capacity" className="text-sm font-medium text-gray-900">Pojemność</Label>
                        <Input id="capacity" type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-sm font-medium text-gray-900">Lokalizacja</Label>
                      <Input id="location" placeholder="np. Bud. A, pok. 215" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="mt-1" />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="outline" onClick={closeDialog}>Anuluj</Button>
                      <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleAddSlot}>{editingId ? "Zaktualizuj" : "Utwórz"}</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Dialog>
        </div>

        {/* Slots List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Moje sloty rezerwacji</h2>
          {slots.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8">
                <p className="text-center text-gray-600">Brak utworzonych slotów. Utwórz nowy slot, aby rozpocząć.</p>
              </CardContent>
            </Card>
          ) : (
            slots.map((slot) => (
              <Card key={slot.id} className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{slot.subject}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-2">
                      <div className="flex items-center space-x-1"><Calendar className="h-4 w-4" /><span>{slot.date}</span></div>
                      <div className="flex items-center space-x-1"><Clock className="h-4 w-4" /><span>{slot.time} ({slot.duration} min)</span></div>
                      <div><Badge variant="secondary" className="bg-blue-100 text-blue-800">{slot.enrolled}/{slot.capacity}</Badge></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{slot.location}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent" onClick={() => handleEdit(slot)}><Edit2 className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent" onClick={() => handleDelete(slot.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
