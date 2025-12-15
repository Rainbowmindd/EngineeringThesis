import { useState } from "react"
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

type TabType = "overview" | "lecturers" | "students" | "reservations" | "logs"

interface Lecturer {
  id: string
  name: string
  department: string
  consultations: number
  status: "active" | "inactive"
}

interface Student {
  id: string
  name: string
  email: string
  reservations: number
  status: "active" | "inactive"
}

interface Reservation {
  id: string
  student: string
  lecturer: string
  date: string
  time: string
  status: "confirmed" | "pending"
}

interface SystemLog {
  id: string
  action: string
  user: string
  timestamp: string
  status: "success" | "warning"
}

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data
  const stats = [
    { label: "Aktywni Użytkownicy", value: "1,234", icon: Users, color: "green" },
    { label: "Wykładowcy", value: "45", icon: BookOpen, color: "blue" },
    { label: "Rezerwacje", value: "892", icon: Calendar, color: "purple" },
    { label: "Średnia Ocena", value: "4.8/5", icon: BarChart3, color: "yellow" },
  ]

  const lecturers: Lecturer[] = [
    { id: "1", name: "Prof. dr hab. Jan Kowalski", department: "Informatyka", consultations: 24, status: "active" },
    { id: "2", name: "Prof. dr Magdalena Nowak", department: "Matematyka", consultations: 18, status: "active" },
    { id: "3", name: "Dr inż. Piotr Lewandowski", department: "Elektronika", consultations: 12, status: "inactive" },
  ]

  const students: Student[] = [
    { id: "1", name: "Anna Michalik", email: "anna.michalik@student.agh.edu.pl", reservations: 3, status: "active" },
    { id: "2", name: "Bartosz Szczepanik", email: "bartosz.szczepanik@student.agh.edu.pl", reservations: 5, status: "active" },
    { id: "3", name: "Katarzyna Żuk", email: "katarzyna.zuk@student.agh.edu.pl", reservations: 2, status: "active" },
  ]

  const reservations: Reservation[] = [
    { id: "1", student: "Anna Michalik", lecturer: "Prof. dr hab. Jan Kowalski", date: "2024-12-15", time: "10:00", status: "confirmed" },
    { id: "2", student: "Bartosz Szczepanik", lecturer: "Prof. dr Magdalena Nowak", date: "2024-12-16", time: "14:30", status: "pending" },
    { id: "3", student: "Katarzyna Żuk", lecturer: "Prof. dr hab. Jan Kowalski", date: "2024-12-17", time: "15:00", status: "confirmed" },
  ]

  const systemLogs: SystemLog[] = [
    { id: "1", action: "Nowa rezerwacja", user: "Anna Michalik", timestamp: "10 minut temu", status: "success" },
    { id: "2", action: "Edycja słotu", user: "Prof. Kowalski", timestamp: "25 minut temu", status: "success" },
    { id: "3", action: "Anulowana rezerwacja", user: "Bartosz Szczepanik", timestamp: "1 godzina temu", status: "warning" },
  ]

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

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/admin" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
              Panel
            </Link>
            <Link to="/lecturer-dashboard" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
              Wykładowcy
            </Link>
            <Link to="/student-dashboard" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
              Student
            </Link>
          </nav>

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
          {stats.map((stat, index) => {
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
              { id: "reservations", label: "Rezerwacje" },
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
                      {systemLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0">
                          <div className={`p-2 rounded-lg mt-1 ${
                            log.status === "success" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                          }`}>
                            {log.status === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{log.action}</p>
                            <p className="text-xs text-gray-600">{log.user}</p>
                          </div>
                          <p className="text-xs text-gray-600 whitespace-nowrap">{log.timestamp}</p>
                        </div>
                      ))}
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
                          99.9%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Średnia Odpowiedź</span>
                        <span className="text-sm font-medium text-gray-900">142ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Użytkownicy Online</span>
                        <span className="text-sm font-medium text-gray-900">87</span>
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
                      {lecturers.map((lecturer) => (
                        <tr key={lecturer.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-gray-900">{lecturer.name}</td>
                          <td className="py-3 px-4 text-gray-600">{lecturer.department}</td>
                          <td className="py-3 px-4 text-gray-900">{lecturer.consultations}</td>
                          <td className="py-3 px-4">
                            <Badge className={lecturer.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                              {lecturer.status === "active" ? "Aktywny" : "Nieaktywny"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors text-blue-600">
                              <Edit2 size={18} />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors text-red-600">
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
                      {students.map((student) => (
                        <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-gray-900">{student.name}</td>
                          <td className="py-3 px-4 text-gray-600 text-xs">{student.email}</td>
                          <td className="py-3 px-4 text-gray-900">{student.reservations}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-green-100 text-green-700">Aktywny</Badge>
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors text-blue-600">
                              <Edit2 size={18} />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors text-red-600">
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

          {/* Reservations Tab */}
          {activeTab === "reservations" && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Wszystkie Rezerwacje</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Student</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Wykładowca</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Data</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Godzina</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((reservation) => (
                        <tr key={reservation.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-gray-900">{reservation.student}</td>
                          <td className="py-3 px-4 text-gray-600 text-sm">{reservation.lecturer}</td>
                          <td className="py-3 px-4 text-gray-900">{reservation.date}</td>
                          <td className="py-3 px-4 text-gray-900">{reservation.time}</td>
                          <td className="py-3 px-4">
                            <Badge className={
                              reservation.status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }>
                              {reservation.status === "confirmed" ? "Potwierdzona" : "Oczekująca"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors text-blue-600">
                              <Edit2 size={18} />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors text-red-600">
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

          {/* Logs Tab */}
          {activeTab === "logs" && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Dziennik Systemowy</h2>
                <div className="space-y-3">
                  {systemLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className={`p-2 rounded-lg ${
                        log.status === "success" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                      }`}>
                        {log.status === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{log.action}</p>
                        <p className="text-sm text-gray-600">Użytkownik: {log.user}</p>
                      </div>
                      <p className="text-xs text-gray-600 whitespace-nowrap">{log.timestamp}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}