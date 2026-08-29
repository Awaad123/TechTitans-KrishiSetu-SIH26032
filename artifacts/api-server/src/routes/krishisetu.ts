import { Router, type IRouter, type Request } from "express";
import {
  BookingStatusInput,
  CreateBookingBody,
  CreateCentreBody,
  CreateSlotBody,
  ListSlotsQueryParams,
  LoginBody,
  RegisterFarmerBody,
  UpdateBookingStatusBody,
} from "@workspace/api-zod";

type Role = "farmer" | "admin";
type Status =
  | "Booked"
  | "Checked In"
  | "Verification"
  | "Procured"
  | "Completed"
  | "Cancelled";
type PaymentStatus = "Pending" | "Processing" | "Paid";

type User = {
  id: number;
  name: string;
  role: Role;
  farmerId: string | null;
  phone: string | null;
  village: string | null;
  username: string;
  password: string;
  crop?: string | null;
  expectedQuantity?: number | null;
  harvestDate?: string | null;
};

type Centre = {
  id: number;
  name: string;
  village: string;
  address: string;
  openTime: string;
  closeTime: string;
};

type Slot = {
  id: number;
  centreId: number;
  centreName: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  available: number;
};

type Booking = {
  id: number;
  token: string;
  farmerName: string;
  farmerId: string;
  farmerUserId: number;
  crop: string;
  expectedQuantity: number;
  harvestDate: string;
  centreName: string;
  date: string;
  startTime: string;
  endTime: string;
  queuePosition: number;
  status: Status;
  paymentStatus: PaymentStatus;
  actualQuantity: number | null;
  pricePerKg: number | null;
  totalAmount: number | null;
  slotId: number;
};

