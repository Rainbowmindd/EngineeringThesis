
import { useState } from "react"
import { Plus, Trash2, Clock } from "lucide-react"

import { schedulesAPI } from "../../api/schedule"
import { type TimeWindow } from ",,/../api/types"

import { Card, CardContent } from "../ui/Card"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Label } from "../ui/Label"
import { Badge } from "../ui/Badge"

const daysOfWeek = [
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
  "Niedziela",
]

interface Props {
  worlds: TimeWindow[]
  onChange: () => void
}

export default function TimeWindowForm({ worlds, onChange }: Props) {
  const [form, setForm] = useState({
    day: "",
    startTime: "",
    endTime: "",
    capacity: 1,
    location: "",
    lecturer: "",
  })

  const handleAdd = async () => {
    if (!form.day || !form.startTime || !form.endTime) return

    await schedulesAPI.createTimeWindow(form)
    onChange()

    setForm({
      day: "",
      startTime: "",
      endTime: "",
      capacity: 1,
      location: "",
    lecturer: "",
    })
  }

  const handleDelete = async (id: number) => {
    await schedulesAPI.deleteTimeWindow(id)
    onChange()
  }

  return (
    <div>
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-xl font-bold">Okna dostępności</h2>
        <Plus className="text-green-600" />
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 space-y-3">

          <Label>Dzień</Label>
          <select
            className="w-full border rounded px-3 py-2"
            value={form.day}
            onChange={(e) => setForm({ ...form, day: e.target.value })}
          >
            <option value="">Wybierz dzień</option>
            {daysOfWeek.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <Input
              type="time"
              value={form.startTime}
              onChange={(e) =>
                setForm({ ...form, startTime: e.target.value })
              }
            />
            <Input
              type="time"
              value={form.endTime}
              onChange={(e) =>
                setForm({ ...form, endTime: e.target.value })
              }
            />
          </div>

          <Input
            type="number"
            min={1}
            placeholder="Ilość miejsc"
            value={form.capacity}
            onChange={(e) =>
              setForm({ ...form, capacity: +e.target.value })
            }
          />

          <Button onClick={handleAdd} className="w-full">
            Dodaj okno
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {worlds.map((w) => (
          <Card
            key={w.id}
            className="border-l-4 border-green-600 shadow-sm"
          >
            <CardContent className="p-4 flex justify-between">
              <div>
                <p className="font-semibold">{w.day}</p>

                <p className="flex items-center gap-1 text-sm mt-1">
                  <Clock size={14} />
                  {w.startTime} — {w.endTime}
                </p>

                <Badge className="mt-2">{w.capacity} miejsc</Badge>
              </div>

              <Button
                variant="ghost"
                onClick={() => handleDelete(w.id)}
              >
                <Trash2 className="text-red-600" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
