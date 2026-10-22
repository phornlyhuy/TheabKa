/**
 * Data structures for Khmer Digital Wedding Invitation (សិរីមង្គល)
 */

export type Language = 'km' | 'en';

export interface ScheduleItem {
  id: string;
  timeKm: string;
  timeEn: string;
  titleKm: string;
  titleEn: string;
  descriptionKm: string;
  descriptionEn: string;
  icon?: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  captionKm?: string;
  captionEn?: string;
  isCover?: boolean;
}

export type ThemePreset = 'royal-gold' | 'crimson-ruby' | 'romantic-rose' | 'emerald-sage' | 'classic-noir';

export type KhmerFontFamily = 'kantumruy' | 'moul' | 'battambang' | 'siemreap';

export interface ThemeConfig {
  preset: ThemePreset;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  cardBgColor: string;
  textColor: string;
  fontFamily: KhmerFontFamily;
  fontSize: 'sm' | 'md' | 'lg';
  ornamentStyle: 'traditional' | 'modern' | 'minimal';
}

export interface WeddingConfig {
  id: string;
  isPublished: boolean;
  publishedAt?: string;
  lastSavedAt?: string;

  // Couple Info
  groomNameKm: string;
  groomNameEn: string;
  groomTitleKm: string; // e.g. លោក
  groomTitleEn: string;

  brideNameKm: string;
  brideNameEn: string;
  brideTitleKm: string; // e.g. កញ្ញា
  brideTitleEn: string;

  // Parents Info
  groomFatherKm: string;
  groomMotherKm: string;
  groomFatherEn: string;
  groomMotherEn: string;

  brideFatherKm: string;
  brideMotherKm: string;
  brideFatherEn: string;
  brideMotherEn: string;

  // Invitation Message
  invitationTitleKm: string;
  invitationTitleEn: string;
  invitationMessageKm: string;
  invitationMessageEn: string;

  // Date and Time
  weddingDate: string; // YYYY-MM-DD
  weddingTime: string; // e.g. 17:00
  solarDateKm: string; // e.g. ថ្ងៃអាទិត្យ ទី១៥ ខែវិច្ឆិកា ឆ្នាំ២០២៦
  solarDateEn: string; // e.g. Sunday, November 15, 2026
  lunarDateKm: string; // e.g. ថ្ងៃ ៧រោច ខែកត្តិក ឆ្នាំរោង ឆស័ក ព.ស. ២៥៧០

  // Venue & Location
  venueNameKm: string;
  venueNameEn: string;
  venueAddressKm: string;
  venueAddressEn: string;
  googleMapsUrl: string;
  embedMapsUrl?: string;

  backgroundImage?: string;

  // Media
  coverImage: string;
  gallery: GalleryPhoto[];
  musicUrl?: string;
  musicAutoPlay: boolean;

  // QR / Gifts
  giftEnabled: boolean;
  giftTitleKm: string;
  giftTitleEn: string;
  giftAccountName: string;
  giftAccountNumber: string;
  giftBankName: string; // e.g. ABA Bank / Bakong KHQR
  giftQrImage?: string;

  // Modules visibility
  showRsvp: boolean;
  showCountdown: boolean;
  showCalendar: boolean;
  showGallery: boolean;
  showAgenda: boolean;
  showMusic: boolean;
  showWishesWall: boolean;

  // Agenda / Schedules
  schedules: ScheduleItem[];

  // Visual Styling
  theme: ThemeConfig;
}

export type RsvpStatus = 'attending' | 'declined' | 'pending';

export interface GuestWish {
  id: string;
  guestId: string;
  guestName: string;
  message: string;
  createdAt: string;
}

export interface WeddingWish {
  id: string;
  guestName: string;
  message: string;
  date: string;
  photoUrl?: string;
}

export interface Guest {
  id: string;
  token: string; // Cryptographic secure random token for public personalized link
  honorificKm: string; // ភ្ញៀវកិត្តិយស
  honorificEn: string;
  nameKm: string;
  nameEn?: string;
  photoUrl?: string; // Guest portrait photo so guest sees their picture upon opening link!
  side: 'groom' | 'bride' | 'mutual';
  phoneNumber?: string;
  telegramUsername?: string;
  allocatedSeats: number;
  tableNumber?: string;
  note?: string;
  isActive: boolean; // Admin can disable link
  createdAt: string;
  updatedAt: string;

  // RSVP status submitted by guest
  rsvpStatus: RsvpStatus;
  attendingGuestsCount: number;
  dietaryRequirements?: string;
  guestWishes?: string;
  rsvpSubmittedAt?: string;
}

export interface RsvpSubmission {
  token: string;
  status: RsvpStatus;
  attendingCount: number;
  dietary?: string;
  wishes?: string;
}

export interface CsvGuestRow {
  nameKm: string;
  nameEn?: string;
  honorificKm?: string;
  honorificEn?: string;
  photoUrl?: string;
  side?: string;
  phoneNumber?: string;
  allocatedSeats?: string | number;
  tableNumber?: string;
  note?: string;
}
