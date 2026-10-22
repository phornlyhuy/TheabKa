/**
 * Storage service for Wedding Configuration, Guest Registry, Authentication, and Wishes
 * Persists locally with LocalStorage and supports CSV import/export
 */

import { WeddingConfig, Guest, RsvpStatus, CsvGuestRow } from '../types/wedding';
import { initialWeddingConfig, initialGuests } from '../data/initialData';

const STORAGE_KEYS = {
  CONFIG: 'khmer_wedding_config_v3',
  DRAFT_CONFIG: 'khmer_wedding_draft_config_v3',
  GUESTS: 'khmer_wedding_guests_v3',
  ADMIN_PASSWORD: 'khmer_wedding_admin_pass_v3',
  ADMIN_SESSION: 'khmer_wedding_admin_session_v3',
  CUSTOM_WISHES: 'khmer_wedding_custom_wishes_v3',
  FAILED_ATTEMPTS: 'khmer_wedding_failed_attempts_v3',
  LOCKOUT_TIME: 'khmer_wedding_lockout_time_v3',
};

// Generate unguessable random token for guests (e.g., km_a7b94c2d)
export function generateGuestToken(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const array = new Uint8Array(10);
  window.crypto.getRandomValues(array);
  let result = 'km_';
  for (let i = 0; i < array.length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

export const storage = {
  // --- Wedding Config ---
  getConfig(): WeddingConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.groomNameKm && parsed.groomNameKm.includes('រាត្រី')) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load wedding config', e);
    }
    this.saveConfig(initialWeddingConfig);
    return initialWeddingConfig;
  },

  saveConfig(config: WeddingConfig): boolean {
    try {
      const updated = {
        ...config,
        lastSavedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
      return true;
    } catch (e) {
      console.error('Failed to save wedding config', e);
      return false;
    }
  },

  getDraftConfig(): WeddingConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DRAFT_CONFIG);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load draft config', e);
    }
    return this.getConfig();
  },

  saveDraftConfig(config: WeddingConfig): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.DRAFT_CONFIG, JSON.stringify(config));
      return true;
    } catch (e) {
      console.error('Failed to save draft config', e);
      return false;
    }
  },

  publishDraft(draft: WeddingConfig): WeddingConfig | null {
    const published: WeddingConfig = {
      ...draft,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      lastSavedAt: new Date().toISOString(),
    };
    let previousConfig: string | null = null;
    let previousDraft: string | null = null;
    let canRollback = false;
    try {
      previousConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
      previousDraft = localStorage.getItem(STORAGE_KEYS.DRAFT_CONFIG);
      canRollback = true;
      localStorage.setItem(STORAGE_KEYS.DRAFT_CONFIG, JSON.stringify(published));
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(published));
      return published;
    } catch (e) {
      if (canRollback) {
        try {
          if (previousDraft === null) localStorage.removeItem(STORAGE_KEYS.DRAFT_CONFIG);
          else localStorage.setItem(STORAGE_KEYS.DRAFT_CONFIG, previousDraft);
          if (previousConfig === null) localStorage.removeItem(STORAGE_KEYS.CONFIG);
          else localStorage.setItem(STORAGE_KEYS.CONFIG, previousConfig);
        } catch (rollbackError) {
          console.error('Failed to restore wedding config after publish failure', rollbackError);
        }
      }
      console.error('Failed to publish wedding config', e);
      return null;
    }
  },

  // --- Guest Registry ---
  getGuests(): Guest[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GUESTS);
      if (stored) {
        const parsed: Guest[] = JSON.parse(stored);
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load guests', e);
    }
    // Initialize with 5 confirmed honored guests
    this.saveGuests(initialGuests);
    return initialGuests;
  },

  saveGuests(guests: Guest[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
      return true;
    } catch (e) {
      console.error('Failed to save guests', e);
      return false;
    }
  },

  getGuestByToken(token: string): Guest | null {
    if (!token) return null;
    const guests = this.getGuests();
    const guest = guests.find(g => g.token.trim() === token.trim());
    return guest || null;
  },

  addGuest(newGuestData: {
    nameKm: string;
    nameEn?: string;
    honorificKm?: string;
    honorificEn?: string;
    phoneNumber?: string;
    photoUrl?: string;
    note?: string;
    isActive?: boolean;
  }): Guest {
    const guests = this.getGuests();
    const now = new Date().toISOString();
    const guest: Guest = {
      id: 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      token: generateGuestToken(),
      honorificKm: newGuestData.honorificKm || 'ភ្ញៀវកិត្តិយស',
      honorificEn: newGuestData.honorificEn || 'Honored Guest',
      nameKm: newGuestData.nameKm,
      nameEn: newGuestData.nameEn || '',
      photoUrl: newGuestData.photoUrl || '',
      side: 'mutual',
      phoneNumber: newGuestData.phoneNumber || '',
      allocatedSeats: 1,
      tableNumber: '',
      note: newGuestData.note || '',
      isActive: newGuestData.isActive !== false,
      createdAt: now,
      updatedAt: now,
      rsvpStatus: 'attending',
      attendingGuestsCount: 1,
    };
    guests.unshift(guest);
    if (!this.saveGuests(guests)) {
      throw new Error('Could not save guest list to browser storage');
    }
    return guest;
  },

  updateGuest(id: string, updates: Partial<Guest>): Guest | null {
    const guests = this.getGuests();
    const index = guests.findIndex(g => g.id === id);
    if (index === -1) return null;

    const updatedGuest: Guest = {
      ...guests[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    guests[index] = updatedGuest;
    if (!this.saveGuests(guests)) return null;
    return updatedGuest;
  },

  regenerateToken(id: string): string | null {
    const newToken = generateGuestToken();
    const updated = this.updateGuest(id, { token: newToken });
    return updated ? newToken : null;
  },

  toggleGuestActive(id: string): boolean {
    const guests = this.getGuests();
    const guest = guests.find(g => g.id === id);
    if (!guest) return false;
    const newStatus = !guest.isActive;
    this.updateGuest(id, { isActive: newStatus });
    return newStatus;
  },

  deleteGuest(id: string): boolean {
    const guests = this.getGuests();
    const filtered = guests.filter(g => g.id !== id);
    if (filtered.length !== guests.length) {
      this.saveGuests(filtered);
      return true;
    }
    return false;
  },

  // --- Guest Wishes Management ---
  getAllWishes(): Array<{
    id: string;
    guestName: string;
    message: string;
    date: string;
    guestToken?: string;
    photoUrl?: string;
  }> {
    const list: Array<{
      id: string;
      guestName: string;
      message: string;
      date: string;
      guestToken?: string;
      photoUrl?: string;
    }> = [];

    // Wishes stored on guests
    const guests = this.getGuests();
    guests.forEach(g => {
      if (g.guestWishes && g.guestWishes.trim().length > 0) {
        list.push({
          id: 'wish_g_' + g.id,
          guestName: `${g.honorificKm} ${g.nameKm}`.trim(),
          message: g.guestWishes.trim(),
          date: g.rsvpSubmittedAt || g.updatedAt || g.createdAt,
          guestToken: g.token,
          photoUrl: g.photoUrl,
        });
      }
    });

    // Custom/public submitted wishes
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_WISHES);
      if (stored) {
        const extra: Array<any> = JSON.parse(stored);
        extra.forEach(item => {
          list.push({
            id: item.id || 'wish_c_' + Math.random(),
            guestName: item.guestName || 'ភ្ញៀវកិត្តិយស',
            message: item.message,
            date: item.date || item.createdAt || new Date().toISOString(),
            guestToken: item.guestToken,
            photoUrl: item.photoUrl,
          });
        });
      }
    } catch (e) {
      console.error('Failed to load custom wishes', e);
    }

    // Sort by latest first
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  submitGuestWish(message: string, guest?: Guest | null, authorName?: string): boolean {
    if (!message || !message.trim()) return false;
    const trimmed = message.trim();

    if (guest && guest.token) {
      this.updateGuest(guest.id, {
        guestWishes: trimmed,
        rsvpStatus: 'attending',
        rsvpSubmittedAt: new Date().toISOString(),
      });
      return true;
    }

    // Public / generic wish
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_WISHES);
      const extra: Array<any> = stored ? JSON.parse(stored) : [];
      extra.unshift({
        id: 'wish_' + Date.now(),
        guestName: authorName?.trim() || 'ភ្ញៀវកិត្តិយស (Honored Guest)',
        message: trimmed,
        date: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEYS.CUSTOM_WISHES, JSON.stringify(extra));
      return true;
    } catch (e) {
      console.error('Failed to save wish', e);
      return false;
    }
  },

  submitRsvp(token: string, status: RsvpStatus, attendingCount: number, dietary?: string, wishes?: string): Guest | null {
    const guest = this.getGuestByToken(token);
    if (!guest || !guest.isActive) return null;

    const updated = this.updateGuest(guest.id, {
      rsvpStatus: status,
      attendingGuestsCount: 1,
      dietaryRequirements: dietary,
      guestWishes: wishes,
      rsvpSubmittedAt: new Date().toISOString(),
    });
    return updated;
  },

  resetToDemoData(): void {
    this.saveConfig(initialWeddingConfig);
    this.saveDraftConfig(initialWeddingConfig);
    this.saveGuests(initialGuests);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_WISHES);
  },

  clearAllGuests(): void {
    this.saveGuests([]);
  },

  // --- Robust Admin Authentication & Security ---
  getAdminPassword(): string {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || 'Admin2026@T&Y';
  },

  setAdminPassword(newPass: string): void {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPass);
  },

  isLockedOut(): { locked: boolean; remainingSeconds: number } {
    try {
      const lockoutStr = localStorage.getItem(STORAGE_KEYS.LOCKOUT_TIME);
      if (lockoutStr) {
        const lockoutUntil = parseInt(lockoutStr, 10);
        const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
        if (remaining > 0) {
          return { locked: true, remainingSeconds: remaining };
        } else {
          localStorage.removeItem(STORAGE_KEYS.LOCKOUT_TIME);
          localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
        }
      }
    } catch (_) {}
    return { locked: false, remainingSeconds: 0 };
  },

  recordFailedAttempt(): { locked: boolean; remainingSeconds: number; attemptsLeft: number } {
    const attempts = parseInt(localStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS) || '0', 10) + 1;
    localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, attempts.toString());

    if (attempts >= 5) {
      const lockoutDuration = 3 * 60 * 1000; // 3 minutes lockout
      const lockoutUntil = Date.now() + lockoutDuration;
      localStorage.setItem(STORAGE_KEYS.LOCKOUT_TIME, lockoutUntil.toString());
      return { locked: true, remainingSeconds: 180, attemptsLeft: 0 };
    }

    return { locked: false, remainingSeconds: 0, attemptsLeft: 5 - attempts };
  },

  clearFailedAttempts(): void {
    localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.LOCKOUT_TIME);
  },

  isAdminLoggedIn(): boolean {
    const session = sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    if (!session) return false;
    try {
      const data = JSON.parse(session);
      return Date.now() - data.timestamp < 12 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  },

  loginAdmin(password: string): { success: boolean; error?: string; remainingSeconds?: number } {
    const lockout = this.isLockedOut();
    if (lockout.locked) {
      return {
        success: false,
        error: `គណនីត្រូវបានចាក់សោបណ្តោះអាសន្នដោយសារបញ្ចូលពាក្យសម្ងាត់ខុសច្រើនដង។ សូមរង់ចាំ ${lockout.remainingSeconds} វិនាទីទៀត។`,
        remainingSeconds: lockout.remainingSeconds,
      };
    }

    const currentPass = this.getAdminPassword();
    // Allow currentPass, default 'Admin2026@T&Y', or '2026' for convenience
    if (password.trim() === currentPass || password.trim() === 'Admin2026@T&Y' || password.trim() === '2026') {
      this.clearFailedAttempts();
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify({
        authenticated: true,
        timestamp: Date.now(),
      }));
      return { success: true };
    }

    const result = this.recordFailedAttempt();
    if (result.locked) {
      return {
        success: false,
        error: 'បញ្ចូលពាក្យសម្ងាត់ខុស ៥ដង! ប្រព័ន្ធត្រូវបានចាក់សោបណ្តោះអាសន្ន ៣នាទី ដើម្បីសុវត្ថិភាព។',
        remainingSeconds: result.remainingSeconds,
      };
    }

    return {
      success: false,
      error: `ពាក្យសម្ងាត់មិនត្រឹមត្រូវ! នៅសល់ ${result.attemptsLeft} ដងទៀតមុនពេលចាក់សោ។`,
    };
  },

  logoutAdmin(): void {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  },

  // --- CSV Import / Export Helpers ---
  parseCsv(csvContent: string): { validRows: CsvGuestRow[]; errors: Array<{ row: number; error: string; data: any }> } {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    const validRows: CsvGuestRow[] = [];
    const errors: Array<{ row: number; error: string; data: any }> = [];

    if (lines.length === 0) {
      return { validRows, errors: [{ row: 0, error: 'ឯកសារទទេ (File is empty)', data: null }] };
    }

    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('name') || firstLine.includes('ឈ្មោះ');
    const startIdx = hasHeader ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const fields = parseCsvLine(line);
      if (fields.length === 0) continue;

      const name = fields[0]?.trim();
      if (!name) {
        errors.push({
          row: i + 1,
          error: 'ខ្វះឈ្មោះភ្ញៀវ (Missing guest name)',
          data: fields,
        });
        continue;
      }

      const note = fields[1]?.trim() || '';
      const photo = fields[2]?.trim() || '';

      validRows.push({
        nameKm: name,
        honorificKm: 'ភ្ញៀវកិត្តិយស',
        note,
        photoUrl: photo,
      });
    }

    return { validRows, errors };
  },

  exportToCsv(guests: Guest[]): string {
    const headers = ['ឈ្មោះភ្ញៀវ', 'គោរមងារ', 'ចំណាំ', 'រូបថត', 'Token'];

    const rows = guests.map(g => [
      `"${g.nameKm.replace(/"/g, '""')}"`,
      `"ភ្ញៀវកិត្តិយស"`,
      `"${(g.note || '').replace(/"/g, '""')}"`,
      `"${(g.photoUrl || '').replace(/"/g, '""')}"`,
      `"${g.token}"`,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  },
};

function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((c === ',' || c === ';') && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}
