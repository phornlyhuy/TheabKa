import React, { useState } from 'react';
import {
  Heart,
  MessageSquare,
  Search,
  Copy,
  Check,
  Download,
  Calendar,
  Sparkles,
  UserCheck,
  Share2
} from 'lucide-react';
import { storage } from '../../services/storage';

interface GuestWishesManagerProps {
  onRefresh?: () => void;
}

export const GuestWishesManager: React.FC<GuestWishesManagerProps> = ({ onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const wishes = storage.getAllWishes();

  const filteredWishes = wishes.filter(w =>
    w.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyWish = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportWishes = () => {
    if (wishes.length === 0) {
      alert('មិនទាន់មានពាក្យជូនពរនៅឡើយទេ');
      return;
    }

    let textContent = `=========================================\n`;
    textContent += `កម្រងសារជូនពរអាពាហ៍ពិពាហ៍ (Wedding Guest Wishes)\n`;
    textContent += `រួន រាត្រី ❤️ ភ័ណ្ឌ ចរិយា (22.11.2026)\n`;
    textContent += `ចំនួនសារសរុប: ${wishes.length} សារ\n`;
    textContent += `=========================================\n\n`;

    wishes.forEach((w, index) => {
      textContent += `[${index + 1}] ពី៖ ${w.guestName}\n`;
      textContent += `កាលបរិច្ឆេទ៖ ${new Date(w.date).toLocaleString('km-KH')}\n`;
      textContent += `សារជូនពរ៖\n"${w.message}"\n`;
      textContent += `-----------------------------------------\n\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Wedding_Guest_Wishes_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#4A0E17] via-[#5B121C] to-[#4A0E17] text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-amber-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>សៀវភៅកត់ត្រាពរជ័យឌីជីថល (Digital Guestbook)</span>
            </div>
            <h2 className="font-moul text-xl sm:text-2xl text-amber-100 flex items-center gap-2">
              <span>💌 សារជូនពរពីភ្ញៀវកិត្តិយស</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-xl font-kantumruy">
              ទីកន្លែងសម្រាប់មើលរាល់ពាក្យជូនពរ និងសារអបអរសាទរទាំងអស់ ដែលភ្ញៀវបានផ្ញើជូនកូនកម្លោះ រួន រាត្រី និងកូនក្រមុំ ភ័ណ្ឌ ចរិយា។
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <div className="text-2xl sm:text-3xl font-bold font-moul text-amber-300">
                {wishes.length}
              </div>
              <div className="text-[11px] text-amber-100 font-kantumruy">សារជូនពរសរុប</div>
            </div>

            <button
              onClick={handleExportWishes}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#C5A059] hover:bg-[#b08e48] text-stone-900 font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>ទាញយកសារទាំងអស់ (.txt)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-sm">
        <Search className="w-4 h-4 text-stone-400 ml-2 mr-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ស្វែងរកតាមឈ្មោះភ្ញៀវ ឬពាក្យក្នុងសារជូនពរ..."
          className="w-full text-xs sm:text-sm focus:outline-none font-kantumruy"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            type="button"
            className="text-xs text-stone-400 hover:text-stone-600 px-2 cursor-pointer"
          >
            សម្អាត
          </button>
        )}
      </div>

      {/* Wishes Grid */}
      {filteredWishes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
          <MessageSquare className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-moul text-base text-stone-700">មិនទាន់មានពាក្យជូនពរត្រូវនឹងការស្វែងរកទេ</h3>
          <p className="text-xs text-stone-500 font-kantumruy mt-1">
            ភ្ញៀវអាចសរសេរពាក្យជូនពរតាមរយៈតំណភ្ជាប់ធៀបការ ឬប្រអប់សារលើទំព័រមុខ
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWishes.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4A0E17] to-[#7A1E2C] text-amber-200 flex items-center justify-center font-moul text-sm shadow-sm flex-shrink-0">
                      {item.guestName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm font-kantumruy">
                        {item.guestName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.date).toLocaleDateString('km-KH')}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyWish(item.id, `"${item.message}" - ${item.guestName}`)}
                    type="button"
                    className="p-2 rounded-xl bg-stone-50 hover:bg-amber-50 text-stone-500 hover:text-amber-800 border border-stone-200 transition-colors cursor-pointer"
                    title="ចម្លងសារនេះ"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Blessing message text */}
                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#e8dfcf] text-stone-800 text-xs sm:text-sm leading-relaxed font-kantumruy italic relative">
                  <span className="text-[#4A0E17] font-serif text-lg leading-none absolute top-2 left-2 opacity-30">“</span>
                  <p className="px-2">{item.message}</p>
                  <span className="text-[#4A0E17] font-serif text-lg leading-none absolute bottom-1 right-2 opacity-30">”</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                <span className="inline-flex items-center gap-1 text-rose-700">
                  <Heart className="w-3 h-3 fill-current" />
                  <span>ពរជ័យសិរីមង្គល</span>
                </span>
                <span className="font-mono text-[10px] text-stone-300">
                  ID: {item.id.slice(-6)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
