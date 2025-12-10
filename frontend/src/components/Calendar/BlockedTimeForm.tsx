"use client"

import { useState } from "react"
import { Lock, Trash2 } from "lucide-react"

import { schedulesAPI } from "../../api/schedule"
import { type BlockedTime } from "../../api/types"

import { Card, CardContent } from "../ui/Card"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"

interface Props {
  blocked: BlockedTime[]
  onChange: () => void
}

export default function BlockedTimeForm({ blocked, onChange }: Props) {
  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
  })

  const handleAdd = async () => {
    if (!form.date || !form.startTime || !form.endTime) return

    await schedulesAPI.createBlockedTime(form)
    onChange()

    setForm({
      date: "",
      startTime: "",
      endTime: "",
      reason: "",
    })
  }

  const handleDelete = async (id: number) => {
    await schedulesAPI.deleteBlockedTime(id)
    onChange()
  }

  return (
    <div>
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-xl font-bold">Zablokowane terminy</h2>
        <Lock className="text-red-600" />
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 space-y-3">

          <Input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm({ ...form, date: e.target.value })
            }
          />

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
            placeholder="Powód (opcjonalnie)"
            value={form.reason}
            onChange={(e) =>
              setForm({ ...form, reason: e.target.value })
            }
          />

          <Button
            onClick={handleAdd}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Zablokuj termin
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {blocked.map((b) => (
          <Card
            key={b.id}
            className="border-l-4 border-red-600 shadow-sm"
          >
            <CardContent className="p-4 flex justify-between text-sm">
              <div>
                <p className="font-semibold">{b.date}</p>
                <p>
                  {b.startTime} — {b.endTime}
                </p>
                {b.reason && (
                  <p className="text-gray-500">
                    {b.reason}
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                onClick={() => handleDelete(b.id)}
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
