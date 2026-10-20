import React, { useState, useEffect } from 'react';
import { Language } from '../../types/wedding';

interface CountdownTimerProps {
  targetDate: string; // YYYY-MM-DD
  targetTime?: string; // HH:mm
  lang: Language;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, targetTime = '17:00', lang }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(`${targetDate}T${targetTime}:00`);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNumber = (num: number) => {
    return String(num).padStart(2, '0').split('').map(d => khmerDigits[parseInt(d, 10)] || d).join('');
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  if (timeLeft.isPast) {
    return (
      <div className="text-center py-4 px-6 bg-amber-500/10 rounded-2xl border border-amber-400/40 max-w-md mx-auto">
        <p className="font-moul text-amber-900 text-base md:text-lg">
          {lang === 'km' ? '🎉 ពិធីមង្គលការបានប្រារព្ធឡើងដោយជោគជ័យ 🎉' : '🎉 The Wedding Celebration Has Commenced! 🎉'}
        </p>
        <p className="text-sm text-stone-600 mt-1">
          {lang === 'km' ? 'សូមអរគុណយ៉ាងជ្រាលជ្រៅចំពោះវត្តមាន និងពរជ័យរបស់អ្នកទាំងអស់គ្នា!' : 'Thank you for your blessings and warm presence!'}
        </p>
      </div>
    );
  }

  const items = [
    {
      numKm: toKhmerNumber(timeLeft.days),
      numEn: pad(timeLeft.days),
      labelKm: 'ថ្ងៃ',
      labelEn: 'Days',
    },
    {
      numKm: toKhmerNumber(timeLeft.hours),
      numEn: pad(timeLeft.hours),
      labelKm: 'ម៉ោង',
      labelEn: 'Hours',
    },
    {
      numKm: toKhmerNumber(timeLeft.minutes),
      numEn: pad(timeLeft.minutes),
      labelKm: 'នាទី',
      labelEn: 'Minutes',
    },
    {
      numKm: toKhmerNumber(timeLeft.seconds),
      numEn: pad(timeLeft.seconds),
      labelKm: 'វិនាទី',
      labelEn: 'Seconds',
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto text-center">
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/90 shadow-md border border-amber-300/40 relative overflow-hidden group hover:border-amber-400 transition-colors"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 to-transparent pointer-events-none" />
            <span className="font-serif-title text-2xl sm:text-4xl font-bold text-amber-900 group-hover:scale-105 transition-transform duration-200">
              {lang === 'km' ? item.numKm : item.numEn}
            </span>
            <span className="text-xs sm:text-sm font-medium text-amber-700/80 mt-1">
              {lang === 'km' ? item.labelKm : item.labelEn}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
