import api from './axios'

export const reservationsAPI = {
  reserveSlot: (slotId: number, topic?: string) =>
    api.post("/api/reservations/student/", {
      slot: slotId,
      // topic: topic ?? "",
    }),
}
