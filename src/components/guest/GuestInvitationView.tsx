import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Heart,
  Share2,
  ExternalLink,
  QrCode,
  Sparkles,
  Gift,
  HelpCircle,
  PenTool,
  MessageCircle,
  Send,
  Check,
  CheckCircle2,
  Download,
} from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { Guest, WeddingConfig, Language, WeddingWish } from '../../types/wedding';
import { KhmerDivider, DamaskCornerOrnament } from '../common/KhmerOrnament';
import { CountdownTimer } from './CountdownTimer';
import { AddToCalendarButton } from './AddToCalendarButton';
import { GalleryLightbox } from './GalleryLightbox';
import { storage } from '../../services/storage';
import {
  fetchPublicWishes,
  isSupabaseConfigured,
  submitRemoteWish,
} from '../../services/supabase';

interface GuestInvitationViewProps {
  config: WeddingConfig;
  guest: Guest | null;
  isPreview?: boolean;
}

export const GuestInvitationView: React.FC<GuestInvitationViewProps> = ({
  config,
  guest,
  isPreview = false,
}) => {
  const [lang, setLang] = useState<Language>('km');
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(guest);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [qrDownloadError, setQrDownloadError] = useState('');
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Dedicated Wish form state matching user screenshot
  const [wishText, setWishText] = useState(currentGuest?.guestWishes || '');
  const [isSubmittingWish, setIsSubmittingWish] = useState(false);
  const [wishSentSuccess, setWishSentSuccess] = useState(false);
  const [wishError, setWishError] = useState('');
  const [wishesList, setWishesList] = useState<WeddingWish[]>(
    isSupabaseConfigured && !isPreview ? [] : storage.getAllWishes(),
  );

  useEffect(() => {
    setCurrentGuest(guest);
    setWishText(guest?.guestWishes || '');
  }, [guest]);

  useEffect(() => {
    let isMounted = true;
    const loadWishes = async () => {
      if (!config.showWishesWall) {
        setWishesList([]);
        return;
      }
      if (isSupabaseConfigured && !isPreview) {
        try {
          const wishes = await fetchPublicWishes();
          if (isMounted) {
            setWishesList(wishes);
            setWishError('');
          }
        } catch (error) {
          console.error('Failed to load guest wishes', error);
          if (isMounted) setWishError('មិនអាចផ្ទុកសារជូនពរបានទេ។ សូមព្យាយាមម្តងទៀត។');
        }
      } else if (isMounted) {
        setWishesList(storage.getAllWishes());
      }
    };

    void loadWishes();
    return () => {
      isMounted = false;
    };
  }, [config.showWishesWall, isPreview]);

  // Generate QR code for location or gift
  useEffect(() => {
    QRCode.toDataURL(config.googleMapsUrl || window.location.href, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#4A0E17',
        light: '#ffffff',
      },
    }).then(setQrCodeDataUrl).catch(console.error);
  }, [config.googleMapsUrl]);

  const handleCopyPersonalLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2500);
  };

  const handleDownloadGiftQr = async () => {
    const qrImage = config.giftQrImage || qrCodeDataUrl;
    if (!qrImage) return;

    try {
      const response = await fetch(qrImage);
      if (!response.ok) throw new Error(`QR image request failed: ${response.status}`);

      const imageUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'Wedding-KHQR.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
      setQrDownloadError('');
    } catch (error) {
      console.error('Failed to download wedding gift QR code', error);
      setQrDownloadError(
        lang === 'km'
          ? 'មិនអាចទាញយក QR Code បានទេ។ សូមព្យាយាមម្តងទៀត។'
          : 'Could not download the QR code. Please try again.',
      );
    }
  };

  // Submit wish directly on page as shown in screenshot
  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishText.trim()) return;

    setIsSubmittingWish(true);
    try {
      if (isSupabaseConfigured && !isPreview) {
        await submitRemoteWish(currentGuest?.token || null, wishText.trim());
        setWishesList(await fetchPublicWishes());
      } else if (!storage.submitGuestWish(wishText.trim(), currentGuest)) {
        throw new Error('Could not save the wish in browser storage.');
      } else {
        setWishesList(storage.getAllWishes());
      }

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#c59b27', '#4A0E17', '#f6e27a', '#ffffff'],
        });
      } catch (error) {
        console.error('Could not display wish confirmation animation', error);
      }
      setWishError('');
      setWishSentSuccess(true);
      setTimeout(() => setWishSentSuccess(false), 4000);
    } catch (error) {
      console.error('Failed to submit guest wish', error);
      setWishError('មិនអាចរក្សាទុកសារបានទេ។ សូមពិនិត្យអ៊ីនធឺណិត ហើយព្យាយាមម្ដងទៀត។');
    } finally {
      setIsSubmittingWish(false);
    }
  };

  // If link is deactivated and not in admin preview
  if (guest && !guest.isActive && !isPreview) {
    return (
      <div className="min-h-screen khmer-pattern-bg flex items-center justify-center p-6 text-center bg-[#FAF7F0]">
        <div className="max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-stone-200">
          <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h2 className="font-moul text-lg text-stone-900 mb-2">
            តំណភ្ជាប់មិនមានសុពលភាព
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed mb-6 font-kantumruy">
            សូមអភ័យទោស តំណភ្ជាប់ធៀបការនេះត្រូវបានបិទ ឬផុតសុពលភាព។ សូមទាក់ទងមកកាន់ក្រុមគ្រួសារសាមីដើមការ ដើម្បីទទួលបានតំណភ្ជាប់ថ្មី។
          </p>
        </div>
      </div>
    );
  }

  const groomName = lang === 'km' ? config.groomNameKm : config.groomNameEn;
  const brideName = lang === 'km' ? config.brideNameKm : config.brideNameEn;

  const bgStyle = config.backgroundImage
    ? { backgroundImage: `url("${config.backgroundImage}")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
    : {};

  return (
    <div
      style={bgStyle}
      className="min-h-screen text-stone-800 pb-28 selection:bg-amber-200 selection:text-[#4A0E17] relative bg-[#FAF7F0] font-kantumruy"
    >
      <div
        aria-hidden="true"
        className={`invitation-ambient-overlay fixed inset-0 z-0 pointer-events-none ${
          config.backgroundImage ? 'bg-[#FAF7F0]/65 backdrop-blur-[1px]' : ''
        }`}
      />

      {/* Floating Language Control */}
      <div className="fixed top-[max(0.5rem,env(safe-area-inset-top))] right-2 sm:top-4 sm:right-4 z-40 flex items-center gap-1.5 sm:gap-2">
        {/* Language switch */}
        <button
          onClick={() => setLang(l => (l === 'km' ? 'en' : 'km'))}
          type="button"
          className="px-2.5 sm:px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white text-[11px] sm:text-xs font-semibold text-stone-800 shadow-md border border-amber-300/80 backdrop-blur-sm transition-all hover:scale-105 cursor-pointer font-kantumruy"
        >
          {lang === 'km' ? '🇬🇧 English' : '🇰🇭 ភាសាខ្មែរ'}
        </button>

      </div>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-3 sm:px-6 pt-16 pb-32 sm:pt-10 sm:pb-28 space-y-7 sm:space-y-14 relative z-10">
        
        {/* SECTION 1: Cover Header & Title */}
        <section className="wedding-card-glass rounded-2xl sm:rounded-3xl p-4 sm:p-10 text-center relative overflow-hidden bg-white/90 shadow-xl border border-amber-200/80">
          <p className="font-moul text-[#4A0E17] tracking-wide text-sm md:text-base mb-4">
            {lang === 'km' ? config.invitationTitleKm : config.invitationTitleEn}
          </p>

          <h1 className="font-moul text-xl min-[380px]:text-2xl sm:text-4xl text-[#4A0E17] mt-2 mb-2 leading-relaxed">
            {groomName}
            <span className="text-rose-700 font-serif text-xl sm:text-2xl mx-3">❤️</span>
            {brideName}
          </h1>

          <p className="text-xs sm:text-sm text-stone-500 font-serif italic mb-2">
            Roun Reatrey ❤️ Phorn Chakriya
          </p>

          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-stone-700 mt-2 font-medium">
            <Calendar className="w-4 h-4 text-[#C5A059]" />
            <span>
              {lang === 'km' ? config.solarDateKm : config.solarDateEn}
            </span>
          </div>

          <div className="text-xs text-amber-800/90 mt-1 font-medium">
            {config.lunarDateKm}
          </div>

          <KhmerDivider className="my-5" color="#C5A059" />

          {/* Cover Photo */}
          {config.coverImage && (
            <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[16/10] sm:aspect-[16/9] border-2 border-amber-200">
              <img
                src={config.coverImage}
                alt="Roun Reatrey & Phorn Chakriya"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          )}

          {/* SECTION 2: Personalized Guest Greeting Card With Guest Photo */}
          {currentGuest && (
            <div className="mt-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-amber-50/90 border border-amber-300/80 shadow-md flex flex-col items-center">
              <p className="text-xs uppercase tracking-widest text-[#4A0E17] font-semibold mb-3 font-kantumruy">
                {lang === 'km' ? 'សូមគោរពអញ្ជើញ' : 'CORDIALLY INVITED'}
              </p>

              {/* Guest Photo Avatar */}
              {currentGuest.photoUrl ? (
                <div className="relative mb-3.5 group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-[#C5A059] via-amber-200 to-[#C5A059] shadow-lg ring-4 ring-amber-100">
                    <img
                      src={currentGuest.photoUrl}
                      alt={currentGuest.nameKm}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#4A0E17] text-amber-200 flex items-center justify-center border-2 border-white shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4A0E17] to-[#7A1E2C] text-amber-200 flex items-center justify-center font-moul text-2xl shadow-md border-2 border-[#C5A059] mb-3">
                  {currentGuest.nameKm.charAt(0)}
                </div>
              )}

              <h2 className="font-moul text-xl sm:text-2xl text-stone-900 leading-snug">
                {currentGuest.honorificKm} {currentGuest.nameKm}
              </h2>
              {currentGuest.nameEn && (
                <p className="text-sm text-stone-600 italic mt-0.5 font-serif">
                  {currentGuest.honorificEn} {currentGuest.nameEn}
                </p>
              )}
            </div>
          )}
        </section>

        {/* SECTION 3 & 4: Parents & Families Information */}
        <section className="wedding-card-glass rounded-2xl sm:rounded-3xl p-4 sm:p-10 relative bg-white/90 shadow-xl border border-amber-200/80">
          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-widest text-[#4A0E17] font-semibold">
              {lang === 'km' ? 'មាតាបិតាទាំងសងខាង' : 'RESPECTED PARENTS'}
            </span>
            <h2 className="font-moul text-xl sm:text-2xl text-[#4A0E17] mt-1">
              {lang === 'km' ? 'សេចក្តីគោរពថ្លែងអំណរគុណ' : 'Family of Bride & Groom'}
            </h2>
            <KhmerDivider className="my-4" color="#C5A059" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Groom's Family */}
            <div className="text-center p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-sm">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-200/80 text-[#4A0E17] text-xs font-semibold mb-3">
                {lang === 'km' ? 'មាតាបិតាខាងប្រុស' : "Groom's Parents"}
              </span>
              <p className="text-sm font-semibold text-stone-800">
                {lang === 'km' ? `លោក សុិន រ៉ា` : `Mr. Sin Ra`}
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                (លោកឪពុកខាងប្រុស)
              </p>

              <div className="mt-4 pt-3 border-t border-amber-200/70">
                <p className="text-xs text-[#4A0E17] font-semibold uppercase">
                  {lang === 'km' ? 'កូនប្រុសនាម' : 'Groom'}
                </p>
                <p className="font-moul text-base text-stone-900 mt-0.5">
                  {config.groomTitleKm} {config.groomNameKm}
                </p>
                <p className="text-xs text-stone-500 italic font-serif">
                  {config.groomTitleEn} {config.groomNameEn}
                </p>
              </div>
            </div>

            {/* Bride's Family */}
            <div className="text-center p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-sm">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-200/80 text-[#4A0E17] text-xs font-semibold mb-3">
                {lang === 'km' ? 'មាតាបិតាខាងស្រី' : "Bride's Parents"}
              </span>
              <p className="text-sm font-semibold text-stone-800">
                {lang === 'km' ? `លោក អ៊ុំ ភ័ណ្ឌ` : `Mr. Oum Phorn`}
                <span className="text-xs text-amber-800 ml-1 font-normal">(លោកឪពុកខាងស្រី)</span>
              </p>
              <p className="text-sm font-semibold text-stone-800 mt-1">
                {lang === 'km' ? `លោកស្រី ឈាង លាងហេង` : `Mrs. Chheang Leangheng`}
                <span className="text-xs text-amber-800 ml-1 font-normal">(អ្នកម្តាយខាងស្រី)</span>
              </p>

              <div className="mt-4 pt-3 border-t border-amber-200/70">
                <p className="text-xs text-[#4A0E17] font-semibold uppercase">
                  {lang === 'km' ? 'កូនស្រីនាម' : 'Bride'}
                </p>
                <p className="font-moul text-base text-stone-900 mt-0.5">
                  {config.brideTitleKm} {config.brideNameKm}
                </p>
                <p className="text-xs text-stone-500 italic font-serif">
                  {config.brideTitleEn} {config.brideNameEn}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: Khmer Invitation Letter */}
        <section id="calendar-section" className="wedding-card-glass rounded-3xl p-6 sm:p-10 text-center relative bg-white/90 shadow-xl border border-amber-200/80">
          <h2 className="font-moul text-xl sm:text-2xl text-[#4A0E17]">
            {lang === 'km' ? 'លិខិតអញ្ជើញ' : 'Letter of Invitation'}
          </h2>
          <KhmerDivider className="my-4" color="#C5A059" />

          <p className="text-stone-700 leading-relaxed text-sm sm:text-base max-w-xl mx-auto font-normal">
            {lang === 'km' ? config.invitationMessageKm : config.invitationMessageEn}
          </p>

          {/* Countdown & Calendar */}
          {config.showCountdown && (
            <div className="mt-8 pt-6 border-t border-amber-200/70">
              <p className="text-xs uppercase tracking-widest text-[#4A0E17] font-semibold mb-3">
                {lang === 'km' ? 'រាប់ថយក្រោយដល់ថ្ងៃសិរីសួស្តី' : 'COUNTDOWN TO THE SPECIAL DAY'}
              </p>
              <CountdownTimer targetDate={config.weddingDate} targetTime={config.weddingTime} lang={lang} />
            </div>
          )}

          {config.showCalendar && (
            <div className="mt-6">
              <AddToCalendarButton config={config} lang={lang} />
            </div>
          )}
        </section>

        {/* SECTION 6: Agenda / Ceremonial Program */}
        {config.showAgenda && config.schedules && config.schedules.length > 0 && (
          <section className="wedding-card-glass rounded-3xl p-6 sm:p-10 relative bg-white/90 shadow-xl border border-amber-200/80">
            <div className="text-center mb-8">
              <span className="text-xs uppercase tracking-widest text-[#4A0E17] font-semibold">
                {lang === 'km' ? 'ពេលវេលា និងពិធី' : 'WEDDING ITINERARY'}
              </span>
              <h2 className="font-moul text-xl sm:text-2xl text-[#4A0E17] mt-1">
                {lang === 'km' ? 'កម្មវិធីសិរីសួស្តីមង្គលអាពាហ៍ពិពាហ៍' : 'Ceremony Schedule'}
              </h2>
              <KhmerDivider className="my-4" color="#C5A059" />
            </div>

            <div className="relative border-l-2 border-[#C5A059]/60 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-7">
              {config.schedules.map((item, idx) => (
                <div key={item.id || idx} className="relative group">
                  {/* Timeline Node */}
                  <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#4A0E17] to-[#7A1E2C] border-2 border-white shadow-md flex items-center justify-center text-amber-200 text-xs font-bold">
                    {idx + 1}
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 hover:bg-amber-50/80 border border-amber-200/80 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-[#4A0E17] border border-amber-300 shadow-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        {lang === 'km' ? item.timeKm : item.timeEn}
                      </span>
                    </div>
                    <h3 className="font-moul text-base text-stone-900">
                      {lang === 'km' ? item.titleKm : item.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                      {lang === 'km' ? item.descriptionKm : item.descriptionEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 7: Venue & Google Maps */}
        <section id="venue-section" className="wedding-card-glass rounded-3xl p-6 sm:p-10 relative bg-white/90 shadow-xl border border-amber-200/80">
          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-widest text-[#4A0E17] font-semibold">
              {lang === 'km' ? 'ទីតាំងប្រារព្ធពិធី' : 'CEREMONY VENUE'}
            </span>
            <h2 className="font-moul text-xl sm:text-2xl text-[#4A0E17] mt-1">
              {lang === 'km' ? config.venueNameKm : config.venueNameEn}
            </h2>
            <KhmerDivider className="my-4" color="#C5A059" />
          </div>

          <div className="text-center max-w-xl mx-auto mb-6">
            <div className="flex items-start justify-center gap-2 text-stone-700 text-sm">
              <MapPin className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{lang === 'km' ? config.venueAddressKm : config.venueAddressEn}</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <a
                href={config.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4A0E17] hover:bg-[#32060f] text-white font-medium text-sm shadow-md transition-all hover:shadow-lg active:scale-95 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>{lang === 'km' ? 'បើកមើលក្នុង Google Maps' : 'Open in Google Maps'}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <button
                onClick={handleCopyPersonalLink}
                type="button"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-medium text-sm shadow-sm transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-amber-700" />
                <span>{copiedShareLink ? (lang === 'km' ? 'បានចម្លង!' : 'Copied!') : (lang === 'km' ? 'ចម្លងតំណភ្ជាប់' : 'Copy Link')}</span>
              </button>
            </div>
          </div>

          {/* Embedded Google Map */}
          {config.embedMapsUrl && (
            <div className="rounded-2xl overflow-hidden shadow-md border-2 border-amber-200 aspect-[16/9] w-full">
              <iframe
                title="Google Maps Venue"
                src={config.embedMapsUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
              />
            </div>
          )}
        </section>

        {/* SECTION 8: Pre-wedding Photo Gallery */}
        {config.showGallery && config.gallery && config.gallery.length > 0 && (
          <section className="wedding-card-glass rounded-3xl p-6 sm:p-10 relative bg-white/90 shadow-xl border border-amber-200/80">
            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-widest text-[#4A0E17] font-semibold">
                {lang === 'km' ? 'អនុស្សាវរីយ៍' : 'LOVE STORY & MEMORIES'}
              </span>
              <h2 className="font-moul text-xl sm:text-2xl text-[#4A0E17] mt-1">
                {lang === 'km' ? 'កម្រងរូបថត Pre-Wedding' : 'Pre-Wedding Gallery'}
              </h2>
              <KhmerDivider className="my-4" color="#C5A059" />
            </div>

            <GalleryLightbox photos={config.gallery} lang={lang} />
          </section>
        )}

        {/* SECTION 9: SEND WISH FORM (Exactly Matching User Reference Photo) */}
        {(currentGuest || isPreview || !isSupabaseConfigured) && (
        <section id="wishes-form-section" className="wedding-card-glass rounded-3xl p-6 sm:p-8 relative bg-white shadow-xl border border-stone-200">
          <form onSubmit={handleSubmitWish} className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-stone-800">
                សារ *
              </label>
              {currentGuest && (
                <span className="text-xs text-stone-500">
                  ពី៖ {currentGuest.honorificKm} {currentGuest.nameKm}
                </span>
              )}
            </div>

            <div className="relative">
              <textarea
                rows={4}
                maxLength={1000}
                required
                value={wishText}
                onChange={(e) => setWishText(e.target.value)}
                placeholder="សរសេរសារជូនពររបស់អ្នក"
                className="w-full p-4 rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17] text-sm font-kantumruy leading-relaxed bg-[#FAF7F0]/30"
              />
              <div className="text-right text-[11px] text-stone-400 mt-1 font-mono">
                {wishText.length}/1000
              </div>
            </div>

            {wishSentSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>សូមអរគុណយ៉ាងជ្រាលជ្រៅ! សារជូនពររបស់អ្នកត្រូវបានកត់ត្រាទុកក្នុងសៀវភៅជូនពរ។</span>
              </div>
            )}

            {wishError && (
              <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                {wishError}
              </div>
            )}

            {/* Deep Burgundy Button exactly as shown in screenshot */}
            <button
              type="submit"
              disabled={isSubmittingWish || !wishText.trim()}
              className="w-full py-4 rounded-xl bg-[#4A0E17] hover:bg-[#32060f] disabled:opacity-50 text-white font-medium text-base shadow-lg transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-amber-200" />
              <span>{isSubmittingWish ? 'កំពុងផ្ញើ...' : 'ផ្ញើជូនពរ'}</span>
            </button>
          </form>
        </section>
        )}

        {/* SECTION 10: GIFT / KHQR CARD (Matching User Reference Photo) */}
        {config.giftEnabled && (
          <section id="gift-section" className="space-y-4">
            {/* Deep Burgundy Card exactly matching user reference photo */}
            <div className="relative rounded-3xl bg-[#4A0E17] text-white p-5 min-[380px]:p-7 sm:p-10 text-center overflow-hidden shadow-2xl border border-amber-900/50">
              <DamaskCornerOrnament position="top-left" className="absolute top-0 left-0 text-amber-200/25" size={90} />
              <DamaskCornerOrnament position="bottom-right" className="absolute bottom-0 right-0 text-amber-200/25" size={90} />
              
              <h2 className="font-moul text-xl min-[380px]:text-2xl sm:text-3xl text-amber-100 tracking-wider mb-3">
                {lang === 'km' ? 'ចំណងដៃ' : 'Wedding Gift'}
              </h2>
              <p className="text-sm sm:text-base font-kantumruy text-amber-100/95 max-w-md mx-auto leading-relaxed">
                {lang === 'km' ? 'វត្តមានរបស់លោកអ្នក គឺជាអំណោយដ៏ធំបំផុតហើយ។' : 'Your presence is our greatest present.'}
              </p>
            </div>

            {/* QR Card Container */}
            <div className="wedding-card-glass rounded-3xl p-4 min-[380px]:p-6 sm:p-8 text-center relative border border-amber-300/60 shadow-lg bg-white">
              <div className="relative inline-block w-full max-w-full mb-3">
                {/* Speech bubble prompt as shown in user photo */}
                <div className="inline-flex max-w-full items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-white text-stone-800 text-[11px] min-[380px]:text-xs font-medium shadow-md border border-stone-200 mb-3 animate-bounce">
                  <MessageCircle className="w-3.5 h-3.5 text-[#4A0E17]" />
                  <span className="min-w-0">{lang === 'km' ? 'ស្កេនដើម្បីចងដៃតាម KHQR' : 'Scan to gift via KHQR'}</span>
                </div>

                <div className="mx-auto w-fit max-w-full p-2 min-[380px]:p-3 bg-white rounded-2xl shadow-md border-2 border-stone-200">
                  {config.giftQrImage || qrCodeDataUrl ? (
                    <img
                      src={config.giftQrImage || qrCodeDataUrl}
                      alt="Wedding Gift QR Code"
                      className="w-44 h-44 min-[380px]:w-48 min-[380px]:h-48 mx-auto rounded-lg object-contain"
                    />
                  ) : (
                    <div className="w-44 h-44 min-[380px]:w-48 min-[380px]:h-48 bg-stone-100 flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-stone-400" />
                    </div>
                  )}
                </div>
                {(config.giftQrImage || qrCodeDataUrl) && (
                  <div className="mt-3 w-full">
                    <button
                      onClick={() => void handleDownloadGiftQr()}
                      type="button"
                      className="inline-flex w-full sm:w-auto max-w-full items-center justify-center gap-2 rounded-full border border-amber-300 bg-white px-3 min-[380px]:px-5 py-2.5 text-xs min-[380px]:text-sm font-semibold text-[#4A0E17] shadow-sm transition-all hover:bg-amber-50 hover:shadow-md active:scale-95 cursor-pointer font-kantumruy"
                    >
                      <Download className="w-4 h-4" />
                      <span>{lang === 'km' ? 'ទាញយក QR Code' : 'Download QR Code'}</span>
                    </button>
                    {qrDownloadError && (
                      <p role="alert" className="mt-2 text-xs text-rose-700 font-kantumruy">
                        {qrDownloadError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-1">
                <p className="text-xs uppercase tracking-wider text-amber-800 font-bold">
                  {config.giftBankName}
                </p>
                <p className="text-sm font-semibold text-stone-800">
                  {config.giftAccountName}
                </p>
                <p className="text-base font-mono font-bold text-[#4A0E17] bg-amber-50 inline-block px-4 py-1 rounded-full border border-amber-200">
                  {config.giftAccountNumber}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 11: DIGITAL GUESTBOOK / BLESSINGS WALL (Where to view guest wishes) */}
        {config.showWishesWall && wishesList.length > 0 && (
          <section id="wishes-wall-section" className="wedding-card-glass rounded-2xl sm:rounded-3xl p-4 sm:p-10 relative bg-white/95 shadow-xl border border-amber-200/80">
            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-widest text-[#4A0E17] font-semibold">
                {lang === 'km' ? 'សៀវភៅជូនពរឌីជីថល' : 'GUESTBOOK'}
              </span>
              <h2 className="font-moul text-xl sm:text-2xl text-[#4A0E17] mt-1">
                {lang === 'km' ? 'ពាក្យជូនពរពីញាតិមិត្ត និងភ្ញៀវកិត្តិយស' : 'Wishes from Loved Ones'}
              </h2>
              <KhmerDivider className="my-4" color="#C5A059" />
              <p className="text-xs sm:text-sm text-stone-500 font-kantumruy">
                សរុប {wishesList.length} សារជូនពរ
              </p>
            </div>

            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {wishesList.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#e8dfcf] hover:border-amber-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        {w.photoUrl ? (
                          <img
                            src={w.photoUrl}
                            alt={w.guestName}
                            className="w-10 h-10 rounded-full object-cover border border-[#C5A059] shadow-xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#4A0E17] text-amber-200 text-xs font-bold flex items-center justify-center">
                            {w.guestName.charAt(0)}
                          </div>
                        )}
                        <span className="font-bold text-xs sm:text-sm text-stone-900 font-kantumruy">
                          {w.guestName}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400 font-mono">
                        {new Date(w.date).toLocaleDateString('km-KH')}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-12 italic font-kantumruy">
                      "{w.message}"
                    </p>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Footer Acknowledgement */}
        <footer className="text-center pt-6 pb-8 text-xs text-stone-500 space-y-2">
          <p className="font-moul text-[#4A0E17] text-sm">
            {config.groomNameKm} & {config.brideNameKm}
          </p>
          <p>
            {lang === 'km'
              ? `សូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅចំពោះវត្តមាន និងពរជ័យដ៏ឧត្តុង្គឧត្តម!

ពួកយើងខ្ញុំទាំងពីរនាក់ សូមសម្តែងនូវសេចក្តីសោមនស្សរីករាយ និងអរគុណយ៉ាងជ្រាលជ្រៅបំផុតចំពោះ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា ព្រមទាំងប្រិយមិត្តសាច់ញាតិមិត្តភក្តិទាំងអស់ ដែលបានចំណាយពេលវេលាដ៏មានតម្លៃ និងអញ្ជើញចូលរួមផ្តល់កិត្តិយស ព្រមទាំងប្រសិទ្ធពរជ័យក្នុងពិធីមង្គលការរបស់យើងខ្ញុំ។

ប្រសិនបើមានការខុសឆ្គង ឬចន្លោះប្រហោងដោយប្រការណាមួយក្នុងកិច្ចទទួលរាក់ទាក់ ពួកយើងខ្ញុំសូមខន្តីអភ័យទោសពីចម្ងាយផងដែរ។

សូមជូនពរលោកអ្នក និងគ្រួសារ ជួបតែសេចក្តីសុខ សុភមង្គល និងជោគជ័យគ្រប់ភារកិច្ច! ❤️🥂`
              : 'Warmest gratitude for your esteemed presence and heartfelt blessings'}
          </p>
        </footer>
      </main>

      {/* Floating Bottom Navigation Dock (Exactly matching screenshot) */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.5rem)] inset-x-0 z-40 flex flex-col items-center justify-center pointer-events-none px-3 sm:px-4">
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#FAF7F0]/95 backdrop-blur-md shadow-2xl border border-stone-300/80">
          {/* Calendar Button */}
          <button
            onClick={() => {
              const el = document.getElementById('calendar-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            type="button"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#4A0E17] text-white flex items-center justify-center shadow hover:scale-105 transition-transform cursor-pointer"
            title="Calendar & Countdown"
          >
            <Calendar className="w-4 h-4 text-amber-200" />
          </button>

          {/* Location Button */}
          <button
            onClick={() => {
              const el = document.getElementById('venue-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            type="button"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-stone-100 text-stone-700 flex items-center justify-center shadow border border-stone-200 hover:scale-105 transition-transform cursor-pointer"
            title="Location"
          >
            <MapPin className="w-4 h-4 text-stone-700" />
          </button>

          {/* Wishes / Write button */}
          <button
            onClick={() => {
              const el = document.getElementById('wishes-form-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            type="button"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-stone-100 text-stone-700 flex items-center justify-center shadow border border-stone-200 hover:scale-105 transition-transform cursor-pointer"
            title="ផ្ញើសារជូនពរ"
          >
            <PenTool className="w-4 h-4 text-stone-700" />
          </button>

          {/* Gift QR shortcut */}
          <button
            onClick={() => {
              const el = document.getElementById('gift-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            type="button"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-stone-100 text-stone-700 flex items-center justify-center shadow border border-stone-200 hover:scale-105 transition-transform cursor-pointer"
            title="ចំណងដៃ KHQR"
          >
            <Gift className="w-4 h-4 text-stone-700" />
          </button>

        </div>
      </div>
    </div>
  );
};
