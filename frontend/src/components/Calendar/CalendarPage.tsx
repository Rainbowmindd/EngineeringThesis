// CalendarPage.tsx

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom" 

// Importy komponentów UI
import { Button } from "../ui/Button"
import { Card, CardContent } from "../ui/Card"
import { Badge } from "../ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/Dialog"
import { Input } from "../ui/Input"
import { Label } from "../ui/Label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select"

// Importy ikon
import { Calendar, Clock, Download, Upload, Plus, Trash2, Edit2, Lock, CheckCircle2, Users, AlertCircle } from "lucide-react"

// Importy layoutu i profilu
import LecturerHeader from "../layout/LecturerHeader"
import Footer from "../layout/Footer"
import { fetchUserProfile, type UserProfile } from "../../api/auth";

// Importy API i typów
import {
  schedulesAPI,
  EXPORT_SCHEDULE_URL,
    exportScheduleCSV
} from "../../api/schedule"
import { type TimeWindow, type BlockedTime, type Reservation } from "../../api/types";


const daysOfWeek = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"]

export function CalendarPage() {
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([])
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])

  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Stany Dialogów, Formularzy i Edycji
  const [openTimeWindowDialog, setOpenTimeWindowDialog] = useState(false)
  const [openBlockedTimeDialog, setOpenBlockedTimeDialog] = useState(false)
  const [editingWindowId, setEditingWindowId] = useState<number | null>(null)
  const [editingBlockedId, setEditingBlockedId] = useState<number | null>(null)

  const [timeWindowForm, setTimeWindowForm] = useState({
    day: "",
    start_time: "",
    end_time: "",
    capacity: 5,
    location: ""
  })

  const [blockedTimeForm, setBlockedTimeForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
    reason: "",
  })


  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profileData, twResponse, btResponse, resResponse] = await Promise.all([
        fetchUserProfile(),
        schedulesAPI.getTimeWindows(),
        schedulesAPI.getBlockedTimes(),
        schedulesAPI.getReservations(),
      ]);
      setUserProfile(profileData);

      // Axios zwraca obiekt odpowiedzi, interesują nas tylko dane (.data)
      setTimeWindows(Array.isArray(twResponse.data) ? twResponse.data : []);
      setBlockedTimes(Array.isArray(btResponse.data) ? btResponse.data : []);
      setReservations(Array.isArray(resResponse.data) ? resResponse.data : []);

    } catch (error) {
      console.error("Błąd ładowania danych harmonogramu:", error)
      setTimeWindows([]);
      setBlockedTimes([]);
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- STATYSTYKI ---
  const stats = {
    windows: timeWindows.length,
    blocked: blockedTimes.length,
    reservedConfirmed: reservations.filter(r => r.status === 'confirmed').length,
    totalCapacity: timeWindows.reduce((acc, tw) => acc + tw.capacity, 0),
  };

  // --- HANDLERY (ASYNCHRONICZNE) ---

  const closeTimeWindowDialog = () => {
    setOpenTimeWindowDialog(false)
    setEditingWindowId(null)
    setTimeWindowForm({ day: "", start_time: "", end_time: "", capacity: 5 ,location: ""})
  }

  const handleEditTimeWindow = (tw: TimeWindow) => {
    // Mapowanie snake_case z API na formularz
    setTimeWindowForm({
      day: tw.day,
      start_time: tw.startTime,
      end_time: tw.endTime,
      capacity: tw.capacity,
      location: tw.location,
    })
    setEditingWindowId(tw.id)
    setOpenTimeWindowDialog(true)
  }

// CalendarPage.tsx - Poprawiony handleAddTimeWindow

const handleAddTimeWindow = async () => {
  if (timeWindowForm.day && timeWindowForm.start_time && timeWindowForm.end_time) {
    try {

      const finalPayload = {
        ...timeWindowForm, // day, start_time, end_time, capacity, location
        startTime: timeWindowForm.start_time,
        endTime: timeWindowForm.end_time,
        is_recurring: true, // Dodajemy pole wymagane przez backend/model

      };

      if (editingWindowId) {
        await schedulesAPI.updateTimeWindow(editingWindowId, finalPayload);
      } else {
        await schedulesAPI.createTimeWindow(finalPayload);
      }
      closeTimeWindowDialog();
      loadData();
    } catch (error) {
      console.error("Błąd dodawania/edycji okna:", error);
    }
  }
}

  const handleDeleteTimeWindow = async (id: number) => {
    if (window.confirm("Czy na pewno chcesz usunąć to okno dostępności?")) {
      try {
        // UŻYWAMY schedulesAPI.deleteTimeWindow
        await schedulesAPI.deleteTimeWindow(id)
        loadData()
      } catch (error) {
        console.error("Błąd usuwania okna:", error)
      }
    }
  }

  const closeBlockedTimeDialog = () => {
    setOpenBlockedTimeDialog(false)
    setEditingBlockedId(null)
    setBlockedTimeForm({ date: "", start_time: "", end_time: "", reason: "" })
  }

  const handleEditBlockedTime = (bt: BlockedTime) => {
    // Mapowanie snake_case z API na formularz
    setBlockedTimeForm({
      date: bt.date,
      start_time: bt.startTime,
      end_time: bt.endTime,
      reason: bt.reason,
    })
    setEditingBlockedId(bt.id)
    setOpenBlockedTimeDialog(true)
  }

  const handleAddBlockedTime = async () => {
    if (blockedTimeForm.date && blockedTimeForm.start_time && blockedTimeForm.end_time) {
      try {
        const payload = {
          ...blockedTimeForm,
          startTime: blockedTimeForm.start_time,
          endTime: blockedTimeForm.end_time
        }
        if (editingBlockedId) {
          await schedulesAPI.updateBlockedTime(editingBlockedId, payload)
        } else {
          await schedulesAPI.createBlockedTime(payload)
        }
        closeBlockedTimeDialog()
        loadData()
      } catch (error) {
        console.error("Błąd dodawania/edycji bloku:", error)
      }
    }

  }

  const handleDeleteBlockedTime = async (id: number) => {
    if (window.confirm("Czy na pewno chcesz usunąć ten zablokowany okres?")) {
      try {
        // UŻYWAMY schedulesAPI.deleteBlockedTime
        await schedulesAPI.deleteBlockedTime(id)
        loadData()
      } catch (error) {
        console.error("Błąd usuwania bloku:", error)
      }
    }
  }

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData();
    formData.append('file', file);

    try {
      // UŻYWAMY schedulesAPI.importSchedule
      await schedulesAPI.importSchedule(formData);
      alert("Pomyślnie zaimportowano plan zajęć! Dane są aktualizowane.");
      loadData();
    } catch (error) {
      console.error("Błąd importu:", error);
      alert("Błąd podczas importu planu zajęć. Sprawdź format pliku i spróbuj ponownie.");
    }

    e.target.value = '';
  }


  const handleExportCSV = async () => { // Zmień na async
    try {
        // 1. Użyj Axiosa, aby uzyskać dane (blob) z tokenem
        const csvBlob = await exportScheduleCSV();

        // 2. Tworzenie obiektu URL i wymuszanie pobrania pliku
        const url = window.URL.createObjectURL(new Blob([csvBlob]));
        const link = document.createElement('a');

        link.href = url;
        link.setAttribute('download', `harmonogram-${new Date().toISOString().split("T")[0]}.csv`);

        document.body.appendChild(link);
        link.click();

        // 3. Czyszczenie
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

    } catch (error) {
        console.error("Błąd eksportu:", error);
        alert("Błąd: Nie udało się pobrać harmonogramu. Sprawdź, czy jesteś zalogowany.");
    }
  };

  // --- RENDEROWANIE ---

  if (isLoading) {
      return (
          <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50">
              <p className="text-xl text-gray-700">Ładowanie harmonogramu...</p>
          </div>
      )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <LecturerHeader />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Zarządzaj harmonogramem, <span className="text-green-600}">
              {userProfile ? `${userProfile.first_name}` : "Prowadzący"}
            </span>!
          </h1>
          <p className="text-gray-600">Ustaw stałą dostępność i okresy niedostępności.</p>
        </div>

        {/* Stats Section (Konwencja Dashboardu) */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Okna dostępności</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.windows}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Zablokowane okresy</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.blocked}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Lock className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Potwierdzone rezerwacje</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.reservedConfirmed}</p>
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
                  <p className="text-gray-600 text-sm font-medium mb-2">Całkowita pojemność (sloty)</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalCapacity}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export/Import Buttons */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <Button onClick={handleExportCSV} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="h-4 w-4 mr-2" />
            Eksportuj harmonogram (CSV)
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importuj harmonogram (CSV)
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
        </div>

        {/* Tabs Layout (Trzy Kolumny) */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Kolumna 1: Okna Dostępności (Time Windows) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Stałe Okna Dostępności</h2>
              <Dialog open={openTimeWindowDialog} onOpenChange={setOpenTimeWindowDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setEditingWindowId(null)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>

                {/* Dialog Content */}
                <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingWindowId ? "Edytuj okno" : "Dodaj nowe okno"}</DialogTitle>
                    </DialogHeader>
                    {/* Formularz TimeWindow */}
                    <div className="space-y-4">
                      <div><Label htmlFor="day">Dzień tygodnia</Label><Select value={timeWindowForm.day} onValueChange={(v) => setTimeWindowForm({...timeWindowForm, day: v})}><SelectTrigger className="mt-1"><SelectValue placeholder="Wybierz dzień" /></SelectTrigger><SelectContent>{daysOfWeek.map((day) => (<SelectItem key={day} value={day}>{day}</SelectItem>))}</SelectContent></Select></div>
                      <div className="grid grid-cols-2 gap-4"><div><Label htmlFor="startTime">Początek</Label><Input id="startTime" type="time" value={timeWindowForm.start_time} onChange={(e) => setTimeWindowForm({ ...timeWindowForm, start_time: e.target.value })} className="mt-1" /></div><div><Label htmlFor="endTime">Koniec</Label><Input id="endTime" type="time" value={timeWindowForm.end_time} onChange={(e) => setTimeWindowForm({ ...timeWindowForm, end_time: e.target.value })} className="mt-1" /></div></div>
                      <div><Label htmlFor="capacity">Pojemność</Label><Input id="capacity" type="number" min="1" value={timeWindowForm.capacity} onChange={(e) => setTimeWindowForm({ ...timeWindowForm, capacity: Number.parseInt(e.target.value) || 1 })} className="mt-1" /></div>

                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={closeTimeWindowDialog}>Anuluj</Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleAddTimeWindow}>
                          {editingWindowId ? "Zaktualizuj" : "Dodaj"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {timeWindows.length === 0 ? (
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-center text-gray-600 text-sm">Brak okien dostępności</p></CardContent></Card>
              ) : (
                timeWindows.map((tw) => (
                  <Card key={tw.id} className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{tw.day}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" /><span>{tw.startTime} - {tw.endTime}</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">{tw.capacity} osób</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEditTimeWindow(tw)} className="text-green-600 hover:bg-green-50"><Edit2 className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteTimeWindow(tw.id)} className="text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Kolumna 2: Zablokowane Okresy (Blocked Times) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Zablokowane Okresy</h2>
              <Dialog open={openBlockedTimeDialog} onOpenChange={setOpenBlockedTimeDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setEditingBlockedId(null)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>

                {/* Dialog Content */}
                <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingBlockedId ? "Edytuj okres" : "Dodaj nowy okres"}</DialogTitle>
                    </DialogHeader>
                    {/* Formularz BlockedTime */}
                    <div className="space-y-4">
                      <div><Label htmlFor="blockedDate">Data</Label><Input id="blockedDate" type="date" value={blockedTimeForm.date} onChange={(e) => setBlockedTimeForm({ ...blockedTimeForm, date: e.target.value })} className="mt-1" /></div>
                      <div className="grid grid-cols-2 gap-4"><div><Label htmlFor="blockedStart">Początek</Label><Input id="blockedStart" type="time" value={blockedTimeForm.start_time} onChange={(e) => setBlockedTimeForm({ ...blockedTimeForm, start_time: e.target.value })} className="mt-1" /></div><div><Label htmlFor="blockedEnd">Koniec</Label><Input id="blockedEnd" type="time" value={blockedTimeForm.end_time} onChange={(e) => setBlockedTimeForm({ ...blockedTimeForm, end_time: e.target.value })} className="mt-1" /></div></div>
                      <div><Label htmlFor="reason">Powód</Label><Input id="reason" placeholder="np. Konferencja, chorobę" value={blockedTimeForm.reason} onChange={(e) => setBlockedTimeForm({ ...blockedTimeForm, reason: e.target.value })} className="mt-1" /></div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={closeBlockedTimeDialog}>Anuluj</Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleAddBlockedTime}>
                          {editingBlockedId ? "Zaktualizuj" : "Dodaj"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {blockedTimes.length === 0 ? (
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-center text-gray-600 text-sm">Brak zablokowanych okresów</p></CardContent></Card>
              ) : (
                blockedTimes.map((bt) => (
                  <Card key={bt.id} className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2"><Lock className="h-4 w-4 text-red-600" /><p className="font-semibold text-gray-900">{bt.date}</p></div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 font-medium">{bt.startTime} - {bt.endTime}</p>
                          <p className="text-xs text-gray-600">{bt.reason}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEditBlockedTime(bt)} className="text-green-600 hover:bg-green-50"><Edit2 className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteBlockedTime(bt.id)} className="text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Kolumna 3: Zarezerwowane Konsultacje (Reservations) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Nadchodzące Rezerwacje</h2>
              <Badge variant="secondary" className="bg-green-100 text-green-800">{reservations.length}</Badge>
            </div>

            <div className="space-y-3">
              {reservations.length === 0 ? (
                <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-center text-gray-600 text-sm">Brak nadchodzących rezerwacji</p></CardContent></Card>
              ) : (
                reservations.map((res) => (
                  <Card key={res.id} className={`border-l-4 hover:shadow-md transition-shadow ${res.status === "confirmed" ? "border-l-green-500" : "border-l-yellow-500"}`}>
                    <CardContent className="p-4 flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2"><p className="font-semibold text-gray-900">{res.studentName}</p>
                          <Badge className={res.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                            {res.status === "confirmed" ? "Potwierdzono" : "Oczekujące"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{res.subject}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <Calendar className="h-3 w-3" /><span>{res.date}</span>
                          <Clock className="h-3 w-3" /><span>{res.time}</span>
                        </div>
                      </div>
                      {res.status === "confirmed" && <CheckCircle2 className="h-5 w-5 text-green-600 ml-2" />}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}