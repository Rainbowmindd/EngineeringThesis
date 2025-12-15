import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  Edit2,
  Trash2,
  Plus,
  Search,
  Activity,
  AlertCircle,
  CheckCircle,
  LogOut,
  Settings,
} from "lucide-react"

import { Card, CardContent } from "../ui/Card"
import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { adminAPI, type AdminLecturer, type AdminStudent, type AdminReservation, type SystemLog } from "../../api/admin"

type TabType = "overview" | "lecturers" | "students" | "reservations" | "logs"

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  // State for data
  const [stats, setStats] = useState({
    active_users: 0,
    total_lecturers: 0,
    total_reservations: 0,
    average_rating: "0/5",
  })
  const [lecturers, setLecturers] = useState<AdminLecturer[]>([])
  const [students, setStudents] = useState<AdminStudent[]>([])
  const [reservations, setReservations] = useState<AdminReservation[]>([])
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([])
  const [systemHealth, setSystemHealth] = useState({
    uptime: 99.9,
    response_time: 142,
    active_connections: 87,
  })

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadStats(),
        loadLecturers(),
        loadStudents(),
        loadReservations(),
        loadLogs(),
        loadSystemHealth(),
      ])
    } catch (error) {
      console.error("Błąd ładowania danych:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await adminAPI.getStats()
      setStats({
        active_users: response.data.active_users,
        total_lecturers: response.data.total_lecturers,
        total_reservations: response.data.total_reservations,
        average_rating: `${response.data.average_rating}/5`,
      })
    } catch (error) {
      console.error("Błąd pobierania statystyk:", error)
    }
  }

  const loadLecturers = async () => {
    try {
      const response = await adminAPI.getLecturers()
      setLecturers(response.data)
    } catch (error) {
      console.error("Błąd pobierania wykładowców:", error)
    }
  }

  const loadStudents = async () => {
    try {
      const response = await adminAPI.getStudents()
      setStudents(response.data)
    } catch (error) {
      console.error("Błąd pobierania studentów:", error)
    }
  }

  const loadReservations = async () => {
    try {
      const response = await adminAPI.getReservations()
      setReservations(response.data)
    } catch (error) {
      console.error("Błąd pobierania rezerwacji:", error)
    }
  }

  const loadLogs = async () => {
    try {
      const response = await adminAPI.getLogs({ limit: 10 })
      setSystemLogs(response.data)
    } catch (error) {
      console.error("Błąd pobierania logów:", error)
    }
  }

  const loadSystemHealth = async () => {
    try {
      const response = await adminAPI.getSystemHealth()
      setSystemHealth({
        uptime: response.data.uptime,
        response_time: response.data.response_time,
        active_connections: response.data.active_connections,
      })
    } catch (error) {
      console.error("Błąd pobierania health:", error)
    }
  }

  const handleDeleteLecturer = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tego wykładowcę?")) return
    try {
      await adminAPI.deleteLecturer(id)
      await loadLecturers()
      alert("Wykładowca został usunięty")
    } catch (error) {
      console.error("Błąd usuwania wykładowcy:", error)
      alert("Nie udało się usunąć wykładowcy")
    }
  }

  const handleToggleLecturerStatus = async (id: number) => {
    try {
      await adminAPI.toggleLecturerStatus(id)
      await loadLecturers()
    } catch (error) {
      console.error("Błąd zmiany statusu:", error)
    }
  }

  const handleDeleteStudent = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tego studenta?")) return
    try {
      await adminAPI.deleteStudent(id)
      await loadStudents()
      alert("Student został usunięty")
    } catch (error) {
      console.error("Błąd usuwania studenta:", error)
      alert("Nie udało się usunąć studenta")
    }
  }

  const handleDeleteReservation = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tę rezerwację?")) return
    try {
      await adminAPI.deleteReservation(id)
      await loadReservations()
      alert("Rezerwacja została usunięta")
    } catch (error) {
      console.error("Błąd usuwania rezerwacji:", error)
      alert("Nie udało się usunąć rezerwacji")
    }
  }

  // =========================
  // FILTERS & SEARCH
  // =========================
  const filteredLecturers = lecturers.filter(l => {
    const fullName = `${l.first_name} ${l.last_name}`.toLowerCase()
    const query = searchQuery.toLowerCase()
    return fullName.includes(query) ||
           l.email.toLowerCase().includes(query) ||
           (l.department && l.department.toLowerCase().includes(query))
  })

  const filteredStudents = students.filter(s => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase()
    const query = searchQuery.toLowerCase()
    return fullName.includes(query) || s.email.toLowerCase().includes(query)
  })

  // =========================
  // FORMAT HELPERS
  // =========================
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Teraz"
    if (diffMins < 60) return `${diffMins} minut temu`
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'godzinę' : 'godziny'} temu`
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'dzień' : 'dni'} temu`
    return formatDate(dateStr)
  }
  // Zwraca datę w formacie YYYY-MM-DD dla input type="date"
