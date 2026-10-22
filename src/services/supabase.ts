import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Guest, WeddingConfig, WeddingWish } from '../types/wedding';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
}

export async function fetchGuestByToken(token: string): Promise<Guest | null> {
  const { data, error } = await requireSupabase().rpc('get_guest_by_token', { p_token: token });
  if (error) throw error;
  return data as Guest | null;
}

export async function fetchAdminGuests(): Promise<Guest[]> {
  const { data, error } = await requireSupabase()
    .from('wedding_guests')
    .select('data')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => row.data as Guest);
}

export async function saveAdminGuests(guests: Guest[]): Promise<void> {
  if (guests.length === 0) return;
  const { error } = await requireSupabase().from('wedding_guests').upsert(
    guests.map(guest => ({
      id: guest.id,
      token: guest.token,
      data: guest,
      updated_at: guest.updatedAt,
    })),
    { onConflict: 'id' },
  );
  if (error) throw error;
}

export async function deleteAdminGuest(id: string): Promise<void> {
  const { error } = await requireSupabase().from('wedding_guests').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchPublishedWeddingConfig(): Promise<WeddingConfig | null> {
  const { data, error } = await requireSupabase().rpc('get_published_wedding_config');
  if (error) throw error;
  return data as WeddingConfig | null;
}

export async function publishWeddingConfig(config: WeddingConfig): Promise<void> {
  const { error } = await requireSupabase().from('wedding_config').upsert({
    id: 'default',
    data: config,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function submitRemoteRsvp(
  token: string,
  status: Guest['rsvpStatus'],
  attendingCount: number,
  dietary?: string,
  wishes?: string,
): Promise<Guest | null> {
  const { data, error } = await requireSupabase().rpc('submit_guest_rsvp', {
    p_token: token,
    p_status: status,
    p_attending_count: attendingCount,
    p_dietary: dietary || null,
    p_wishes: wishes || null,
  });
  if (error) throw error;
  return data as Guest | null;
}

function mapWish(row: {
  id: string;
  guest_name: string;
  message: string;
  created_at: string;
}): WeddingWish {
  return {
    id: row.id,
    guestName: row.guest_name,
    message: row.message,
    date: row.created_at,
  };
}

export async function fetchPublicWishes(): Promise<WeddingWish[]> {
  const { data, error } = await requireSupabase().rpc('get_public_wedding_wishes');
  if (error) throw error;
  return (data || []).map(mapWish);
}

export async function fetchAdminWishes(): Promise<WeddingWish[]> {
  const { data, error } = await requireSupabase()
    .from('wedding_wishes')
    .select('id,guest_name,message,created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapWish);
}

export async function submitRemoteWish(token: string | null, message: string): Promise<void> {
  const { error } = await requireSupabase().rpc('submit_guest_wish', {
    p_token: token,
    p_message: message,
  });
  if (error) throw error;
}

export async function deleteAdminWish(id: string): Promise<void> {
  const { error } = await requireSupabase().from('wedding_wishes').delete().eq('id', id);
  if (error) throw error;
}
