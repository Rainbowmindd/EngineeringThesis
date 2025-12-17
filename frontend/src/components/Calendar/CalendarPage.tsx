// CalendarPage.tsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent, type EventAttributes } from 'ics';
import ICAL from 'ical.js';

// UI Components
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";

import { Calendar, Clock, Download, Upload, Plus, Trash2, Edit2, Lock, CheckCircle2, Users, AlertCircle } from "lucide-react";

import LecturerHeader from "../layout/LecturerHeader";
import Footer from "../layout/Footer";

import { fetchUserProfile, type UserProfile } from "../../api/auth";
import { schedulesAPI, exportScheduleCSV } from "../../api/schedule";
import { type TimeWindow, type BlockedTime, type Reservation } from "../../api/types";

const daysOfWeek = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

export function CalendarPage() {
  //const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [openTimeWindowDialog, setOpenTimeWindowDialog] = useState(false);
  const [openBlockedTimeDialog, setOpenBlockedTimeDialog] = useState(false);

  const [editingWindowId, setEditingWindowId] = useState<number | null>(null);
  const [editingBlockedId, setEditingBlockedId] = useState<number | null>(null);

  const [timeWindowForm, setTimeWindowForm] = useState({
    day: "",
    start_time: "",
    end_time: "",
    max_attendees: 5,
    meeting_location: ""
  });

  const [blockedTimeForm, setBlockedTimeForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
    reason: ""
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profileData, twResponse, btResponse] = await Promise.all([
        fetchUserProfile(),
        schedulesAPI.getTimeWindows(),
        schedulesAPI.getBlockedTimes(),
      ]);

      setUserProfile(profileData);
      setTimeWindows(Array.isArray(twResponse.data) ? twResponse.data : []);
      setBlockedTimes(Array.isArray(btResponse.data) ? btResponse.data : []);
      setReservations([]);
    } catch (error) {
      console.error("Błąd ładowania danych harmonogramu:", error);
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

  const stats = {
    windows: timeWindows.length,
    blocked: blockedTimes.length,
    reservedConfirmed: reservations.filter(r => r.status === 'Confirmed').length,
    totalmax_attendees: timeWindows.reduce((acc, tw) => acc + tw.max_attendees, 0)
  };

  // Ekstrakcja czasu z różnych formatów
  const extractTime = (timeStr?: string) => {
    if (!timeStr) return "";

    // Jeśli zawiera 'T', to jest timestamp (2024-01-15T10:00:00)
    if (timeStr.includes('T')) {
      return timeStr.split('T')[1].slice(0, 5); // Bierz HH:MM po 'T'
    }

    // Jeśli to tylko czas (10:00:00 lub 10:00)
    // Zwróć pierwsze 5 znaków (HH:MM)
    return timeStr.slice(0, 5);
  };

  // Formatowanie czasu do wyświetlenia
  const formatTime = (time?: string) => extractTime(time);

  // TimeWindow Handlers
  const closeTimeWindowDialog = () => {
    setOpenTimeWindowDialog(false);
    setEditingWindowId(null);
    setTimeWindowForm({ day: "", start_time: "", end_time: "", max_attendees: 5, meeting_location: "" });
  };

  const handleEditTimeWindow = (tw: TimeWindow) => {
    setTimeWindowForm({
      day: tw.day,
      start_time: extractTime(tw.start_time),
      end_time: extractTime(tw.end_time),
      max_attendees: tw.max_attendees,
      meeting_location: tw.meeting_location
    });
    setEditingWindowId(tw.id);
    setOpenTimeWindowDialog(true);
  };

  const handleAddTimeWindow = async () => {
    if (!timeWindowForm.day || !timeWindowForm.start_time || !timeWindowForm.end_time) {
      return;
    }
    try {
      const payload = {
        day: timeWindowForm.day,
        start_time: `${timeWindowForm.start_time}:00`,
        end_time: `${timeWindowForm.end_time}:00`,
        max_attendees: timeWindowForm.max_attendees,
        meeting_location: timeWindowForm.meeting_location,
        subject: "",
        is_active: true
      };

      if (editingWindowId) {
        await schedulesAPI.updateTimeWindow(editingWindowId, payload);
      } else {
        await schedulesAPI.createTimeWindow(payload);
      }
      closeTimeWindowDialog();
      loadData();
    } catch (error: any) {
      console.error("Błąd dodawania/edycji okna:", error);
    }
  };

  const handleDeleteTimeWindow = async (id: number) => {
    if (!window.confirm("Czy na pewno chcesz usunąć to okno dostępności?")) return;
    try {
      await schedulesAPI.deleteTimeWindow(id);
      loadData();
    } catch (error: any) {
      console.error("Błąd usuwania okna:", error);
      if (error.response?.status === 404) {
        loadData();
      }
    }
  };

  // BlockedTime Handlers
  const closeBlockedTimeDialog = () => {
    setOpenBlockedTimeDialog(false);
    setEditingBlockedId(null);
    setBlockedTimeForm({ date: "", start_time: "", end_time: "", reason: "" });
  };

  const handleEditBlockedTime = (bt: BlockedTime) => {
    setBlockedTimeForm({
      date: bt.date,
      start_time: bt.start_time,
      end_time: bt.end_time,
      reason: bt.reason
    });
    setEditingBlockedId(bt.id);
    setOpenBlockedTimeDialog(true);
  };

  const handleAddBlockedTime = async () => {
    if (!blockedTimeForm.date || !blockedTimeForm.start_time || !blockedTimeForm.end_time) {
      return;
    }
    try {
      const payload = {
        ...blockedTimeForm,
        start_time: blockedTimeForm.start_time,
        end_time: blockedTimeForm.end_time
      };

      if (editingBlockedId) {
        await schedulesAPI.updateBlockedTime(editingBlockedId, payload);
      } else {
        await schedulesAPI.createBlockedTime(payload);
      }
      closeBlockedTimeDialog();
      loadData();
    } catch (error: any) {
      console.error("Błąd dodawania/edycji bloku:", error);
    }
  };

  const handleDeleteBlockedTime = async (id: number) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten zablokowany okres?")) return;
    try {
      await schedulesAPI.deleteBlockedTime(id);
      loadData();
    } catch (error: any) {
      console.error("Błąd usuwania bloku:", error);
      if (error.response?.status === 404) {
        loadData();
      }
    }
  };

  const handleExportICS = () => {
    if (timeWindows.length === 0) {
      return;
    }

    const dayToNumber: { [key: string]: number } = {
      "Niedziela": 0, "Poniedziałek": 1, "Wtorek": 2, "Środa": 3,
      "Czwartek": 4, "Piątek": 5, "Sobota": 6
    };

    const events: EventAttributes[] = timeWindows.map(tw => {
      const today = new Date();
      const targetDay = dayToNumber[tw.day];
      const currentDay = today.getDay();

      let daysUntilTarget = targetDay - currentDay;
      if (daysUntilTarget <= 0) daysUntilTarget += 7;

      const startDate = new Date(today);
      startDate.setDate(today.getDate() + daysUntilTarget);

      // Używamy extractTime do bezpiecznej ekstrakcji godzin
      const startTimeStr = extractTime(tw.start_time);
      const endTimeStr = extractTime(tw.end_time);

      const [startHour, startMinute] = startTimeStr.split(':').map(Number);
      const [endHour, endMinute] = endTimeStr.split(':').map(Number);

      const durationHours = endHour - startHour;
      const durationMinutes = endMinute - startMinute;

      return {
        start: [
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          startDate.getDate(),
          startHour,
          startMinute
        ] as [number, number, number, number, number],
        duration: { hours: durationHours, minutes: durationMinutes },
        title: `Dostępność: ${tw.day}`,
        description: `Konsultacje - ${tw.meeting_location || 'Brak lokalizacji'}\nPojemność: ${tw.max_attendees} osób`,
        status: 'CONFIRMED' as const,
        busyStatus: 'FREE' as const,
        recurrenceRule: `FREQ=WEEKLY;BYDAY=${['SU','MO','TU','WE','TH','FR','SA'][targetDay]}`,
        location: tw.meeting_location || ''
      };
    });

    let icsContent = '';
    let processedEvents = 0;

    events.forEach((event, index) => {
      createEvent(event, (error, value) => {
        if (error) {
          console.error('Błąd tworzenia eventu:', error);
          return;
        }

        if (index === 0) {
          icsContent = value;
        } else {
          const veventMatch = value.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/);
          if (veventMatch) {
            icsContent = icsContent.replace('END:VCALENDAR', veventMatch[0] + '\nEND:VCALENDAR');
          }
        }

        processedEvents++;

        if (processedEvents === events.length) {
          const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `dostepnosc-${new Date().toISOString().split('T')[0]}.ics`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      });
    });
  };

  const handleImportICS = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.ics')) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = reader.result as string;
        const jcalData = ICAL.parse(data);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');

        if (vevents.length === 0) {
          return;
        }

        const dayNames = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];

        const importedWindows = vevents.map((vevent) => {
          const event = new ICAL.Event(vevent);
          const startDate = event.startDate;

          const dayName = dayNames[startDate.dayOfWeek()];
          const startTime = `${String(startDate.hour).padStart(2, '0')}:${String(startDate.minute).padStart(2, '0')}`;

          const duration = event.duration;
          const endHour = startDate.hour + (duration.hours || 0);
          const endMinute = startDate.minute + (duration.minutes || 0);
          const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

          return {
            day: dayName,
            start_time: startTime,
            end_time: endTime,
            max_attendees: 5,
            meeting_location: event.location || '',
            subject: '',
            is_active: true
          };
        });

        await schedulesAPI.bulkCreateTimeWindows(importedWindows);
        loadData();
      } catch (err) {
        console.error('Błąd importu:', err);
      }
    };

    reader.onerror = () => console.error('Błąd odczytu pliku');
    reader.readAsText(file);
    e.target.value = '';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-700">Ładowanie harmonogramu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <LecturerHeader />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Zarządzaj harmonogramem <span className="text-green-600">{userProfile?.first_name}</span>
          </h1>
          <p className="text-gray-600">Ustaw stałą dostępność i okresy niedostępności.</p>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6 flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Okresy dostępności</p>
                <p className="text-3xl font-bold text-gray-900">{stats.windows}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
            <CardContent className="p-6 flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Zablokowane okresy</p>
                <p className="text-3xl font-bold text-gray-900">{stats.blocked}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6 flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Potwierdzone konsultacje</p>
                <p className="text-3xl font-bold text-gray-900">{stats.reservedConfirmed}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6 flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Całkowita liczba</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalmax_attendees}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Import/Export Buttons */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <Button onClick={handleExportICS} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="h-4 w-4 mr-2" />
            Eksportuj harmonogram (.ics)
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importuj harmonogram (.ics)
          </Button>
          <input ref={fileInputRef} type="file" accept=".ics" onChange={handleImportICS} className="hidden" />
        </div>

        {/* Calendar Tabs */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Time Windows */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Stałe Okresy Dostępności</h2>
              <Dialog open={openTimeWindowDialog} onOpenChange={setOpenTimeWindowDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      setEditingWindowId(null);
                      setTimeWindowForm({ day: "", start_time: "", end_time: "", max_attendees: 5, meeting_location: "" });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingWindowId ? "Edytuj okno" : "Dodaj nowe okno"}</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Dzień tygodnia
                      </Label>
                      <select
                        value={timeWindowForm.day}
                        onChange={(e) => setTimeWindowForm({ ...timeWindowForm, day: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white cursor-pointer"
                      >
                        <option value="">Wybierz dzień</option>
                        {daysOfWeek.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Początek</Label>
                        <Input type="time" value={timeWindowForm.start_time} onChange={(e) => setTimeWindowForm({ ...timeWindowForm, start_time: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <Label>Koniec</Label>
                        <Input type="time" value={timeWindowForm.end_time} onChange={(e) => setTimeWindowForm({ ...timeWindowForm, end_time: e.target.value })} className="mt-1" />
                      </div>
                    </div>

                    <div>
                      <Label>Pojemność</Label>
                      <Input type="number" min={1} value={timeWindowForm.max_attendees} onChange={(e) => setTimeWindowForm({ ...timeWindowForm, max_attendees: Number(e.target.value) || 1 })} className="mt-1" />
                    </div>

                    <div>
                      <Label>Lokalizacja</Label>
                      <Input
                        type="text"
                        placeholder="np. Sala 101, Online"
                        value={timeWindowForm.meeting_location}
                        onChange={(e) => setTimeWindowForm({ ...timeWindowForm, meeting_location: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
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
                <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center text-gray-600 text-sm">Brak okien dostępności</CardContent></Card>
              ) : (
                timeWindows.map((tw) => (
                  <Card key={tw.id} className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="mb-3">
                        <h3 className="text-xl font-bold text-green-700">{tw.day}</h3>
                      </div>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">{formatTime(tw.start_time)} - {formatTime(tw.end_time)}</span>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">{tw.max_attendees} osób</Badge>
                          </div>
                          {tw.meeting_location && (
                            <p className="text-sm text-gray-600 ml-5">{tw.meeting_location}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditTimeWindow(tw)}
                            className="text-green-600 hover:bg-green-50"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTimeWindow(tw.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Blocked Times */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Zablokowane Okresy</h2>
              <Dialog open={openBlockedTimeDialog} onOpenChange={setOpenBlockedTimeDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      setEditingBlockedId(null);
                      setBlockedTimeForm({ date: "", start_time: "", end_time: "", reason: "" });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingBlockedId ? "Edytuj okres" : "Dodaj nowy okres"}</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label>Data</Label>
                      <Input type="date" value={blockedTimeForm.date} onChange={(e) => setBlockedTimeForm({ ...blockedTimeForm, date: e.target.value })} className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Początek</Label>
                        <Input type="time" value={blockedTimeForm.start_time} onChange={(e) => setBlockedTimeForm({ ...blockedTimeForm, start_time: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <Label>Koniec</Label>
                        <Input type="time" value={blockedTimeForm.end_time} onChange={(e) => setBlockedTimeForm({ ...blockedTimeForm, end_time: e.target.value })} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label>Powód</Label>
                      <Input placeholder="np. Konferencja, choroba" value={blockedTimeForm.reason} onChange={(e) => setBlockedTimeForm({ ...blockedTimeForm, reason: e.target.value })} className="mt-1" />
                    </div>
                    <div className="flex justify-end gap-2">
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
                <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center text-gray-600 text-sm">Brak zablokowanych okresów</CardContent></Card>
              ) : (
                blockedTimes.map((bt) => (
                  <Card key={bt.id} className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Lock className="h-4 w-4 text-red-600" />
                          <p className="font-semibold text-gray-900">{bt.date}</p>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p>{formatTime(bt.start_time)} - {formatTime(bt.end_time)}</p>
                          <p>{bt.reason}</p>
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

          {/* Reservations */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Nadchodzące Rezerwacje</h2>
              <Badge variant="secondary" className="bg-green-100 text-green-800">{reservations.length}</Badge>
            </div>
            <div className="space-y-3">
              {reservations.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center text-gray-600 text-sm">
                    Brak nadchodzących rezerwacji
                  </CardContent>
                </Card>
              ) : (
                reservations.map((res) => {
                  // Parsuj start_time do daty i godziny
                  const startDateTime = new Date(res.start_time);
                  const displayDate = startDateTime.toISOString().split('T')[0];
                  const displayTime = startDateTime.toLocaleTimeString('pl-PL', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  });

                  return (
                    <Card
                      key={res.id}
                      className={`border-l-4 hover:shadow-md transition-shadow ${
                        res.status === "Confirmed" ? "border-l-green-500" : "border-l-yellow-500"
                      }`}
                    >
                      <CardContent className="p-4 flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="font-semibold text-gray-900">
                              {res.student_name || 'Student'}
                            </p>
                            <Badge
                              className={
                                res.status === "Confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {res.status === "Confirmed" ? "Potwierdzono" : "Oczekujące"}
                            </Badge>
                          </div>
                          {res.subject && (
                            <p className="text-sm text-gray-600 mb-2">{res.subject}</p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span>{displayDate}</span>
                            <Clock className="h-3 w-3" />
                            <span>{displayTime}</span>
                          </div>
                        </div>
                        {res.status === "Confirmed" && (
                          <CheckCircle2 className="h-5 w-5 text-green-600 ml-2" />
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}