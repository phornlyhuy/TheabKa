import React, { useState } from 'react';
import { CheckCircle2, XCircle, Heart, Send, Users, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Guest, Language, RsvpStatus } from '../../types/wedding';
import { storage } from '../../services/storage';
import { isSupabaseConfigured, submitRemoteRsvp } from '../../services/supabase';

interface RSVPModalProps {
  guest: Guest;
  lang: Language;
  onRsvpSuccess: (updatedGuest: Guest) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const RSVPModal: React.FC<RSVPModalProps> = ({ guest, lang, onRsvpSuccess, isOpen, onClose }) => {
  const [status, setStatus] = useState<RsvpStatus>(guest.rsvpStatus || 'attending');
  const [attendeesCount, setAttendeesCount] = useState<number>(
    guest.attendingGuestsCount > 0 ? guest.attendingGuestsCount : guest.allocatedSeats || 1
  );
  const [dietary, setDietary] = useState<string>(guest.dietaryRequirements || '');
  const [wishes, setWishes] = useState<string>(guest.guestWishes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    let updated: Guest | null;
    try {
      updated = isSupabaseConfigured
        ? await submitRemoteRsvp(
          guest.token,
          status,
          status === 'attending' ? attendeesCount : 0,
          dietary,
          wishes,
        )
        : storage.submitRsvp(
          guest.token,
          status,
          status === 'attending' ? attendeesCount : 0,
          dietary,
          wishes,
        );
    } catch (error) {
      console.error('Failed to save guest RSVP', error);
      setSubmitError('មិនអាចរក្សាទុកការឆ្លើយតបបានទេ។ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត ហើយសាកល្បងម្តងទៀត។');
      setIsSubmitting(false);
      return;
    }

    if (updated) {
      if (status === 'attending') {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#b48325', '#f6e27a', '#8a1324', '#ffffff'],
          });
        } catch (_) {}
      }

      setSubmittedSuccess(true);
      setTimeout(() => {
        onRsvpSuccess(updated);
        onClose();
        setSubmittedSuccess(false);
        setIsSubmitting(false);
      }, 1800);
    } else {
      setIsSubmitting(false);
      setSubmitError('តំណភ្ជាប់នេះមិនសកម្មទៀតទេ។ សូមទាក់ទងម្ចាស់កម្មវិធី។');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
    <div className="relative w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-amber-300/60 overflow-y-auto overscroll-contain animate-fadeIn">
        {/* Header with Deep Burgundy */}
        <div className="bg-[#420914] p-4 sm:p-6 text-white text-center relative">
          <div className="absolute top-2 right-4">
            <button
              onClick={onClose}
              type="button"
              className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
          <Heart className="w-8 h-8 text-amber-300 mx-auto mb-2 animate-pulse" />
          <h3 className="font-moul text-lg md:text-xl text-amber-100">
            {lang === 'km' ? 'ការឆ្លើយតបការអញ្ជើញ (RSVP)' : 'RSVP Response'}
          </h3>
          <p className="text-xs md:text-sm text-amber-200/90 mt-1">
            {guest.honorificKm} {guest.nameKm}
          </p>
        </div>

        {submittedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-moul text-lg text-stone-800">
              {lang === 'km' ? 'សូមអរគុណយ៉ាងជ្រាលជ្រៅ!' : 'Thank You So Much!'}
            </h4>
            <p className="text-sm text-stone-600">
              {lang === 'km'
                ? 'ព័ត៌មានឆ្លើយតបរបស់លោកអ្នកត្រូវបានកត់ត្រាទុកដោយជោគជ័យ។ គ្រួសារយើងខ្ញុំពិតជារីករាយ និងរង់ចាំស្វាគមន៍លោកអ្នក!'
                : 'Your RSVP response has been successfully recorded. We look forward to celebrating with you!'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
            {submitError && (
              <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                {submitError}
              </div>
            )}
            {/* Status Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                {lang === 'km' ? 'សូមជ្រើសរើសការចូលរួម' : 'Will you attend?'}
              </label>
              <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('attending')}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    status === 'attending'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600'
                  }`}
                >
                  <CheckCircle2 className={`w-5 h-5 ${status === 'attending' ? 'text-emerald-600' : 'text-stone-400'}`} />
                  <span className="font-medium text-sm">
                    {lang === 'km' ? 'ចូលរួមដោយរីករាយ' : 'Delighted to Attend'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('declined')}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    status === 'declined'
                      ? 'border-rose-600 bg-rose-50/80 text-rose-900 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600'
                  }`}
                >
                  <XCircle className={`w-5 h-5 ${status === 'declined' ? 'text-rose-600' : 'text-stone-400'}`} />
                  <span className="font-medium text-sm">
                    {lang === 'km' ? 'មិនអាចចូលរួមបាន' : 'Regretfully Decline'}
                  </span>
                </button>
              </div>
            </div>

            {/* Attendees Count (only if attending) */}
            {status === 'attending' && (
              <div>
                <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-700" />
                    {lang === 'km' ? 'ចំនួនអ្នកចូលរួម' : 'Number of Guests'}
                  </span>
                  <span className="text-amber-800 text-xs lowercase">
                    ({lang === 'km' ? `អតិបរមា ${guest.allocatedSeats} នាក់` : `max ${guest.allocatedSeats} seat(s)`})
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={Math.max(1, guest.allocatedSeats || 2)}
                    value={attendeesCount}
                    onChange={(e) => setAttendeesCount(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
                  />
                  <span className="w-12 text-center font-bold text-lg text-amber-900 bg-amber-50 py-1 rounded-xl border border-amber-200">
                    {attendeesCount}
                  </span>
                </div>
              </div>
            )}

            {/* Dietary / Special note */}
            {status === 'attending' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                  {lang === 'km' ? 'ចំណាំអាហារ (ប្រសិនបើមាន)' : 'Dietary Requirements / Allergies'}
                </label>
                <input
                  type="text"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  placeholder={lang === 'km' ? 'ឧ. បួស, អាលែកហ្ស៊ីអាហារសមុទ្រ, មិនពិសារគ្រឿងស្រវឹង...' : 'e.g., Vegetarian, Seafood allergy, Halal...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            )}

            {/* Wishes and Blessings */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                <MessageSquare className="w-4 h-4 text-amber-700" />
                {lang === 'km' ? 'ពាក្យជូនពរដល់គូស្វាមីភរិយាថ្មី' : 'Wedding Wishes & Message'}
              </label>
              <textarea
                rows={3}
                maxLength={1000}
                value={wishes}
                onChange={(e) => setWishes(e.target.value)}
                placeholder={lang === 'km' ? 'សូមសរសេរពាក្យជូនពរនៅទីនេះ...' : 'Write your warm blessings for the newlyweds...'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-[#420914] hover:bg-[#32060f] text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? (lang === 'km' ? 'កំពុងរក្សាទុក...' : 'Submitting...')
                    : (lang === 'km' ? 'ផ្ញើជូនពរ / បញ្ជាក់ការឆ្លើយតប' : 'Send Wishes & Submit RSVP')}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
