"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, isValid } from "date-fns";
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  UploadCloud,
  X,
  Check,
  ArrowRight,
  Image as ImageIcon,
  StickyNote,
  Sparkles,
  RotateCcw,
  BadgePercent,
  Loader2,
  CheckCircle,
  Camera,
} from "lucide-react";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { toast } from "sonner";
import { savedAddresses, timeSlots, mockUser } from "@workspace/data/mockData";
import {
  loadDraft,
  saveDraft,
  clearDraft,
  fileToDataUrl,
} from "@workspace/data/bookingPersistence";
import {
  findCoupon,
  computeDiscount,
  saveUserPickup,
} from "@workspace/data/mockPickups";
import CameraCaptureDialog, {
  type CapturedImage,
} from "@/components/CameraCaptureDialog";

const BASE_FEE = 149;
const MAX_IMAGES = 4;
const MAX_IMAGE_MB = 5;

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const maxDate = () => {
  const d = today();
  d.setDate(d.getDate() + 6);
  return d;
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingSummaryListProps {
  date: Date | undefined;
  selectedSlot: (typeof timeSlots)[number] | undefined;
  selectedAddress: (typeof savedAddresses)[number] | undefined;
  notes: string;
  images: CapturedImage[];
  couponCode: string | undefined;
  discount: number;
}

type SaveStatus = "idle" | "saving" | "saved";
type DialogStep = "review" | "success";

// ─── Shared summary list used by review + success states ─────────────────────

const BookingSummaryList = ({
  date,
  selectedSlot,
  selectedAddress,
  notes,
  images,
  couponCode,
  discount,
}: BookingSummaryListProps) => (
  <dl className="space-y-3 text-sm">
    <div className="flex justify-between">
      <dt className="text-[#596155]">Date</dt>
      <dd className="text-[#121710]">
        {date ? format(date, "EEEE, d MMM") : "—"}
      </dd>
    </div>
    <div className="flex justify-between">
      <dt className="text-[#596155]">Slot</dt>
      <dd className="text-[#121710]">{selectedSlot?.range || "—"}</dd>
    </div>
    <div className="flex justify-between gap-4">
      <dt className="text-[#596155]">Address</dt>
      <dd className="text-right text-[#121710] max-w-[60%]">
        {selectedAddress
          ? `${selectedAddress.label} · ${selectedAddress.line1}`
          : "—"}
      </dd>
    </div>
    {notes && (
      <div className="flex justify-between gap-4">
        <dt className="text-[#596155]">Notes</dt>
        <dd className="text-right text-[#121710] max-w-[60%] truncate">
          {notes}
        </dd>
      </div>
    )}
    {images.length > 0 && (
      <div className="flex justify-between">
        <dt className="text-[#596155]">Pictures</dt>
        <dd className="text-[#121710]">{images.length} attached</dd>
      </div>
    )}
    {couponCode && discount > 0 && (
      <div className="flex justify-between">
        <dt className="text-[#596155]">
          Discount{" "}
          <span className="font-mono-label text-[10px] text-[#C45B38]">
            {couponCode}
          </span>
        </dt>
        <dd className="text-[#C45B38]">− ₹{discount}</dd>
      </div>
    )}
  </dl>
);

// ─── Autosave indicator ───────────────────────────────────────────────────────

const SaveIndicator = ({
  status,
  lastSavedAt,
}: {
  status: SaveStatus;
  lastSavedAt: Date | null;
}) => {
  if (status === "idle") return null;
  if (status === "saving") {
    return (
      <span
        data-testid="autosave-indicator"
        data-status="saving"
        className="inline-flex items-center gap-2 rounded-sm border border-[#D1CDBC] bg-white px-2.5 py-1.5 font-mono-label text-[10px] text-[#596155]"
      >
        <Loader2 size={12} className="animate-spin" />
        Saving...
      </span>
    );
  }
  return (
    <span
      data-testid="autosave-indicator"
      data-status="saved"
      className="inline-flex items-center gap-2 rounded-sm border border-[#D1CDBC] bg-white px-2.5 py-1.5 font-mono-label text-[10px] text-[#596155]"
    >
      <CheckCircle size={12} className="text-[#284226]" />
      Saved locally
      {lastSavedAt && (
        <span className="text-[#596155]/70">
          · {format(lastSavedAt, "HH:mm")}
        </span>
      )}
    </span>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const BookPickup = () => {
  const router = useRouter();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [addressId, setAddressId] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<ReturnType<
    typeof findCoupon
  > | null>(null);
  const [couponError, setCouponError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<DialogStep>("review");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const min = useMemo(() => today(), []);
  const max = useMemo(() => maxDate(), []);

  const selectedAddress = savedAddresses.find((a) => a.id === addressId);
  const selectedSlot = timeSlots.find((s) => s.id === slotId);

  const discount = useMemo(
    () => computeDiscount(appliedCoupon, BASE_FEE),
    [appliedCoupon]
  );
  const total = Math.max(0, BASE_FEE - discount);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydrate from localStorage on first mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      if (draft.date) {
        const parsed = parseISO(draft.date);
        if (isValid(parsed) && parsed >= min && parsed <= max) setDate(parsed);
      }
      if (draft.slotId) setSlotId(draft.slotId);
      if (draft.addressId) setAddressId(draft.addressId);
      if (typeof draft.notes === "string") setNotes(draft.notes);
      if (Array.isArray(draft.images)) setImages(draft.images);
      else if (draft.image?.url) setImages([draft.image]);
      if (draft.couponCode) {
        const c = findCoupon(draft.couponCode);
        if (c) {
          setAppliedCoupon(c);
          setCouponInput(c.code);
        }
      }
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist (debounced) after hydration
  useEffect(() => {
    if (!hydrated) return;
    const empty =
      !date && !slotId && !addressId && !notes && images.length === 0 && !appliedCoupon;
    if (empty) {
      clearDraft();
      setSaveStatus("idle");
      setLastSavedAt(null);
      return;
    }
    setSaveStatus("saving");
    const tSave = setTimeout(() => {
      saveDraft({
        date: date ? date.toISOString() : null,
        slotId,
        addressId,
        notes,
        images,
        couponCode: appliedCoupon?.code ?? null,
      });
      setLastSavedAt(new Date());
      setSaveStatus("saved");
    }, 350);
    return () => clearTimeout(tSave);
  }, [date, slotId, addressId, notes, images, appliedCoupon, hydrated]);

  const onPickImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      toast.error(`You can attach up to ${MAX_IMAGES} pictures.`);
      return;
    }
    const accepted = files.slice(0, room);
    const next: CapturedImage[] = [];
    for (const file of accepted) {
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        toast.error(`${file.name} is over ${MAX_IMAGE_MB} MB and was skipped.`);
        continue;
      }
      try {
        const url = await fileToDataUrl(file);
        next.push({ name: file.name, type: file.type, size: file.size, url });
      } catch {
        toast.error(`Couldn't read ${file.name}.`);
      }
    }
    if (next.length) setImages((prev) => [...prev, ...next]);
    if (files.length > room) toast(`Only added ${room} — limit is ${MAX_IMAGES}.`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  const onCameraCapture = (img: CapturedImage) => {
    if (images.length >= MAX_IMAGES) {
      toast.error(`You can attach up to ${MAX_IMAGES} pictures.`);
      return;
    }
    setImages((prev) => [...prev, img]);
  };

  const openCamera = () => {
    if (images.length >= MAX_IMAGES) {
      toast.error(`You can attach up to ${MAX_IMAGES} pictures.`);
      return;
    }
    setCameraOpen(true);
  };

  const clearAllImages = () => {
    setImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const applyCoupon = () => {
    const code = couponInput.trim();
    if (!code) { setCouponError("Enter a promo code."); return; }
    const c = findCoupon(code);
    if (!c) {
      setCouponError("That code isn't valid.");
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(c);
    setCouponInput(c.code);
    setCouponError("");
    toast.success(`${c.code} applied · ${c.description}.`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const canSubmit = !!(date && slotId && addressId);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Please pick a date, a time slot and a saved address before booking.");
      return;
    }
    setDialogStep("review");
    setConfirmOpen(true);
  };

  const confirmBooking = () => {
    const id = `BC-${Math.floor(Math.random() * 9000) + 1000}`;
    setBookingId(id);
    saveUserPickup({
      id,
      date: date!.toISOString(),
      slotId,
      addressId,
      notes,
      images,
      status: "scheduled",
      createdAt: new Date().toISOString(),
      fee: BASE_FEE,
      discount,
      couponCode: appliedCoupon?.code ?? null,
    });
    clearDraft();
    setSaveStatus("idle");
    setLastSavedAt(null);
    setDialogStep("success");
  };

  const closeAndReset = () => {
    setConfirmOpen(false);
    setTimeout(() => {
      setDate(undefined);
      setSlotId(null);
      setAddressId("");
      setNotes("");
      clearAllImages();
      setCouponInput("");
      setAppliedCoupon(null);
      setCouponError("");
      setBookingId(null);
      setDialogStep("review");
      clearDraft();
    }, 220);
  };

  const handleDialogChange = (open: boolean) => {
    if (!open && dialogStep === "success") { closeAndReset(); return; }
    setConfirmOpen(open);
  };

  const resetDraft = () => {
    setDate(undefined);
    setSlotId(null);
    setAddressId("");
    setNotes("");
    clearAllImages();
    setCouponInput("");
    setAppliedCoupon(null);
    setCouponError("");
    clearDraft();
    setSaveStatus("idle");
    setLastSavedAt(null);
    toast("Draft cleared.");
  };

  const hasAnyValue = !!(date || slotId || addressId || notes || images.length || appliedCoupon);

  return (
    <div data-testid="book-pickup-page" className="px-5 sm:px-10 lg:px-14 py-8 lg:py-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
        <div>
          <p className="font-mono-label text-xs text-[#596155]">
            [ dashboard · new booking ]
          </p>
          <h1 className="mt-3 font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#121710]">
            Schedule a pickup
          </h1>
          <p className="mt-3 text-[#596155] max-w-2xl">
            Hi {mockUser.name.split(" ")[0]} — pick a day in the next week,
            choose a 2-hour slot, and we&apos;ll handle the rest. Your progress
            is saved automatically.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start">
          <SaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
          {hasAnyValue && (
            <button
              type="button"
              onClick={resetDraft}
              data-testid="book-clear-draft-btn"
              className="inline-flex items-center gap-2 rounded-sm border border-[#D1CDBC] px-3 py-2 text-xs font-medium text-[#596155] hover:border-[#121710] hover:text-[#121710] transition-colors"
            >
              <RotateCcw size={14} /> Clear draft
            </button>
          )}
        </div>
      </header>

      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          {/* 01 · Date */}
          <section data-testid="section-date" className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226]">
                <CalendarIcon size={14} />
              </span>
              <p className="font-mono-label text-xs text-[#596155]">01 · Pickup date</p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  data-testid="date-picker-trigger"
                  className="flex h-14 w-full items-center justify-between rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] px-4 text-left text-base text-[#121710] hover:bg-[#EDE9DC] focus:outline-none focus:ring-2 focus:ring-[#284226]"
                >
                  {date ? format(date, "EEEE, d MMMM yyyy") : "Pick a date in the next 7 days"}
                  <CalendarIcon size={18} className="text-[#596155]" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-sm border-[#D1CDBC]" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  fromDate={min}
                  toDate={max}
                  disabled={(d) => d < min || d > max}
                  initialFocus
                  data-testid="date-picker-calendar"
                />
              </PopoverContent>
            </Popover>
            <p className="mt-3 text-xs text-[#596155]">
              Bookings open for the next 7 days. Need something further out?{" "}
              <span className="text-[#C45B38]">Switch to a Weekly plan.</span>
            </p>
          </section>

          {/* 02 · Time Slot */}
          <section data-testid="section-timeslot" className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226]">
                <Clock size={14} />
              </span>
              <p className="font-mono-label text-xs text-[#596155]">02 · Time slot</p>
            </div>
            <div role="radiogroup" data-testid="timeslot-group" className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {timeSlots.map((s) => {
                const active = s.id === slotId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    data-testid={`timeslot-${s.id}`}
                    onClick={() => setSlotId(s.id)}
                    className={`rounded-sm border p-4 text-left transition-all ${
                      active
                        ? "border-[#284226] bg-[#284226] text-[#F7F5F0]"
                        : "border-[#D1CDBC] bg-[#F7F5F0] text-[#121710] hover:border-[#284226]"
                    }`}
                  >
                    <p className="font-display text-base font-bold tracking-tight">{s.range}</p>
                    <p className={`mt-1 text-xs ${active ? "text-[#F7F5F0]/70" : "text-[#596155]"}`}>
                      {s.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 03 · Address */}
          <section data-testid="section-address" className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226]">
                <MapPin size={14} />
              </span>
              <p className="font-mono-label text-xs text-[#596155]">03 · Pickup address</p>
            </div>
            <Label className="sr-only">Pickup address</Label>
            <Select value={addressId} onValueChange={setAddressId}>
              <SelectTrigger
                data-testid="address-select-trigger"
                className="h-14 rounded-sm border-[#D1CDBC] bg-[#F7F5F0] focus:ring-[#284226] text-base"
              >
                <SelectValue placeholder="Choose a saved address" />
              </SelectTrigger>
              <SelectContent className="rounded-sm">
                {savedAddresses.map((a) => (
                  <SelectItem key={a.id} value={a.id} data-testid={`address-option-${a.id}`} className="py-3">
                    <div>
                      <p className="font-medium text-[#121710]">{a.label}</p>
                      <p className="text-xs text-[#596155]">
                        {a.line1}, {a.city} — {a.pincode}
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAddress && (
              <p className="mt-3 text-sm text-[#596155]" data-testid="address-selected-preview">
                {selectedAddress.line1}, {selectedAddress.city} — {selectedAddress.pincode}
              </p>
            )}
          </section>

          {/* 04 · Notes */}
          <section data-testid="section-notes" className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226]">
                  <StickyNote size={14} />
                </span>
                <p className="font-mono-label text-xs text-[#596155]">04 · Additional notes</p>
              </div>
              <p className="font-mono-label text-[10px] text-[#596155]">Optional</p>
            </div>
            <Label htmlFor="notes" className="sr-only">Additional notes</Label>
            <Textarea
              id="notes"
              data-testid="notes-textarea"
              rows={4}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Gate code, e-waste mixed in, leave bags by the side gate..."
              className="rounded-sm border-[#D1CDBC] focus-visible:ring-[#284226]"
            />
            <p className="mt-2 text-right text-xs text-[#596155]">{notes.length}/500</p>
          </section>

          {/* 05 · Pictures */}
          <section data-testid="section-pictures" className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226]">
                  <ImageIcon size={14} />
                </span>
                <p className="font-mono-label text-xs text-[#596155]">05 · Pictures</p>
              </div>
              <p className="font-mono-label text-[10px] text-[#596155]">
                {images.length}/{MAX_IMAGES} · up to {MAX_IMAGE_MB} MB each
              </p>
            </div>

            {images.length > 0 && (
              <div data-testid="image-previews-grid" className="mb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={`${img.name}-${idx}`}
                    data-testid={`image-preview-${idx}`}
                    className="group relative overflow-hidden rounded-sm border border-[#D1CDBC]"
                  >
                    <img src={img.url} alt={img.name || `pic-${idx}`} className="h-28 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      data-testid={`image-remove-${idx}`}
                      aria-label={`Remove ${img.name}`}
                      className="absolute top-1.5 right-1.5 inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#171A15]/85 text-[#F7F5F0] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#C45B38]"
                    >
                      <X size={12} />
                    </button>
                    <p className="absolute inset-x-0 bottom-0 truncate bg-[#171A15]/85 px-2 py-1 text-[10px] text-[#F7F5F0]">
                      {img.name}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {images.length < MAX_IMAGES && (
              <div data-testid="picture-actions" className="grid gap-3 sm:grid-cols-2">
                <label
                  htmlFor="images"
                  data-testid="image-upload-label"
                  className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-[#D1CDBC] bg-[#F7F5F0] text-center transition-colors hover:border-[#284226] hover:bg-[#EDE9DC]"
                >
                  <UploadCloud size={22} className="text-[#596155]" />
                  <p className="mt-2 text-sm text-[#121710] font-medium">
                    {images.length === 0 ? "Upload from device" : "Add more from device"}
                  </p>
                  <p className="text-xs text-[#596155]">PNG / JPG · up to {MAX_IMAGE_MB} MB each</p>
                  <input
                    id="images"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onPickImages}
                    data-testid="image-input"
                    className="sr-only"
                  />
                </label>
                <button
                  type="button"
                  onClick={openCamera}
                  data-testid="open-camera-btn"
                  className="group flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-[#D1CDBC] bg-[#171A15] text-center text-[#F7F5F0] transition-colors hover:border-[#C45B38] hover:bg-[#121710]"
                >
                  <Camera size={22} className="text-[#F7F5F0]/80 group-hover:text-[#C45B38]" />
                  <p className="mt-2 text-sm font-medium">Capture with camera</p>
                  <p className="text-xs text-[#F7F5F0]/60">Takes a photo right here</p>
                </button>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT SUMMARY */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-8 rounded-sm border border-[#D1CDBC] bg-[#171A15] text-[#F7F5F0] p-6 sm:p-8">
            <p className="font-mono-label text-xs text-[#F7F5F0]/60">Booking summary</p>
            <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">On-demand pickup</h3>

            <dl className="mt-7 space-y-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#F7F5F0]/60">Date</dt>
                <dd data-testid="summary-date">{date ? format(date, "EEE, d MMM") : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#F7F5F0]/60">Slot</dt>
                <dd data-testid="summary-slot">{selectedSlot ? selectedSlot.range : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#F7F5F0]/60">Address</dt>
                <dd className="text-right max-w-[60%]" data-testid="summary-address">
                  {selectedAddress ? `${selectedAddress.label} · ${selectedAddress.city}` : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#F7F5F0]/60">Pictures</dt>
                <dd data-testid="summary-photo">
                  {images.length > 0 ? `${images.length} attached` : "—"}
                </dd>
              </div>
            </dl>

            {/* Promo code */}
            <div className="mt-8 pt-6 border-t border-[#F7F5F0]/15">
              <div className="flex items-center gap-2">
                <BadgePercent size={14} className="text-[#C45B38]" />
                <p className="font-mono-label text-[10px] text-[#F7F5F0]/60">Promo code</p>
              </div>
              {appliedCoupon ? (
                <div data-testid="coupon-applied" className="mt-3 flex items-center justify-between gap-2 rounded-sm border border-[#284226] bg-[#284226]/40 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold tracking-tight text-[#F7F5F0]" data-testid="coupon-applied-code">
                      {appliedCoupon.code}
                    </p>
                    <p className="text-[11px] text-[#F7F5F0]/70 truncate">{appliedCoupon.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    data-testid="coupon-remove-btn"
                    aria-label="Remove promo code"
                    className="rounded-sm p-1.5 text-[#F7F5F0]/70 hover:bg-[#F7F5F0]/10 hover:text-[#F7F5F0]"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <Input
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      if (couponError) setCouponError("");
                    }}
                    placeholder="ENTER CODE"
                    data-testid="coupon-input"
                    className="h-10 rounded-sm bg-[#F7F5F0]/5 border-[#F7F5F0]/20 text-[#F7F5F0] placeholder:text-[#F7F5F0]/40 focus-visible:ring-[#C45B38] uppercase tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    data-testid="coupon-apply-btn"
                    className="rounded-sm bg-[#C45B38] px-3 text-xs font-medium text-[#F7F5F0] hover:bg-[#A64A2B] transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && (
                <p data-testid="coupon-error" className="mt-2 text-xs text-[#C45B38]">
                  {couponError}
                </p>
              )}
            </div>

            {/* Fee block */}
            <div className="mt-8 border-t border-[#F7F5F0]/15 pt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#F7F5F0]/60">Pickup fee</span>
                <span data-testid="summary-fee" className={discount > 0 ? "text-[#F7F5F0]/60 line-through" : "text-[#F7F5F0]"}>
                  ₹{BASE_FEE}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm" data-testid="summary-discount-row">
                  <span className="text-[#F7F5F0]/60">Discount</span>
                  <span className="text-[#C45B38]">− ₹{discount}</span>
                </div>
              )}
              <div className="flex items-end justify-between pt-2">
                <div>
                  <p className="font-mono-label text-[10px] text-[#F7F5F0]/60">Total</p>
                  <p className="font-display text-3xl font-black tracking-tight" data-testid="summary-total">
                    ₹{total}
                  </p>
                </div>
                <p className="text-xs text-[#F7F5F0]/60">GST included</p>
              </div>
            </div>

            <button
              type="submit"
              data-testid="book-submit-btn"
              disabled={!canSubmit}
              className={`mt-7 w-full inline-flex items-center justify-center gap-2 rounded-sm px-5 py-4 text-sm font-medium transition-colors ${
                canSubmit
                  ? "bg-[#C45B38] text-[#F7F5F0] hover:bg-[#A64A2B]"
                  : "bg-[#F7F5F0]/10 text-[#F7F5F0]/40 cursor-not-allowed"
              }`}
            >
              Review &amp; confirm pickup
              <ArrowRight size={16} />
            </button>
            <p className="mt-3 text-[11px] leading-relaxed text-[#F7F5F0]/50">
              You won&apos;t be charged until our partner arrives. Cancel anytime before the slot opens.
            </p>
          </div>
        </aside>
      </form>

      {/* Confirmation / Success dialog */}
      <Dialog open={confirmOpen} onOpenChange={handleDialogChange}>
        <DialogContent
          data-testid={dialogStep === "success" ? "booking-success-dialog" : "booking-confirm-dialog"}
          className="rounded-sm border-[#D1CDBC] bg-[#F7F5F0] max-w-md p-6"
        >
          {dialogStep === "review" ? (
            <>
              <DialogHeader className="text-left space-y-1.5">
                <p className="font-mono-label text-xs text-[#596155]">Confirm booking</p>
                <DialogTitle className="font-display text-2xl font-black tracking-tight text-[#121710]">
                  Ready to lock this in?
                </DialogTitle>
                <DialogDescription className="text-[#596155]">
                  Please review the details before we dispatch a partner.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-5 border-y border-[#D1CDBC] py-4">
                <BookingSummaryList
                  date={date}
                  selectedSlot={selectedSlot}
                  selectedAddress={selectedAddress}
                  notes={notes}
                  images={images}
                  couponCode={appliedCoupon?.code}
                  discount={discount}
                />
                <div className="mt-4 flex items-center justify-between">
                  <p className="font-mono-label text-[10px] text-[#596155]">Total</p>
                  <p className="font-display text-2xl font-black tracking-tight text-[#121710]" data-testid="confirm-modal-total">
                    ₹{total}
                  </p>
                </div>
              </div>
              <DialogFooter className="flex-row gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  data-testid="confirm-cancel-btn"
                  className="flex-1 rounded-sm border border-[#121710] px-4 py-3 text-sm font-medium text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0] transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={confirmBooking}
                  data-testid="confirm-book-btn"
                  className="flex-1 rounded-sm bg-[#284226] px-4 py-3 text-sm font-medium text-[#F7F5F0] hover:bg-[#1C2E1A] transition-colors"
                >
                  Confirm pickup
                </button>
              </DialogFooter>
            </>
          ) : (
            <div data-testid="booking-success">
              <DialogHeader className="text-left space-y-1.5">
                <p className="font-mono-label text-xs text-[#284226] flex items-center gap-2" data-testid="booking-success-id">
                  <Check size={12} />
                  Pickup confirmed · {bookingId}
                </p>
                <DialogTitle className="font-display text-2xl font-black tracking-tight text-[#121710]">
                  You&apos;re all set.
                </DialogTitle>
                <DialogDescription className="text-[#596155]">
                  Our partner will arrive on{" "}
                  <span className="text-[#121710] font-medium">
                    {date && format(date, "EEEE, d MMM")}
                  </span>{" "}
                  between{" "}
                  <span className="text-[#121710] font-medium">{selectedSlot?.range}</span>.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-5 border-y border-[#D1CDBC] py-4">
                <BookingSummaryList
                  date={date}
                  selectedSlot={selectedSlot}
                  selectedAddress={selectedAddress}
                  notes={notes}
                  images={images}
                  couponCode={appliedCoupon?.code}
                  discount={discount}
                />
                <div className="mt-4 flex items-center justify-between">
                  <p className="font-mono-label text-[10px] text-[#596155]">Charged</p>
                  <p className="font-display text-2xl font-black tracking-tight text-[#121710]" data-testid="success-modal-total">
                    ₹{total}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <p className="font-mono-label text-[10px] text-[#596155]">What happens next</p>
                <ol className="mt-3 space-y-2 text-sm text-[#121710]">
                  <li className="flex gap-2">
                    <Sparkles size={14} className="text-[#C45B38] mt-0.5 shrink-0" />
                    SMS confirmation sent to your phone now.
                  </li>
                  <li className="flex gap-2">
                    <Sparkles size={14} className="text-[#C45B38] mt-0.5 shrink-0" />
                    Partner name &amp; live location 30 min before pickup.
                  </li>
                  <li className="flex gap-2">
                    <Sparkles size={14} className="text-[#C45B38] mt-0.5 shrink-0" />
                    Receipt with weight &amp; recycling impact, post-pickup.
                  </li>
                </ol>
              </div>
              <DialogFooter className="flex-row gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    const id = bookingId;
                    closeAndReset();
                    router.push(`/pickups/${id}`);
                  }}
                  data-testid="booking-success-view-btn"
                  className="flex-1 rounded-sm border border-[#121710] px-4 py-3 text-sm font-medium text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0] transition-colors"
                >
                  View pickup
                </button>
                <button
                  type="button"
                  onClick={closeAndReset}
                  data-testid="booking-success-done-btn"
                  className="flex-1 rounded-sm bg-[#284226] px-4 py-3 text-sm font-medium text-[#F7F5F0] hover:bg-[#1C2E1A] transition-colors"
                >
                  Done
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CameraCaptureDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onCapture={onCameraCapture}
      />
    </div>
  );
};

export default BookPickup;
