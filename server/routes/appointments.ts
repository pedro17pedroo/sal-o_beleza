// Check available time slots for a date/professional
export const getAvailableSlots = async (date: string, professionalId?: number, serviceId?: number) => {
  // This is a utility function to check slot availability
  const selectedDate = new Date(date);
  const startHour = 9; // 9 AM
  const endHour = 18; // 6 PM
  const interval = 30; // 30 minutes

  const allSlots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(hour, minute, 0, 0);
      
      allSlots.push({
        time: timeString,
        datetime: slotDateTime,
        available: true
      });
    }
  }

  return allSlots;
};

// Add this to routes.ts to provide slot availability
export const createAppointmentAvailabilityRoute = (app: any, storage: any) => {
  app.get("/api/appointments/availability", async (req: any, res: any) => {
    try {
      const { date, professionalId, serviceId } = req.query;
      
      if (!date) {
        return res.status(400).json({ message: "Date is required" });
      }

      const slots = await getAvailableSlots(date, professionalId, serviceId);
      res.json(slots);
    } catch (error) {
      res.status(500).json({ message: "Failed to check availability" });
    }
  });
};