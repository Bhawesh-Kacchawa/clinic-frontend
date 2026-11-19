"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ApiError, apiFetch } from "@/lib/api";
import type {
  CreateBookingRequest,
  CreateBookingResponse,
} from "@/types/bookings";
import type { SessionName } from "@/types/sessions";

const bookingSchema = z.object({
  patientName: z
    .string()
    .trim()
    .min(2, "Enter your name (at least 2 characters).")
    .max(100, "Name must be 100 characters or fewer."),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
  address: z.string().trim().max(500, "Address must be 500 characters or fewer."),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export function BookingFormModal({
  sessionId,
  sessionName,
  open,
  onClose,
}: {
  sessionId: string;
  sessionName: SessionName;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { patientName: "", phone: "", address: "" },
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      reset();
      setSubmitError(null);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, reset]);

  const onSubmit = handleSubmit(async ({ patientName, phone, address }) => {
    setSubmitError(null);
    try {
      if (!sessionId) {
        throw new Error("This session is missing its booking ID. Please refresh and try again.");
      }

      const request: CreateBookingRequest = {
        sessionId,
        patientName,
        phone,
        ...(address ? { address } : {}),
      };
      const result = await apiFetch<CreateBookingResponse>(
        "/api/public/bookings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        },
      );

      if (!result.bookingId) {
        throw new Error("The booking response did not include a booking ID.");
      }

      router.push(`/t/${encodeURIComponent(result.bookingId)}`);
    } catch (error) {
      setSubmitError(getBookingErrorMessage(error));
    }
  });

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="booking-modal-title"
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-950/50"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-cyan-700">
              {sessionName} session
            </p>
            <h2
              id="booking-modal-title"
              className="mt-2 text-2xl font-semibold tracking-tight"
            >
              Booking details
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close booking form"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-xl leading-6 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            &times;
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate>
          {submitError && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800"
            >
              {submitError}
            </p>
          )}
          <div>
            <label
              htmlFor="patient-name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Patient name
            </label>
            <input
              id="patient-name"
              autoComplete="name"
              {...register("patientName")}
              aria-invalid={Boolean(errors.patientName)}
              aria-describedby={
                errors.patientName ? "patient-name-error" : undefined
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 aria-invalid:border-rose-500"
              placeholder="Enter patient name"
            />
            {errors.patientName && (
              <p
                id="patient-name-error"
                role="alert"
                className="mt-2 text-sm text-rose-700"
              >
                {errors.patientName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="patient-phone"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              10-digit Indian mobile number
            </label>
            <div className="flex rounded-xl border border-slate-300 focus-within:border-cyan-600 focus-within:ring-2 focus-within:ring-cyan-100">
              <span className="flex items-center border-r border-slate-200 px-4 text-slate-500">
                +91
              </span>
              <input
                id="patient-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                {...register("phone")}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "patient-phone-error" : undefined}
                className="min-w-0 flex-1 rounded-r-xl px-4 py-3 outline-none placeholder:text-slate-400 aria-invalid:border-rose-500"
                placeholder="9876543210"
              />
            </div>
            {errors.phone && (
              <p
                id="patient-phone-error"
                role="alert"
                className="mt-2 text-sm text-rose-700"
              >
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="booking-address"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Address <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              id="booking-address"
              rows={3}
              maxLength={500}
              autoComplete="street-address"
              {...register("address")}
              aria-invalid={Boolean(errors.address)}
              aria-describedby={errors.address ? "booking-address-error" : undefined}
              className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 aria-invalid:border-rose-500"
              placeholder="Enter your address"
            />
            {errors.address && (
              <p
                id="booking-address-error"
                role="alert"
                className="mt-2 text-sm text-rose-700"
              >
                {errors.address.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Book session"}
          </button>
        </form>
      </div>
    </dialog>
  );
}

function getBookingErrorMessage(error: unknown): string {
  const details =
    error instanceof ApiError &&
    typeof error.details === "object" &&
    error.details !== null
      ? (error.details as Record<string, unknown>)
      : {};
  const code =
    typeof details.code === "string"
      ? details.code.toLowerCase().replaceAll("_", " ")
      : "";
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const reason = `${code} ${message}`;

  if (reason.includes("duplicate") || reason.includes("already booked")) {
    return "It looks like you already have a booking for this session. Please check your existing booking.";
  }
  if (reason.includes("full") || reason.includes("no slots")) {
    return "Sorry, this session has just filled up. Please choose another available session.";
  }
  if (reason.includes("closed") || reason.includes("not open")) {
    return "Bookings for this session are currently closed. Please try again when booking opens.";
  }
  if (error instanceof ApiError && error.status === 409) {
    return "This session is no longer available. Please refresh the page and try again.";
  }
  if (error instanceof ApiError) {
    return `Booking failed (${error.status}): ${error.message}`;
  }
  if (error instanceof Error) {
    return `We couldn't reach the booking service: ${error.message}`;
  }
  return "We couldn't complete your booking right now. Please try again.";
}
