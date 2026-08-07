export const BOOKING_STATUSES = [
  "new",
  "quoted",
  "confirmed",
  "completed",
  "cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const statusStyles: Record<string, string> = {
  new: "bg-copper/15 text-copper border-copper/30",
  quoted: "bg-sky-100 text-sky-800 border-sky-300",
  confirmed: "bg-moss/15 text-moss border-moss/30",
  completed: "bg-ink/10 text-ink/60 border-ink/20",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export type BookingRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  tour_title: string | null;
  travel_date: string | null;
  end_date: string | null;
  travellers: string | null;
  message: string | null;
  status: string;
  vehicle_id: string | null;
  driver_id: string | null;
  quote_amount: number | null;
  currency: string;
  admin_notes: string | null;
};

export const fmtDate = (d?: string | null) =>
  d
    ? new Date(d + (d.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
