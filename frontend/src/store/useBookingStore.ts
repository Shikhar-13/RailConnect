import { create } from "zustand";
import { PassengerDetail, BookingRequest, BookingResponse } from "../types";

interface BookingState {
  // Current search/selection
  selectedTrainId: number | null;
  selectedScheduleId: number | null;
  selectedClassType: string | null;
  selectedSeatClassId: number | null;
  fromStationId: number | null;
  toStationId: number | null;
  fromStopOrder: number | null;
  toStopOrder: number | null;
  selectedDate: string | null;

  // Booking data
  passengers: PassengerDetail[];
  bookingType: "NORMAL" | "TATKAL";

  // Response/Status
  currentBooking: BookingResponse | null;

  // Actions
  setSelection: (data: Partial<BookingState>) => void;
  addPassenger: (passenger: PassengerDetail) => void;
  removePassenger: (index: number) => void;
  updatePassenger: (index: number, passenger: PassengerDetail) => void;
  resetBooking: () => void;
  setBookingResponse: (response: BookingResponse | null) => void;
}

const initialState = {
  selectedTrainId: null,
  selectedScheduleId: null,
  selectedClassType: null,
  selectedSeatClassId: null,
  fromStationId: null,
  toStationId: null,
  fromStopOrder: null,
  toStopOrder: null,
  selectedDate: null,
  passengers: [],
  bookingType: "NORMAL" as const,
  currentBooking: null,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setSelection: (data) => set((state) => ({ ...state, ...data })),

  addPassenger: (passenger) =>
    set((state) => ({
      passengers: state.passengers.length < 6
        ? [...state.passengers, passenger]
        : state.passengers
    })),

  removePassenger: (index) =>
    set((state) => ({
      passengers: state.passengers.filter((_, i) => i !== index)
    })),

  updatePassenger: (index, passenger) =>
    set((state) => ({
      passengers: state.passengers.map((p, i) => i === index ? passenger : p)
    })),

  resetBooking: () => set(initialState),

  setBookingResponse: (response) => set({ currentBooking: response }),
}));
