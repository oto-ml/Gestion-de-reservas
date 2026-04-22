export type UserRole = 'admin' | 'staff';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  noShowCount: number;
  totalBookings: number;
  lastBookingDate?: string;
  isNoShowAlert?: boolean;
}

export type RoomType = 'standard' | 'deluxe' | 'suite';
export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  price: number;
  status: RoomStatus;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'checked-in' | 'checked-out';

export interface Booking {
  id: string;
  guestId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  cancellationProbability: number;
  totalPrice: number;
  paymentMethod?: string;
  msi?: boolean;
  createdAt: string;
  guestName?: string; // Denormalized for easier listing
  roomNumber?: string; // Denormalized
}

export interface HistoricPattern {
  month: string;
  bookings: number;
  occupancy: number;
  cancelRate: number;
}
