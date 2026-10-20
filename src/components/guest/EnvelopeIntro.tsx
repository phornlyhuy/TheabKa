import React, { useEffect, useState } from 'react';
import { MailOpen, Sparkles, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Guest, WeddingConfig, Language } from '../../types/wedding';
import { KhmerCorner, KhmerDivider } from '../common/KhmerOrnament';

interface EnvelopeIntroProps {
  guest: Guest | null;
  config: WeddingConfig;
  lang: Language;
  onOpen: () => void;
}

export const EnvelopeIntro: React.FC<EnvelopeIntroProps> = ({
  guest,
  config,
  lang,
  onOpen,
}) => {
  const handleOpenEnvelope = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#c59b27', '#f6e27a', '#4A0E17', '#ffffff'],
      });
    } catch (_) {}

    onOpen();
  };

  const groomName = lang === 'km' ? config.groomNameKm : config.groomNameEn;
  const brideName = lang === 'km' ? config.brideNameKm : config.brideNameEn;
  const guestName = guest
    ? `${guest.honorificKm} ${guest.nameKm}`
    : (lang === 'km' ? 'ភ្ញៀវកិត្តិយស' : 'Honorable Guest');
  const preweddingPhotos = config.gallery.filter(photo => photo.url);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [previousPhotoIndex, setPreviousPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    if (preweddingPhotos.length < 2) return;

    const interval = window.setInterval(() => {
      setPreviousPhotoIndex(activePhotoIndex);
      setActivePhotoIndex((activePhotoIndex + 1) % preweddingPhotos.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activePhotoIndex, preweddingPhotos.length]);

  useEffect(() => {
    if (previousPhotoIndex === null) return;

    const timeout = window.setTimeout(() => setPreviousPhotoIndex(null), 900);
    return () => window.clearTimeout(timeout);
  }, [activePhotoIndex, previousPhotoIndex]);

  const showPreweddingPhoto = (index: number) => {
    if (index === activePhotoIndex) return;
    setPreviousPhotoIndex(activePhotoIndex);
    setActivePhotoIndex(index);
  };

  const bgStyle = config.backgroundImage
    ? { backgroundImage: `url("${config.backgroundImage}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <div
      style={bgStyle}
      className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden bg-[#FAF7F0] font-kantumruy"
    >
      {/* Soft overlay if background image is present */}
      {config.backgroundImage && (
        <div className="absolute inset-0 bg-[#FAF7F0]/40 backdrop-blur-[2px] pointer-events-none" />
      )}

      {/* Decorative subtle background accents */}
      <div className="absolute top-10 left-10 w-36 h-36 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#4A0E17]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Envelope Card */}
      <div className="envelope-card-enter w-full max-w-lg bg-gradient-to-b from-[#fffefc] to-[#fbf8f0] rounded-3xl shadow-[0_25px_60px_-15px_rgba(74,14,23,0.18)] border-2 border-[#C5A059]/80 p-4 sm:p-10 relative text-center z-10">
        {/* Khmer Corners */}
        <KhmerCorner position="top-left" className="absolute top-2 left-2 text-[#C5A059]" size={36} />
        <KhmerCorner position="top-right" className="absolute top-2 right-2 text-[#C5A059]" size={36} />
        <KhmerCorner position="bottom-left" className="absolute bottom-2 left-2 text-[#C5A059]" size={36} />
        <KhmerCorner position="bottom-right" className="absolute bottom-2 right-2 text-[#C5A059]" size={36} />

        {/* Monogram T & Y Header */}
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#FAF7F0] via-white to-amber-100 border border-[#C5A059] shadow-inner mb-2">
          <span className="font-serif font-bold text-sm tracking-widest text-[#4A0E17]">
            T & Y
          </span>
        </div>

        {/* Envelope Flap Header Decoration */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059] animate-pulse" />
          <span className="font-moul text-xs text-[#4A0E17] tracking-wider">
            {lang === 'km' ? 'សិរីសួស្តី អាពាហ៍ពិពាហ៍' : 'OFFICIAL WEDDING INVITATION'}
          </span>
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059] animate-pulse" />
        </div>

        {/* Couple Names */}
        <h1 className="font-moul text-xl min-[380px]:text-2xl sm:text-3xl text-[#4A0E17] drop-shadow-sm mt-2 mb-1 leading-relaxed">
          {groomName}
          <span className="text-rose-700 font-serif text-xl mx-2">❤️</span>
          {brideName}
        </h1>

        <p className="text-xs sm:text-sm text-stone-600 font-medium font-kantumruy">
          {lang === 'km' ? config.solarDateKm : config.solarDateEn}
        </p>

        {preweddingPhotos.length > 0 && (
          <div className="prewedding-strip mt-4 sm:mt-5 overflow-hidden rounded-2xl border border-amber-200 bg-white/80 p-1.5 sm:p-2 shadow-sm">
            <div className="relative aspect-[4/3] min-[480px]:aspect-[16/7] overflow-hidden rounded-xl bg-amber-50">
              {previousPhotoIndex !== null && (
                <img
                  key={`previous-${preweddingPhotos[previousPhotoIndex]?.id}`}
                  src={preweddingPhotos[previousPhotoIndex]?.url}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover prewedding-photo-outgoing"
                />
              )}
              <img
                key={preweddingPhotos[activePhotoIndex]?.id}
                src={preweddingPhotos[activePhotoIndex]?.url}
                alt={preweddingPhotos[activePhotoIndex]?.captionKm || 'Pre-wedding photo'}
                className="absolute inset-0 h-full w-full object-cover prewedding-photo-active"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pb-2 pt-6 text-left">
                <p className="text-[11px] font-medium text-white drop-shadow">
                  {preweddingPhotos[activePhotoIndex]?.captionKm || 'រូបថត Pre-wedding'}
                </p>
              </div>
            </div>
            {preweddingPhotos.length > 1 && (
              <div className="mt-2 flex justify-center gap-1.5" aria-label="Pre-wedding photo slideshow">
                {preweddingPhotos.map((photo, index) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => showPreweddingPhoto(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === activePhotoIndex ? 'w-5 bg-[#4A0E17]' : 'w-1.5 bg-amber-300 hover:bg-amber-500'
                    }`}
                    aria-label={`Show pre-wedding photo ${index + 1}`}
                    aria-current={index === activePhotoIndex}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <KhmerDivider className="my-5" color="#C5A059" />

        {/* Guest Recipient Box with Guest Photo */}
        <div className="my-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 border border-amber-300/70 shadow-inner flex flex-col items-center">
          <p className="text-xs uppercase tracking-widest text-amber-800 font-semibold mb-3 font-kantumruy">
            {lang === 'km' ? 'សូមគោរពអញ្ជើញ' : 'CORDIALLY INVITED'}
          </p>

          {/* Guest Photo if available */}
          {guest?.photoUrl ? (
            <div className="relative mb-3">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-[#C5A059] via-amber-200 to-[#C5A059] shadow-md">
                <img
                  src={guest.photoUrl}
                  alt={guest.nameKm}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#4A0E17] text-amber-200 flex items-center justify-center border-2 border-white shadow">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-amber-100 text-[#4A0E17] border border-amber-300 flex items-center justify-center mb-2 shadow-inner">
              <User className="w-8 h-8 opacity-70" />
            </div>
          )}

          <h2 className="font-moul text-lg sm:text-2xl text-stone-900 leading-snug">
            {guestName}
          </h2>
          {guest?.nameEn && (
            <p className="text-xs text-stone-500 font-serif italic mt-0.5">
              {guest.honorificEn} {guest.nameEn}
            </p>
          )}
        </div>

        {/* Royal Wax Seal & Action Button */}
        <div className="flex flex-col items-center justify-center mt-6">
          <button
            onClick={handleOpenEnvelope}
            type="button"
            className="mt-6 inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#4A0E17] hover:bg-[#32060f] text-white font-medium text-sm sm:text-base shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 font-kantumruy"
          >
            <MailOpen className="w-5 h-5 text-amber-200" />
            <span>{lang === 'km' ? 'បើកមើលលិខិតអញ្ជើញ' : 'Open Invitation'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
