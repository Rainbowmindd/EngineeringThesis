import { Calendar, Clock, CheckCircle } from "lucide-react"

import { type Reservation } from "../../api/types"

import { Card, CardContent } from "../ui/Card"
import { Badge } from "../ui/Badge"

interface Props {
  reservations: Reservation[]
}

export default function ReservationList({ reservations }: Props) {
  return (
    <div>
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-xl font-bold">Rezerwacje</h2>
        <Badge>{reservations.length}</Badge>
      </div>

      <div className="space-y-3">
        {reservations.map((r) => (
          <Card
            key={r.id}
            className={`border-l-4
            ${
              r.status === "confirmed"
                ? "border-green-600"
                : r.status === "pending"
                ? "border-yellow-500"
                : "border-gray-400"
            }`}
          >
            <CardContent className="p-4">
              <p className="font-semibold">
                {r.studentName}
              </p>

              <p className="text-sm text-gray-600">
                {r.subject}
              </p>

              <div className="flex gap-4 text-xs mt-2 text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {r.date}
                </span>

                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {r.time}
                </span>
              </div>

              {r.status === "confirmed" && (
                <CheckCircle className="text-green-600 mt-3" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
