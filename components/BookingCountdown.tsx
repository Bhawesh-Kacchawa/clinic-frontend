"use client";

import { useEffect, useRef, useState } from "react";

interface BookingCountdownProps {
  bookingOpensAt: string;
  serverTime: string;
  onComplete: () => void;
}

function getRemainingSeconds(
  opensAt: number,
  serverClientOffset: number,
  clientTime: number,
): number {
  return Math.max(0, Math.ceil((opensAt - (clientTime + serverClientOffset)) / 1000));
}

export function BookingCountdown({
  bookingOpensAt,
  serverTime,
  onComplete,
}: BookingCountdownProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const completedFor = useRef<string | null>(null);

  useEffect(() => {
    const opensAt = Date.parse(bookingOpensAt);
    const serverTimestamp = Date.parse(serverTime);
    if (!Number.isFinite(opensAt) || !Number.isFinite(serverTimestamp)) {
      setRemainingSeconds(null);
      return;
    }

    const serverClientOffset = serverTimestamp - Date.now();
    const alreadyCompleted = completedFor.current === bookingOpensAt;
    let completed = alreadyCompleted;

    const updateCountdown = () => {
      const remaining = getRemainingSeconds(opensAt, serverClientOffset, Date.now());
      setRemainingSeconds(remaining);

      if (remaining === 0) {
        if (!completed) {
          completed = true;
          completedFor.current = bookingOpensAt;
          onComplete();
        }
        return true;
      }

      return false;
    };

    if (updateCountdown()) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (updateCountdown()) {
        window.clearInterval(intervalId);
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [bookingOpensAt, onComplete, serverTime]);

  if (remainingSeconds === null) {
    return (
      <p role="status" className="mt-4 text-sm text-slate-500">
        Booking time unavailable.
      </p>
    );
  }

  if (remainingSeconds === 0) {
    return null;
  }

  const minutes = Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (remainingSeconds % 60).toString().padStart(2, "0");

  return (
    <p aria-live="polite" className="mt-4 text-sm font-medium text-cyan-800">
      Booking opens in {minutes}:{seconds}
    </p>
  );
}
