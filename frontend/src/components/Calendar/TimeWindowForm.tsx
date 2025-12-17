import { useState } from "react";
import { Clock, Trash2, Edit2, Plus, X } from "lucide-react";
import { schedulesAPI } from "../../api/schedule";
import { type TimeWindow } from "../../api/types";

interface Props {
  windows: TimeWindow[];
  onChange: () => void;
}

const daysOfWeek = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

export default function TimeWindowForm({ windows, onChange }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    day: "",
    start_time: "",
    end_time: "",
    capacity: 5,
    location: ""
  });

  const handleEdit = (window: TimeWindow) => {
    setForm({
      day: window.day || "",
      start_time: window.start_time,
      end_time: window.end_time,
      capacity: window.max_attendees || 5,
      location: window.meeting_location || ""
    });
    setEditingId(window.id);
    setIsDialogOpen(true);
  };

  const handleAdd = async () => {
    if (!form.day || !form.start_time || !form.end_time) {
      alert('Proszę wypełnić wszystkie wymagane pola');
      return;
    }

    try {
      const payload = {
        day: form.day,
        start_time: form.start_time,
        end_time: form.end_time,
        max_attendees: form.capacity,
        meeting_location: form.location,
        is_active: true
      };

      if (editingId) {
        await schedulesAPI.updateTimeWindow(editingId, payload);
      } else {
        await schedulesAPI.createTimeWindow(payload);
      }

      setIsDialogOpen(false);
      setEditingId(null);
      setForm({ day: "", start_time: "", end_time: "", capacity: 5, location: "" });
      onChange();
    } catch (error) {
      console.error("Błąd zapisu:", error);
      alert('Nie udało się zapisać okna dostępności');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Czy na pewno chcesz usunąć to okno?")) return;
    try {
      await schedulesAPI.deleteTimeWindow(id);
      onChange();
    } catch (error) {
      alert('Nie udało się usunąć okna');
    }
  };

  const openNewDialog = () => {
    setEditingId(null);
    setForm({ day: "", start_time: "", end_time: "", capacity: 5, location: "" });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Okna Dostępności</h2>
        <button
          onClick={openNewDialog}
          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingId ? "Edytuj okno" : "Dodaj nowe okno"}
                </h3>
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Dzień tygodnia - NAPRAWIONY SELECT */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dzień tygodnia *
                </label>
                <div className="relative">
                  <select
                    value={form.day}
                    onChange={(e) => setForm({ ...form, day: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                  >
                    <option value="">Wybierz dzień</option>
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Godziny */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Początek *
                  </label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Koniec *
                  </label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Pojemność */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pojemność (liczba osób)
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Lokalizacja */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokalizacja (opcjonalnie)
                </label>
                <input
                  type="text"
                  placeholder="np. Sala 101, Online"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Przyciski */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  {editingId ? "Zaktualizuj" : "Dodaj"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista okien */}
      <div className="space-y-3">
        {windows.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
            Brak okien dostępności. Kliknij + aby dodać.
          </div>
        ) : (
          windows.map((w) => (
            <div key={w.id} className="bg-white border-l-4 border-green-500 rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{w.day || 'Brak dnia'}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{w.start_time} - {w.end_time}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>{w.max_attendees} osób</span>
                    {w.meeting_location && <span>• {w.meeting_location}</span>}
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => handleEdit(w)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}