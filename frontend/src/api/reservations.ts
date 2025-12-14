import api from './axios'
import type {Reservation} from "@/api/types.ts";

export const reservationsAPI = {
  reserveSlot: (slotId: number, topic?: string) =>
    api.post("/api/reservations/student/", {
      slot: slotId,
      // topic: topic ?? "",
    }),

     getMyReservations: () =>
    api.get<Reservation[]>("/api/reservations/student/"),
}
