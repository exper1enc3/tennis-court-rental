const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(date) {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addMinutes(date, minutes) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() + minutes);
  return copy;
}

function displayTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function displayDate(value) {
  return new Date(value).toLocaleDateString([], { month: "short", day: "numeric" });
}

function sameSlot(a, b) {
  return new Date(a).getTime() === new Date(b).getTime();
}

function isContiguous(slots) {
  if (slots.length < 2) {
    return false;
  }
  for (let index = 1; index < slots.length; index += 1) {
    const previous = new Date(slots[index - 1].starts_at).getTime();
    const current = new Date(slots[index].starts_at).getTime();
    if (current - previous !== 30 * 60 * 1000) {
      return false;
    }
  }
  return true;
}

// Додані стейти в App component
const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
const [availability, setAvailability] = useState([]);
const [selectedSlots, setSelectedSlots] = useState([]);
const [bookings, setBookings] = useState([]);
const [selectedBooking, setSelectedBooking] = useState(null);
const [reviewRating, setReviewRating] = useState(5);
const [reviewComment, setReviewComment] = useState("");
const [moderatorMessage, setModeratorMessage] = useState("");
const [favorites, setFavorites] = useState([]);
const [adminBookings, setAdminBookings] = useState([]);
const [dragStartSlot, setDragStartSlot] = useState(null);
const [isDraggingSlots, setIsDraggingSlots] = useState(false);
const [newCourt, setNewCourt] = useState({
  name: "", city: "Kyiv", district: "Pechersk", address: "", surface: "Hard", price_per_hour: 700, opening_time: "07:00", closing_time: "22:00"
});

const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
const weekSlots = useMemo(() => {
  const grouped = new Map();
  for (const slot of availability) {
    const key = dateKey(new Date(slot.starts_at));
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(slot);
  }
  return grouped;
}, [availability]);
const selectedDuration = selectedSlots.length * 30;
const selectedTotal = Math.round((activeCourt?.price_per_hour || 0) * (selectedDuration / 60));
const canConfirmSelection = isContiguous(selectedSlots);
const slotHint = canConfirmSelection ? "Можна підтверджувати." : "Обери два або більше суміжні слоти.";

useEffect(() => {
  if (activeCourtId) {
    loadAvailability(activeCourtId, weekStart);
  }
}, [activeCourtId, weekStart]);

async function loadAvailability(courtId, start) {
  try {
    const data = await api.getAvailability(courtId, start.toISOString());
    const scoped = data.filter((slot) => {
      const hour = new Date(slot.starts_at).getHours();
      return hour >= 5 && hour <= 23;
    });
    setAvailability(scoped);
    setSelectedSlots([]);
  } catch (err) {
    setAvailability([]);
    setError(`Availability API unavailable: ${err.message}`);
  }
}

function toggleSlot(slot) {
  if (slot.state !== "free") {
    return;
  }
  setSelectedSlots((current) => {
    const exists = current.some((item) => sameSlot(item.starts_at, slot.starts_at));
    if (exists) {
      return current.filter((item) => !sameSlot(item.starts_at, slot.starts_at));
    }
    const next = [...current, slot].sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
    if (next.length > 4) {
      return [slot];
    }
    return next;
  });
}

function selectSlotRange(startSlot, endSlot) {
  if (!startSlot || !endSlot || startSlot.state !== "free" || endSlot.state !== "free") {
    return;
  }
  const startMs = new Date(startSlot.starts_at).getTime();
  const endMs = new Date(endSlot.starts_at).getTime();
  const min = Math.min(startMs, endMs);
  const max = Math.max(startMs, endMs);
  const range = availability
    .filter((slot) => {
      const time = new Date(slot.starts_at).getTime();
      return slot.state === "free" && time >= min && time <= max;
    })
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
  setSelectedSlots(range);
}

function startSlotDrag(slot) {
  if (slot.state !== "free") {
    return;
  }
  setDragStartSlot(slot);
  setIsDraggingSlots(true);
  setSelectedSlots([slot]);
}

function moveSlotDrag(slot) {
  if (!isDraggingSlots || !dragStartSlot) {
    return;
  }
  selectSlotRange(dragStartSlot, slot);
}

function endSlotDrag(slot) {
  if (isDraggingSlots && dragStartSlot) {
    selectSlotRange(dragStartSlot, slot);
  }
  setIsDraggingSlots(false);
  setDragStartSlot(null);
}

async function holdAndConfirm() {
  setError("");
  setSuccess("");
  if (!isAuthed) {
    setError("Увійди в акаунт, щоб забронювати корт.");
    setView("cabinet");
    return;
  }
  if (!activeCourt) {
    setError("Обери корт.");
    return;
  }
  if (!canConfirmSelection) {
    setError("Обери мінімум два суміжні 30-хвилинні слоти.");
    return;
  }
  try {
    const slotStarts = selectedSlots.map((slot) => slot.starts_at);
    const hold = await api.holdBooking({ court_id: activeCourt.id, slot_starts: slotStarts });
    const confirmed = await api.confirmBooking({ hold_token: hold.hold_token });
    addLog("Hold+Confirm", { hold, confirmed });
    setSuccess("Корт заброньовано. Деталі вже у твоєму кабінеті.");
    setView("success");
    await loadCabinet();
    await loadAvailability(activeCourt.id, weekStart);
  } catch (err) {
    setError(err.message);
  }
}

async function createCourt(event) {
  event.preventDefault();
  try {
    await api.createCourt({ ...newCourt, price_per_hour: Number(newCourt.price_per_hour) });
    setNewCourt({ name: "", city: "Kyiv", district: "Pechersk", address: "", surface: "Hard", price_per_hour: 700, opening_time: "07:00", closing_time: "22:00" });
    await loadCourts();
  } catch (err) {
    setError(err.message);
  }
}

async function updateCourtPrice(courtId, price) {
  try {
    await api.updateCourt(courtId, { price_per_hour: Number(price) });
    await loadCourts();
  } catch (err) {
    setError(err.message);
  }
}

async function updateCourtHours(courtId, openingTime, closingTime) {
  try {
    await api.updateCourt(courtId, { opening_time: openingTime, closing_time: closingTime });
    await loadCourts();
    if (courtId === activeCourtId) {
      await loadAvailability(courtId, weekStart);
    }
  } catch (err) {
    setError(err.message);
  }
}

async function triggerReplay() {
  setError("");
  try {
    const result = await api.replayEventLog();
    addLog("Replay finished", result);
  } catch (err) {
    setError(err.message);
  }
}