const toISODate = (dateStr: string) => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Zwraca czas w formacie HH:mm dla input type="time"
const toISOTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// Zwraca datetime w formacie YYYY-MM-DDTHH:mm dla input type="datetime-local"
const toISODatetimeLocal = (dateStr: string) => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}


  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'confirmed': 'Potwierdzona',
      'pending': 'Oczekująca',
      'completed': 'Zakończona',
      'cancelled': 'Anulowana',
      'success': 'Sukces',
      'warning': 'Ostrzeżenie',
      'error': 'Błąd'
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie panelu administratora...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="text-xl font-bold text-gray-900">Admin Panel</span>
            <Badge className="bg-green-100 text-green-700 text-xs">Administracja</Badge>
          </div>

          {/*<nav className="hidden md:flex items-center space-x-6">*/}
          {/*  <Link to="/admin-panel" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">*/}
          {/*    Panel*/}
          {/*  </Link>*/}
          {/*  <Link to="/lecturer-dashboard" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">*/}
          {/*    Wykładowcy*/}
          {/*  </Link>*/}
          {/*  <Link to="/student-dashboard" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">*/}
          {/*    Student*/}
          {/*  </Link>*/}
          {/*</nav>*/}

          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-gray-600">
              <Settings size={20} />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-gray-600">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel Administracyjny</h1>
          <p className="text-gray-600">Zarządzaj systemem konsultacji akademickich</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Aktywni Użytkownicy", value: stats.active_users.toString(), icon: Users, color: "green" },
            { label: "Wykładowcy", value: stats.total_lecturers.toString(), icon: BookOpen, color: "blue" },
            { label: "Rezerwacje", value: stats.total_reservations.toString(), icon: Calendar, color: "purple" },
            { label: "Średnia Ocena", value: stats.average_rating, icon: BarChart3, color: "yellow" },
          ].map((stat, index) => {
            const Icon = stat.icon
            const colorClasses = {
              green: "bg-green-100 text-green-600",
              blue: "bg-blue-100 text-blue-600",
              purple: "bg-purple-100 text-purple-600",
              yellow: "bg-yellow-100 text-yellow-600",
            }

            return (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`${colorClasses[stat.color as keyof typeof colorClasses]} p-3 rounded-lg`}>
                      <Icon size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-1 -mb-px">
            {[
              { id: "overview", label: "Przegląd" },
              { id: "lecturers", label: "Wykładowcy" },
              { id: "students", label: "Studenci" },
              // { id: "reservations", label: "Rezerwacje" },
              { id: "logs", label: "Dziennik" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Ostatnia Aktywność</h2>
                    <div className="space-y-4">
                      {systemLogs.length === 0 ? (
                        <p className="text-gray-600 text-center py-4">Brak aktywności</p>
                      ) : (
                        systemLogs.map((log) => (
                          <div key={log.id} className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0">
                            <div className={`p-2 rounded-lg mt-1 ${
                              log.status === "success" ? "bg-green-100 text-green-600" : 
                              log.status === "warning" ? "bg-yellow-100 text-yellow-600" :
                              "bg-red-100 text-red-600"
                            }`}>
                              {log.status === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{log.action}</p>
                              <p className="text-xs text-gray-600">{log.user}</p>
                            </div>
                            <p className="text-xs text-gray-600 whitespace-nowrap">{formatTimestamp(log.timestamp)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Systemu</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Dostępność</span>
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium text-sm">
                          <Activity size={16} />
                          {systemHealth.uptime}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Średnia Odpowiedź</span>
                        <span className="text-sm font-medium text-gray-900">{systemHealth.response_time}ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Użytkownicy Online</span>
                        <span className="text-sm font-medium text-gray-900">{systemHealth.active_connections}</span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                          Pobierz Raport
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Lecturers Tab */}
          {activeTab === "lecturers" && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Zarządzanie Wykładowcami</h2>
                  <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                    <Plus size={18} />
                    Dodaj Wykładowcę
                  </Button>
                </div>

                <div className="mb-4 relative">
                  <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Szukaj wykładowcy..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Imię i Nazwisko</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Wydział</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Konsultacje</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLecturers.map((lecturer) => (
                        <tr key={lecturer.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-gray-900">
                            {lecturer.first_name} {lecturer.last_name}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{lecturer.department || "Brak"}</td>
                          <td className="py-3 px-4 text-gray-900">{lecturer.consultations_count}</td>
                          <td className="py-3 px-4">
                            <Badge className={lecturer.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                              {lecturer.is_active ? "Aktywny" : "Nieaktywny"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <button
                              onClick={() => handleToggleLecturerStatus(lecturer.id)}
                              className="p-2 hover:bg-gray-100 rounded transition-colors text-blue-600"
                              title="Zmień status"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteLecturer(lecturer.id)}
                              className="p-2 hover:bg-gray-100 rounded transition-colors text-red-600"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Students Tab */}
          {activeTab === "students" && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Zarządzanie Studentami</h2>
                  <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                    <Plus size={18} />
                    Dodaj Studenta
                  </Button>
                </div>

                <div className="mb-4 relative">
                  <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Szukaj studenta..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Imię i Nazwisko</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Rezerwacje</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-gray-900">
                            {student.first_name} {student.last_name}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs">{student.email}</td>
                          <td className="py-3 px-4 text-gray-900">{student.reservations_count}</td>
                          <td className="py-3 px-4">
                            <Badge className={student.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                              {student.is_active ? "Aktywny" : "Nieaktywny"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors text-blue-600">
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="p-2 hover:bg-gray-100 rounded transition-colors text-red-600"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/*/!* Reservations Tab *!/*/}
          {/*{activeTab === "reservations" && (*/}
          {/*  <Card className="border-0 shadow-sm">*/}
          {/*    <CardContent className="p-6">*/}
          {/*      <h2 className="text-lg font-semibold text-gray-900 mb-6">Wszystkie Rezerwacje</h2>*/}
          {/*      <div className="overflow-x-auto">*/}
          {/*        <table className="w-full text-sm">*/}
          {/*          <thead>*/}
          {/*            <tr className="border-b border-gray-200">*/}
          {/*              <th className="text-left py-3 px-4 font-semibold text-gray-900">Student</th>*/}
          {/*              <th className="text-left py-3 px-4 font-semibold text-gray-900">Wykładowca</th>*/}
          {/*              <th className="text-left py-3 px-4 font-semibold text-gray-900">Data</th>*/}
          {/*              <th className="text-left py-3 px-4 font-semibold text-gray-900">Godzina</th>*/}
          {/*              <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>*/}
          {/*              <th className="text-left py-3 px-4 font-semibold text-gray-900">Akcje</th>*/}
          {/*            </tr>*/}
          {/*          </thead>*/}
          {/*          <tbody>*/}
          {/*            {reservations.length === 0 ? (*/}
          {/*              <tr>*/}
          {/*                <td colSpan={6} className="py-8 text-center text-gray-600">*/}
          {/*                  Brak rezerwacji w systemie*/}
          {/*                </td>*/}
          {/*              </tr>*/}
          {/*            ) : (*/}
          {/*              reservations.map((reservation) => (*/}
          {/*                <tr key={reservation.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">*/}
          {/*                  <td className="py-3 px-4 text-gray-900">{reservation.student_name}</td>*/}
          {/*                  <td className="py-3 px-4 text-gray-600 text-sm">{reservation.lecturer_name}</td>*/}
          {/*                  /!*<td className="py-3 px-4 text-gray-900">{formatDate(reservation.booked_at)}</td>*!/*/}
          {/*                  /!*<td className="py-3 px-4 text-gray-900">{formatTime(reservation.start_time)}</td>*!/*/}
          {/*                  <td className="py-3 px-4">*/}
          {/*                    <Badge className={*/}
          {/*                      reservation.status === "confirmed"*/}
          {/*                        ? "bg-green-100 text-green-700"*/}
          {/*                        : reservation.status === "pending"*/}
          {/*                        ? "bg-yellow-100 text-yellow-700"*/}
          {/*                        : reservation.status === "completed"*/}
          {/*                        ? "bg-blue-100 text-blue-700"*/}
          {/*                        : "bg-gray-100 text-gray-700"*/}
          {/*                    }>*/}
          {/*                      {getStatusLabel(reservation.status)}*/}
          {/*                    </Badge>*/}
          {/*                  </td>*/}
          {/*                  <td className="py-3 px-4 flex gap-2">*/}
          {/*                    <button*/}
          {/*                      onClick={() => handleDeleteReservation(reservation.id)}*/}
          {/*                      className="p-2 hover:bg-gray-100 rounded transition-colors text-red-600"*/}
          {/*                      title="Usuń rezerwację"*/}
          {/*                    >*/}
          {/*                      <Trash2 size={18} />*/}
          {/*                    </button>*/}
          {/*                  </td>*/}
          {/*                </tr>*/}
          {/*              ))*/}
          {/*            )}*/}
          {/*          </tbody>*/}
          {/*        </table>*/}
          {/*      </div>*/}
          {/*    </CardContent>*/}
          {/*  </Card>*/}
          {/*)}*/}

          {/* Logs Tab */}
          {activeTab === "logs" && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Dziennik Systemowy</h2>
                <div className="space-y-3">
                  {systemLogs.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">Brak wpisów w dzienniku systemowym</p>
                  ) : (
                    systemLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className={`p-2 rounded-lg ${
                          log.status === "success" ? "bg-green-100 text-green-600" : 
                          log.status === "warning" ? "bg-yellow-100 text-yellow-600" :
                          "bg-red-100 text-red-600"
                        }`}>
                          {log.status === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{log.action}</p>
                          <p className="text-sm text-gray-600">Użytkownik: {log.user}</p>
                        </div>
                        <p className="text-xs text-gray-600 whitespace-nowrap">{formatTimestamp(log.timestamp)}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}