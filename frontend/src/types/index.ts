export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  mobile: string;
  dob: string;
  gender: string;
  nationality: string;
  role: "USER" | "ADMIN";
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface Station {
  id: number;
  name: string;
  stationCode: string;
  city: string;
  state: string;
}

export interface StationDto {
  id: number;
  name: string;
  stationCode: string;
  city: string;
  state: string;
}

export interface TrainSearchResponse {
  sourceStation: string;
  destinationStation: string;
  searchDate: string;
  availableTrains: TrainSearchDto[];
}

export interface TrainSearchDto {
  trainId: number;
  trainName: string;
  trainNumber: string;
  departureTime: string;
  arrivalTime: string;
  totalDistance?: number;
  seatAvailabilities: SeatAvailabilitySummaryDto[];
}

export type TrainSummaryDto = TrainSearchDto;

export interface SeatAvailabilitySummaryDto {
  classType: string;
  availableSeats: number;
  estimatedFare: number;
  scheduleId?: number; // Added for convenience if backend supports it
  seatClassId?: number;
}

export interface ClassAvailability {
  classType: string;
  availableSeats: number;
  normalFare: number;
  tatkalFare: number;
  scheduleId: number;
  seatClassId: number;
}

export interface PassengerDetail {
  firstName: string;
  lastName: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  berthPreference: "LOWER" | "MIDDLE" | "UPPER" | "SIDE_LOWER" | "SIDE_UPPER" | "NONE";
  idProofType?: string;
  idProofNumber?: string;
  passengerId?: number; // for saved passengers
}

export interface BookingRequest {
  scheduleId: number;
  seatClassId: number;
  classType: string;
  bookingType: "NORMAL" | "TATKAL";
  fromStationId: number;
  toStationId: number;
  passengers: PassengerDetail[];
}

export interface TicketPassenger {
  ticketPassengerId: number;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  berthPreference: string;
  allocatedBerth: string;
  coachNumber?: string;
  berthNumber?: number;
  berthType?: string;
  passengerStatus: "CONFIRMED" | "WAITLISTED" | "CANCELLED";
  waitlistPosition?: number;
}

export interface BookingResponse {
  ticketId: number;
  pnrNumber: string;
  scheduleId: number;
  trainId: number;
  trainName?: string;
  trainNumber?: string;
  classType: string;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "WAITLISTED";
  passengers: TicketPassenger[];
  totalFare: number;
  bookingType: string;
  bookedAt: string;
  fromStationId?: number;
  toStationId?: number;
  fromStation?: string;
  toStation?: string;
  departureTime?: string;
  arrivalTime?: string;
  date?: string;
  stripeClientSecret?: string;
  message?: string;
}

export interface TatkalStatusDto {
  isOpen: boolean;
  opensAt?: string;
  scheduleId: number;
  classType: string;
}

export interface PaymentRequest {
  pnr: string;
  amount: number; // in paise
  currency: string;
}

export interface PaymentResponse {
  clientSecret: string;
  paymentIntentId: string;
  status: string;
  amount: number;
}

export interface Notification {
  id: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeTrains: number;
  totalBookingsToday: number;
  revenueToday: number;
  recentBookings: BookingResponse[];
}

export interface SeatClassInfo {
  classType: string;
  totalSeats: number;
  availableSeats: number;
  normalFare: number;
  tatkalFare: number;
}

export interface TrainResponse {
  trainId: number;
  trainName: string;
  trainNumber: string;
  fromStation?: string;
  toStation?: string;
  seatClasses?: SeatClassInfo[];
  status?: string;
}
export interface RouteDto {
  id: number;
  train_id: number;
  station_id: number;
  station_name: string;
  station_code: string;
  stop_order: number;
  arrival_time: string;
  departure_time: string;
  distance_from_source: number;
}

export interface ScheduleDto {
  id: number;
  departure_date: string;
  status: string;
  auto_generate_availability: boolean;
  seat_availabilities: any[];
}
