import { useState } from "react";
import { Lock, Trash2, Edit2, Plus, X } from "lucide-react";
import { schedulesAPI } from "../../api/schedule";
import { type BlockedTime } from "../../api/types";

interface Props {
  blocked: BlockedTime[];
  onChange: () => void;
}

export default function BlockedTimeForm({ blocked, onChange }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
    reason: ""
  });

  const handleEdit = (bt: BlockedTime) => {
    // Wyciągnij datę z start_time jeśli zawiera pełny datetime
    const date = bt.start_time.includes('T') ? bt.start_time.split('T')[0] : bt.date || '';
    const startTime = bt.start_time.includes('T') ? bt.start_time.split('T')[1].substring(0, 5) : bt.start_time;
    const endTime = bt.end_time.includes('T') ? bt.end_time.split('T')[1].substring(0, 5) : bt.end_time;

    setForm({
      date: date,
      start_time: startTime,
      end_time: endTime,
      reason: bt.reason || ""
    });
    setEditingId(bt.id);
    setIsDialogOpen(true);
  };

  const handleAdd = async () => {
    if (!form.date || !form.start_time || !form.end_time) {
      alert('Proszę wypełnić wszystkie wymagane pola');
      return;
    }

    try {
      const payload = {
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        reason: form.reason
      };

      if (editingId) {
        await schedulesAPI.updateBlockedTime(editingId, payload);
      } else {
        await schedulesAPI.createBlockedTime(payload);
      }

      setIsDialogOpen(false);
      setEditingId(null);
      setForm({ date: "", start_time: "", end_time: "", reason: "" });
      onChange();
    } catch (error) {
      console.error("Błąd zapisu:", error);
      alert('Nie udało się zapisać zablokowanego okresu');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten zablokowany okres?")) return;
    try {
      await schedulesAPI.deleteBlockedTime(id);
      onChange();
    } catch (error) {
      alert('Nie udało się usunąć okresu');
    }
  };

  const openNewDialog = () => {
    setEditingId(null);
    setForm({ date: "", start_time: "", end_time: "", reason: "" });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Zablokowane Okresy</h2>
        <button
          onClick={openNewDialog}
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Dialog - NAPRAWIONY */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingId ? "Edytuj okres" : "Dodaj nowy okres"}
                </h3>
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Powód */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Powód (opcjonalnie)
                </label>
                <input
                  type="text"
                  placeholder="np. Konferencja, choroba"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  {editingId ? "Zaktualizuj" : "Dodaj"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista zablokowanych okresów */}
      <div className="space-y-3">
        {blocked.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
            Brak zablokowanych okresów. Kliknij + aby dodać.
          </div>
        ) : (
          blocked.map((bt) => {
            // Wyciągnij datę i czas z datetime lub użyj surowych wartości
            const displayDate = bt.start_time.includes('T') ? bt.start_time.split('T')[0] : bt.date || bt.start_time.split(' ')[0];
            const displayStart = bt.start_time.includes('T') ? bt.start_time.split('T')[1].substring(0, 5) : bt.start_time;
            const displayEnd = bt.end_time.includes('T') ? bt.end_time.split('T')[1].substring(0, 5) : bt.end_time;

            return (
              <div key={bt.id} className="bg-white border-l-4 border-red-500 rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-red-600" />
                      <p className="font-semibold text-gray-900">{displayDate}</p>
                    </div>
                    <p className="text-sm text-gray-600">{displayStart} - {displayEnd}</p>
                    {bt.reason && <p className="text-xs text-gray-500 mt-1">{bt.reason}</p>}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleEdit(bt)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(bt.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}