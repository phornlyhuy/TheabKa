import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { GalleryPhoto, Language } from '../../types/wedding';

interface GalleryLightboxProps {
  photos: GalleryPhoto[];
  lang: Language;
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({ photos, lang }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (!photos || photos.length === 0) return null;

  const openPhoto = (idx: number) => setActiveIdx(idx);
  const closePhoto = () => setActiveIdx(null);

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx !== null) {
      setActiveIdx((activeIdx - 1 + photos.length) % photos.length);
    }
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx !== null) {
      setActiveIdx((activeIdx + 1) % photos.length);
    }
  };

  return (
    <div className="w-full">
      {/* Grid of Photos */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {photos.map((photo, idx) => (
          <div
            key={photo.id || idx}
            onClick={() => openPhoto(idx)}
            className={`prewedding-gallery-card group relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 ${
              idx % 2 === 0 ? 'prewedding-gallery-card-left' : 'prewedding-gallery-card-right'
            }`}
          >
            <img
              src={photo.url}
              alt={photo.captionKm || `Wedding Photo ${idx + 1}`}
              className={`prewedding-gallery-photo w-full h-full object-cover ${
                idx % 2 === 0 ? 'prewedding-gallery-photo-left' : 'prewedding-gallery-photo-right'
              }`}
              loading="lazy"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-4 text-white">
              <span className="text-xs md:text-sm font-medium line-clamp-2">
                {lang === 'km' ? photo.captionKm : photo.captionEn}
              </span>
              <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white backdrop-blur-sm">
                <ZoomIn className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full-screen Lightbox Modal */}
      {activeIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn"
          onClick={closePhoto}
        >
          {/* Close button */}
          <button
            onClick={closePhoto}
            type="button"
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev Button */}
          {photos.length > 1 && (
            <button
              onClick={prevPhoto}
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Current Photo */}
          <div
            className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[activeIdx].url}
              alt="Enlarged wedding photo"
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
            />
            <div className="mt-3 text-center text-white/90">
              <p className="text-sm md:text-base font-medium">
                {lang === 'km' ? photos[activeIdx].captionKm : photos[activeIdx].captionEn}
              </p>
              <p className="text-xs text-white/60 mt-1">
                {activeIdx + 1} / {photos.length}
              </p>
            </div>
          </div>

          {/* Next Button */}
          {photos.length > 1 && (
            <button
              onClick={nextPhoto}
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