type Notice = {
  id: number;
  userId: number;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

function dateFromToday(offsetDays = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00+05:30`));
}

const users: User[] = [
  {
    id: 1,
    name: "Ramesh Patil",
    role: "farmer",
    farmerId: "KS-24018",
    phone: "9876543210",
    village: "Nandgaon",
    username: "farmer@krishisetu.in",
    password: "farmer123",
    crop: "Wheat",
    expectedQuantity: 850,
    harvestDate: dateFromToday(3),
  },
  {
    id: 2,
    name: "Sunita Devi",
    role: "farmer",
    farmerId: "KS-24019",
    phone: "9876543211",
    village: "Borgaon",
    username: "sunita@krishisetu.in",
    password: "farmer123",
    crop: "Soybean",
    expectedQuantity: 620,
    harvestDate: dateFromToday(4),
  },
  {
    id: 3,
    name: "Mohan Jadhav",
    role: "farmer",
    farmerId: "KS-24020",
    phone: "9876543212",
    village: "Khed",
    username: "mohan@krishisetu.in",
    password: "farmer123",
    crop: "Maize",
    expectedQuantity: 430,
    harvestDate: dateFromToday(2),
  },
  {
    id: 4,
    name: "Procurement Officer",
    role: "admin",
    farmerId: null,
    phone: null,
    village: null,
    username: "admin@krishisetu.in",
    password: "admin123",
  },
];

const centres: Centre[] = [
  {
    id: 1,
    name: "Nandgaon Gramin Kendra",
    village: "Nandgaon",
    address: "Market Yard Road, Nandgaon",
    openTime: "08:00",
    closeTime: "18:00",
  },
  {
    id: 2,
    name: "Khed Farmer Collection Centre",
    village: "Khed",
    address: "Near Zilla Parishad School, Khed",
    openTime: "08:30",
    closeTime: "17:30",
  },
];

const slots: Slot[] = [
  { id: 1, centreId: 1, centreName: centres[0].name, date: dateFromToday(0), startTime: "08:00", endTime: "10:00", capacity: 18, bookedCount: 11, available: 7 },
  { id: 2, centreId: 1, centreName: centres[0].name, date: dateFromToday(0), startTime: "10:30", endTime: "12:30", capacity: 18, bookedCount: 6, available: 12 },
  { id: 3, centreId: 1, centreName: centres[0].name, date: dateFromToday(1), startTime: "08:00", endTime: "10:00", capacity: 20, bookedCount: 4, available: 16 },
  { id: 4, centreId: 2, centreName: centres[1].name, date: dateFromToday(0), startTime: "09:00", endTime: "11:00", capacity: 15, bookedCount: 9, available: 6 },
  { id: 5, centreId: 2, centreName: centres[1].name, date: dateFromToday(2), startTime: "11:30", endTime: "13:30", capacity: 15, bookedCount: 2, available: 13 },
];

const bookings: Booking[] = [
  {
    id: 1, token: "NG-042", farmerName: "Ramesh Patil", farmerId: "KS-24018", farmerUserId: 1,
    crop: "Wheat", expectedQuantity: 850, harvestDate: dateFromToday(3), centreName: centres[0].name,
    date: dateFromToday(0), startTime: "08:00", endTime: "10:00", queuePosition: 4,
    status: "Booked", paymentStatus: "Pending", actualQuantity: null, pricePerKg: null, totalAmount: null, slotId: 1,
  },
  {
    id: 2, token: "NG-039", farmerName: "Sunita Devi", farmerId: "KS-24019", farmerUserId: 2,
    crop: "Soybean", expectedQuantity: 620, harvestDate: dateFromToday(4), centreName: centres[0].name,
    date: dateFromToday(0), startTime: "08:00", endTime: "10:00", queuePosition: 1,
    status: "Completed", paymentStatus: "Paid", actualQuantity: 605, pricePerKg: 48, totalAmount: 29040, slotId: 1,
  },
  {
    id: 3, token: "KF-018", farmerName: "Mohan Jadhav", farmerId: "KS-24020", farmerUserId: 3,
    crop: "Maize", expectedQuantity: 430, harvestDate: dateFromToday(2), centreName: centres[1].name,
    date: dateFromToday(0), startTime: "09:00", endTime: "11:00", queuePosition: 2,
    status: "Verification", paymentStatus: "Pending", actualQuantity: null, pricePerKg: null, totalAmount: null, slotId: 4,
  },
];

const notifications: Notice[] = [
  { id: 1, userId: 1, title: "Your token is confirmed", message: `Token NG-042 is reserved for Nandgaon Gramin Kendra on ${displayDate(dateFromToday(0))}, 8:00–10:00.`, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), read: false },
  { id: 2, userId: 1, title: "Bring your documents", message: "Please carry a government-approved ID and farmer registration slip for verification.", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: true },
];

const sessions = new Map<string, number>();
let nextUserId = 5;
let nextBookingId = 4;
let nextSlotId = 6;
let nextCentreId = 3;
let nextNoticeId = 3;

function publicUser(user: User) {
  return { id: user.id, name: user.name, role: user.role, farmerId: user.farmerId, phone: user.phone, village: user.village };
}

function publicFarmer(user: User) {
  return {
    ...publicUser(user),
    crop: user.crop ?? null,
    expectedQuantity: user.expectedQuantity ?? null,
    harvestDate: user.harvestDate ?? null,
  };
}

function getUser(req: Request): User | undefined {
  const token = req.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith("ks_session="))?.split("=")[1];
  const userId = token ? sessions.get(token) : undefined;
  return userId ? users.find((user) => user.id === userId) : undefined;
}

function requireUser(req: Request, res: any): User | undefined {
  const user = getUser(req);
  if (!user) res.status(401).json({ error: "Please sign in to continue." });
  return user;
}

function bookingView(booking: Booking) {
  const { farmerUserId: _farmerUserId, slotId: _slotId, ...view } = booking;
  return view;
}

function addNotice(userId: number, title: string, message: string) {
  notifications.unshift({ id: nextNoticeId++, userId, title, message, createdAt: new Date().toISOString(), read: false });
}

const router: IRouter = Router();

router.post("/auth/login", (req, res) => {
  const input = LoginBody.parse(req.body);
  const user = users.find((candidate) => candidate.username === input.username && candidate.password === input.password && candidate.role === input.role);
  if (!user) return res.status(401).json({ error: "Those details did not match a demo account." });
  const token = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessions.set(token, user.id);
  res.setHeader("Set-Cookie", `ks_session=${token}; Path=/; HttpOnly; SameSite=Lax`);
  return res.json({ user: publicUser(user) });
});

router.post("/auth/register", (req, res) => {
  const input = RegisterFarmerBody.parse(req.body);
  const user: User = { id: nextUserId++, name: input.name, role: "farmer", farmerId: `KS-${24020 + nextUserId}`, phone: input.phone, village: input.village, username: input.phone, password: input.password, crop: null, expectedQuantity: null, harvestDate: null };
  users.push(user);
  const token = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessions.set(token, user.id);
  res.setHeader("Set-Cookie", `ks_session=${token}; Path=/; HttpOnly; SameSite=Lax`);
  return res.status(201).json({ user: publicUser(user) });
});

router.post("/auth/logout", (req, res) => {
  const token = req.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith("ks_session="))?.split("=")[1];
  if (token) sessions.delete(token);
  res.setHeader("Set-Cookie", "ks_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
  return res.status(204).send();
});

router.get("/me", (req, res) => {
  const user = requireUser(req, res);
  return user ? res.json(publicUser(user)) : undefined;
});

router.get("/centres", (_req, res) => res.json(centres));
router.post("/centres", (req, res) => {
  const user = requireUser(req, res);
  if (!user || user.role !== "admin") return user ? res.status(403).json({ error: "Admin access required." }) : undefined;
  const input = CreateCentreBody.parse(req.body);
  const centre = { id: nextCentreId++, ...input };
  centres.push(centre);
  return res.status(201).json(centre);
});

router.get("/slots", (req, res) => {
  const query = ListSlotsQueryParams.parse(req.query);
  const result = slots.filter((slot) => (!query.centreId || slot.centreId === query.centreId) && (!query.date || slot.date === query.date));
  return res.json(result.map((slot) => ({ ...slot, available: Math.max(0, slot.capacity - slot.bookedCount) })));
});

router.post("/slots", (req, res) => {
  const user = requireUser(req, res);
  if (!user || user.role !== "admin") return user ? res.status(403).json({ error: "Admin access required." }) : undefined;
  const input = CreateSlotBody.parse(req.body);
  const centre = centres.find((item) => item.id === input.centreId);
  if (!centre) return res.status(404).json({ error: "Procurement centre not found." });
  const slot = { id: nextSlotId++, ...input, centreName: centre.name, bookedCount: 0, available: input.capacity };
  slots.push(slot);
  return res.status(201).json(slot);
});

router.get("/bookings", (req, res) => {
  const user = requireUser(req, res);
  if (!user) return undefined;
  const search = typeof req.query.search === "string" ? req.query.search.toLowerCase() : "";
  const date = typeof req.query.date === "string" ? req.query.date : "";
  const result = bookings.filter((booking) => (user.role === "admin" || booking.farmerUserId === user.id) && (!date || booking.date === date) && (!search || `${booking.farmerName} ${booking.farmerId} ${booking.token}`.toLowerCase().includes(search)));
  return res.json(result.map(bookingView));
});

router.post("/bookings", (req, res) => {
  const user = requireUser(req, res);
  if (!user) return undefined;
  const input = CreateBookingBody.parse(req.body);
  const slot = slots.find((item) => item.id === input.slotId);
  if (!slot) return res.status(404).json({ error: "That slot is no longer available." });
  if (slot.available <= 0) return res.status(409).json({ error: "This slot is full. Please choose another time." });
  if (bookings.some((booking) => booking.farmerUserId === user.id && booking.slotId === slot.id && booking.status !== "Cancelled")) return res.status(409).json({ error: "You already have a booking for this slot." });
  const booking: Booking = {
    id: nextBookingId++, token: `${slot.centreName.slice(0, 2).toUpperCase()}-${String(nextBookingId + 38).padStart(3, "0")}`,
    farmerName: user.name, farmerId: user.farmerId ?? "KS-NEW", farmerUserId: user.id, crop: input.crop, expectedQuantity: input.expectedQuantity,
    harvestDate: input.harvestDate, centreName: slot.centreName, date: slot.date, startTime: slot.startTime, endTime: slot.endTime,
    queuePosition: slot.bookedCount + 1, status: "Booked", paymentStatus: "Pending", actualQuantity: null, pricePerKg: null, totalAmount: null, slotId: slot.id,
  };
  bookings.push(booking);
  slot.bookedCount += 1;
  slot.available = Math.max(0, slot.capacity - slot.bookedCount);
  user.crop = input.crop;
  user.expectedQuantity = input.expectedQuantity;
  user.harvestDate = input.harvestDate;
  addNotice(user.id, "Booking confirmed", `Your token ${booking.token} is reserved at ${booking.centreName}.`);
  return res.status(201).json(bookingView(booking));
});

router.get("/bookings/:id", (req, res) => {
  const user = requireUser(req, res);
  if (!user) return undefined;
  const booking = bookings.find((item) => item.id === Number(req.params.id) && (user.role === "admin" || item.farmerUserId === user.id));
  return booking ? res.json(bookingView(booking)) : res.status(404).json({ error: "Booking not found." });
});

router.delete("/bookings/:id", (req, res) => {
  const user = requireUser(req, res);
  if (!user) return undefined;
  const booking = bookings.find((item) => item.id === Number(req.params.id) && item.farmerUserId === user.id);
  if (!booking) return res.status(404).json({ error: "Booking not found." });
  if (booking.date <= dateFromToday(0) || ["Procured", "Completed", "Cancelled"].includes(booking.status)) return res.status(409).json({ error: "Only future active bookings can be cancelled." });
  booking.status = "Cancelled";
  const slot = slots.find((item) => item.id === booking.slotId);
  if (slot) { slot.bookedCount = Math.max(0, slot.bookedCount - 1); slot.available = slot.capacity - slot.bookedCount; }
  addNotice(user.id, "Booking cancelled", `Token ${booking.token} has been cancelled successfully.`);
  return res.status(204).send();
});

router.patch("/bookings/:id/status", (req, res) => {
  const user = requireUser(req, res);
  if (!user || user.role !== "admin") return user ? res.status(403).json({ error: "Admin access required." }) : undefined;
  const input = UpdateBookingStatusBody.parse(req.body);
  const booking = bookings.find((item) => item.id === Number(req.params.id));
  if (!booking) return res.status(404).json({ error: "Booking not found." });
  booking.status = input.status;
  booking.paymentStatus = input.paymentStatus;
  booking.actualQuantity = input.actualQuantity ?? booking.actualQuantity;
  booking.pricePerKg = input.pricePerKg ?? booking.pricePerKg;
  booking.totalAmount = booking.actualQuantity != null && booking.pricePerKg != null ? booking.actualQuantity * booking.pricePerKg : booking.totalAmount;
  addNotice(booking.farmerUserId, "Booking status updated", `Your token ${booking.token} is now ${booking.status}. Payment: ${booking.paymentStatus}.`);
  return res.json(bookingView(booking));
});

router.get("/notifications", (req, res) => {
  const user = requireUser(req, res);
  return user ? res.json(notifications.filter((notice) => notice.userId === user.id).map(({ userId: _userId, ...notice }) => notice)) : undefined;
});

router.get("/farmer/dashboard", (req, res) => {
  const user = requireUser(req, res);
  if (!user) return undefined;
  const active = bookings.filter((booking) => booking.farmerUserId === user.id && booking.status !== "Cancelled").sort((a, b) => b.id - a.id)[0];
  const farmerNotices = notifications.filter((notice) => notice.userId === user.id).map(({ userId: _userId, ...notice }) => notice);
  return res.json({ user: publicUser(user), activeBooking: active ? bookingView(active) : null, notifications: farmerNotices, upcomingSlots: slots.filter((slot) => slot.date >= dateFromToday(0)).map((slot) => ({ ...slot, available: slot.capacity - slot.bookedCount })) });
});

router.get("/admin/summary", (req, res) => {
  const user = requireUser(req, res);
  if (!user || user.role !== "admin") return user ? res.status(403).json({ error: "Admin access required." }) : undefined;
  return res.json({
    totalFarmers: users.filter((item) => item.role === "farmer").length,
    todaysBookings: bookings.filter((item) => item.date === dateFromToday(0) && item.status !== "Cancelled").length,
    waitingFarmers: bookings.filter((item) => ["Booked", "Checked In", "Verification"].includes(item.status)).length,
    completedProcurements: bookings.filter((item) => item.status === "Completed").length,
    pendingPayments: bookings.filter((item) => item.paymentStatus !== "Paid").length,
  });
});

router.get("/admin/farmers", (req, res) => {
  const user = requireUser(req, res);
  if (!user || user.role !== "admin") return user ? res.status(403).json({ error: "Admin access required." }) : undefined;
  const search = typeof req.query.search === "string" ? req.query.search.toLowerCase() : "";
  return res.json(users.filter((item) => item.role === "farmer" && (!search || `${item.name} ${item.farmerId} ${item.village}`.toLowerCase().includes(search))).map((farmer) => publicFarmer(farmer)));
});

export default router;
