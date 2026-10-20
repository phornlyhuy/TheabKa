import React, { useState } from 'react';
import {
  Search,
  Plus,
  Download,
  Upload,
  Copy,
  Check,
  QrCode,
  Edit2,
  Trash2,
  RefreshCw,
  Power,
  Users,
  SendHorizontal,
  ExternalLink,
  ImageIcon,
  Camera,
  X
} from 'lucide-react';
import { Guest } from '../../types/wedding';
import { storage } from '../../services/storage';
import { compressImageForStorage } from '../../services/imageUpload';
import { GuestQrModal } from './GuestQrModal';
import { CsvImportModal } from './CsvImportModal';
import { getInvitationUrl } from '../../services/invitationLinks';

interface GuestListTableProps {
  guests: Guest[];
  onGuestsUpdated: () => void;
  coupleNames: string;
}

export const GuestListTable: React.FC<GuestListTableProps> = ({ guests, onGuestsUpdated, coupleNames }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [selectedQrGuest, setSelectedQrGuest] = useState<Guest | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Quick feedback toasts
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = (guest: Guest) => {
    const url = getInvitationUrl(guest.token);
    if (!url) {
      showToast('សូមដាក់វេបសាយលើ URL សាធារណៈ HTTPS ជាមុនសិន ទើបអាចចម្លង Link សម្រាប់ភ្ញៀវបាន។');
      return;
    }
    navigator.clipboard.writeText(url);
    setCopiedTokenId(guest.id);
    showToast(`បានចម្លងតំណភ្ជាប់សម្រាប់ ${guest.nameKm}!`);
    setTimeout(() => setCopiedTokenId(null), 2500);
  };

  const handleShareTelegram = (guest: Guest) => {
    const url = getInvitationUrl(guest.token);
    if (!url) {
      showToast('សូមដាក់វេបសាយលើ URL សាធារណៈ HTTPS ជាមុនសិន ទើបអាចផ្ញើ Link ទៅភ្ញៀវបាន។');
      return;
    }
    const text = `សូមគោរពអញ្ជើញ ភ្ញៀវកិត្តិយស ${guest.nameKm} ចូលរួមពិធីមង្គលការ ${coupleNames} (ថ្ងៃអាទិត្យ ទី ២២ ខែ វិច្ឆិកា ឆ្នាំ ២០២៦)។ សូមចុចតំណភ្ជាប់ខាងក្រោមដើម្បីបើកមើលធៀបការឌីជីថលផ្ទាល់ខ្លួន៖\n${url}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
  };

  const handleToggleActive = (guest: Guest) => {
    const newStatus = storage.toggleGuestActive(guest.id);
    onGuestsUpdated();
    showToast(newStatus ? `បានបើកដំណើរការ Link សម្រាប់ ${guest.nameKm}` : `បានបិទដំណើរការ Link សម្រាប់ ${guest.nameKm}`);
  };

  const handleRegenerateToken = (guest: Guest) => {
    if (window.confirm(`តើអ្នកពិតជាចង់បង្កើត Link ថ្មីសម្រាប់ ${guest.nameKm}? តំណភ្ជាប់ចាស់នឹងត្រូវផុតសុពលភាព។`)) {
      storage.regenerateToken(guest.id);
      onGuestsUpdated();
      showToast(`បានបង្កើត Token ថ្មីជោគជ័យ!`);
    }
  };

  const handleDelete = (guest: Guest) => {
    if (window.confirm(`តើអ្នកប្រាកដជាចង់លុប ${guest.nameKm} ចេញពីបញ្ជីភ្ញៀវ?`)) {
      storage.deleteGuest(guest.id);
      onGuestsUpdated();
      showToast(`បានលុប ${guest.nameKm} រួចរាល់!`);
    }
  };

  const handleExportCsv = () => {
    const csvData = storage.exportToCsv(guests);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Wedding_Guests_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('បានទាញយកបញ្ជីភ្ញៀវជា CSV រួចរាល់!');
  };

  // Filtered Guests
  const filteredGuests = guests.filter((g) => {
    return (
      g.nameKm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.nameEn && g.nameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      g.token.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#4A0E17] text-amber-200 px-4 py-2.5 rounded-2xl shadow-2xl border border-amber-400 text-xs font-medium flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Controls: Search & Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះភ្ញៀវ ឬ Token..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17] font-kantumruy"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium shadow-sm transition-colors cursor-pointer font-kantumruy"
            title="Import CSV"
          >
            <Upload className="w-4 h-4 text-amber-700" />
            <span>បញ្ចូលពី CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium shadow-sm transition-colors cursor-pointer font-kantumruy"
            title="Export CSV"
          >
            <Download className="w-4 h-4 text-amber-700" />
            <span>ទាញយក CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#4A0E17] hover:bg-[#32060f] text-white text-xs font-medium shadow-md transition-all cursor-pointer whitespace-nowrap font-kantumruy"
          >
            <Plus className="w-4 h-4 text-amber-200" />
            <span>បន្ថែមភ្ញៀវថ្មី (Add Guest)</span>
          </button>
        </div>
      </div>

      {/* Guest Table Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm font-kantumruy">
            <thead className="bg-[#FAF7F0] text-stone-700 font-semibold border-b border-stone-200">
              <tr>
                <th className="p-4">រូបថត & ឈ្មោះភ្ញៀវ (Honored Guest)</th>
                <th className="p-4">តំណភ្ជាប់ផ្ទាល់ខ្លួន & QR Code</th>
                <th className="p-4 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-stone-400 font-kantumruy">
                    មិនមានទិន្នន័យភ្ញៀវត្រូវនឹងការស្វែងរកទេ
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => {
                  const personalUrl = getInvitationUrl(guest.token);

                  return (
                    <tr key={guest.id} className={`hover:bg-amber-50/30 transition-colors ${!guest.isActive ? 'opacity-60 bg-stone-50' : ''}`}>
                      {/* Photo & Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {/* Guest Portrait Thumbnail */}
                          {guest.photoUrl ? (
                            <img
                              src={guest.photoUrl}
                              alt={guest.nameKm}
                              className="w-12 h-12 rounded-full object-cover border-2 border-[#C5A059] shadow-sm flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4A0E17] to-[#7A1E2C] text-amber-200 flex items-center justify-center text-sm font-bold border border-amber-300 flex-shrink-0">
                              {guest.nameKm.charAt(0)}
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-[#4A0E17] border border-amber-300">
                                ភ្ញៀវកិត្តិយស
                              </span>
                            </div>
                            <div className="font-bold text-stone-900 text-sm mt-1">
                              {guest.nameKm}
                            </div>
                            {guest.nameEn && (
                              <div className="text-[11px] text-stone-500 italic font-serif">
                                {guest.nameEn}
                              </div>
                            )}
                            {guest.note && (
                              <div className="text-[11px] text-stone-400 italic mt-0.5">
                                {guest.note}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Personal Token & Sharing */}
                      <td className="p-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 font-mono text-xs text-stone-600">
                            <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200">
                              {guest.token}
                            </span>
                            {!guest.isActive && (
                              <span className="text-[10px] text-rose-600 font-sans font-bold">
                                (បានបិទ)
                              </span>
                            )}
                          </div>

                          {/* Quick Share Buttons */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopyLink(guest)}
                              type="button"
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#4A0E17] text-xs font-medium flex items-center gap-1 border border-amber-200 transition-colors cursor-pointer"
                              title="Copy Link"
                            >
                              {copiedTokenId === guest.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedTokenId === guest.id ? 'បានចម្លង' : 'Copy Link'}</span>
                            </button>

                            <button
                              onClick={() => handleShareTelegram(guest)}
                              type="button"
                              className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors cursor-pointer"
                              title="ផ្ញើតាម Telegram"
                            >
                              <SendHorizontal className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setSelectedQrGuest(guest)}
                              type="button"
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                              title="QR Code ផ្ទាល់ខ្លួន"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>

                            {personalUrl ? (
                              <a
                                href={personalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                                title="មើលទំព័រភ្ញៀវផ្ទាល់"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span
                                className="p-1.5 rounded-lg bg-stone-100 text-stone-400"
                                title="ត្រូវផ្សព្វផ្សាយវេបសាយលើ URL សាធារណៈ HTTPS ជាមុនសិន"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Admin Management Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle Active */}
                          <button
                            onClick={() => handleToggleActive(guest)}
                            type="button"
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              guest.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                            }`}
                            title={guest.isActive ? 'បិទដំណើរការ Link' : 'បើកដំណើរការ Link'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Regenerate Token */}
                          <button
                            onClick={() => handleRegenerateToken(guest)}
                            type="button"
                            className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200 transition-colors cursor-pointer"
                            title="Regenerate Token"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => setEditingGuest(guest)}
                            type="button"
                            className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200 transition-colors cursor-pointer"
                            title="Edit Guest & Photo"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(guest)}
                            type="button"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                            title="Delete Guest"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Guest Modal */}
      {(isAddModalOpen || editingGuest) && (
        <GuestFormModal
          isOpen={isAddModalOpen || !!editingGuest}
          guest={editingGuest}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingGuest(null);
          }}
          onSave={() => {
            setIsAddModalOpen(false);
            setEditingGuest(null);
            onGuestsUpdated();
            showToast('បានរក្សាទុកព័ត៌មានភ្ញៀវជោគជ័យ!');
          }}
        />
      )}

      {/* Individual QR Modal */}
      {selectedQrGuest && (
        <GuestQrModal
          guest={selectedQrGuest}
          isOpen={!!selectedQrGuest}
          onClose={() => setSelectedQrGuest(null)}
        />
      )}

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportSuccess={(count) => {
          onGuestsUpdated();
          showToast(`បានបញ្ចូលភ្ញៀវថ្មីចំនួន ${count} នាក់ដោយជោគជ័យ!`);
        }}
      />
    </div>
  );
};

interface GuestFormModalProps {
  isOpen: boolean;
  guest: Guest | null;
  onClose: () => void;
  onSave: () => void;
}

const GuestFormModal: React.FC<GuestFormModalProps> = ({ isOpen, guest, onClose, onSave }) => {
  const [nameKm, setNameKm] = useState(guest?.nameKm || '');
  const [nameEn, setNameEn] = useState(guest?.nameEn || '');
  const [photoUrl, setPhotoUrl] = useState(guest?.photoUrl || '');
  const [note, setNote] = useState(guest?.note || '');
  const [photoUploadMessage, setPhotoUploadMessage] = useState('');
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setIsPhotoUploading(true);
    setPhotoUploadMessage('');
    try {
      setPhotoUrl(await compressImageForStorage(file));
      setPhotoUploadMessage('រូបថតបានផ្ទុករួច។ ចុចរក្សាទុក ដើម្បីបញ្ចប់។');
    } catch (error) {
      setPhotoUploadMessage(error instanceof Error ? error.message : 'មិនអាចផ្ទុករូបថតបានទេ។');
    } finally {
      setIsPhotoUploading(false);
      input.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameKm.trim()) return;

    try {
      if (guest) {
        const updated = storage.updateGuest(guest.id, {
          nameKm: nameKm.trim(),
          nameEn: nameEn.trim(),
          photoUrl: photoUrl.trim(),
          note: note.trim(),
        });
        if (!updated) {
          setPhotoUploadMessage('រក្សាទុកមិនបានទេ។ Browser Storage ពេញ សូមលុបរូបភាពខ្លះ ហើយសាកល្បងម្តងទៀត។');
          return;
        }
      } else {
        storage.addGuest({
          nameKm: nameKm.trim(),
          nameEn: nameEn.trim(),
          photoUrl: photoUrl.trim(),
          note: note.trim(),
          isActive: true,
        });
      }
    } catch (error) {
      console.error('Failed to save guest', error);
      setPhotoUploadMessage('រក្សាទុកមិនបានទេ។ Browser Storage ពេញ សូមលុបរូបភាពខ្លះ ហើយសាកល្បងម្តងទៀត។');
      return;
    }

    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-fadeIn">
        <div className="p-6 bg-[#FAF7F0] border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="font-moul text-base text-[#4A0E17]">
              {guest ? 'កែប្រែព័ត៌មានភ្ញៀវ' : 'បន្ថែមភ្ញៀវកិត្តិយសថ្មី'}
            </h3>
            <span className="text-[11px] text-[#C5A059] font-semibold">
              ប្រភេទភ្ញៀវ: ភ្ញៀវកិត្តិយស (Honored Guest)
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-200 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-kantumruy">
          {/* Guest Photo Upload & Preview */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#4A0E17]" />
              <span>រូបថតភ្ញៀវ (Guest Portrait Photo) - ភ្ញៀវនឹងឃើញរូបគាត់ផ្ទាល់ពេលបើកធៀប</span>
            </label>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-amber-50/50 border border-amber-200/80">
              {/* Photo Preview */}
              <div className="relative w-16 h-16 rounded-full border-2 border-[#C5A059] overflow-hidden flex-shrink-0 bg-white shadow-sm flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt="Guest Preview" className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-7 h-7 text-stone-300" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="guest-photo-upload"
                    className={`px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-[#4A0E17] border border-amber-300 text-xs font-semibold shadow-xs flex items-center gap-1.5 ${
                      isPhotoUploading ? 'opacity-60 cursor-wait' : 'cursor-pointer'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isPhotoUploading ? 'កំពុងផ្ទុក...' : 'ជ្រើសរើសរូបថត (Upload)'}</span>
                  </label>
                  <input
                    id="guest-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isPhotoUploading}
                    className="hidden"
                  />

                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs cursor-pointer"
                    >
                      លុបរូប
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={photoUrl.startsWith('data:') ? '(រូបភាពបាន Upload ពីឧបករណ៍)' : photoUrl}
                  onChange={(e) => {
                    if (!e.target.value.startsWith('(')) {
                      setPhotoUrl(e.target.value);
                    }
                  }}
                  placeholder="ឬបិទភ្ជាប់តំណភ្ជាប់រូបភាព URL (https://...)"
                  className="w-full px-2.5 py-1 rounded-lg border border-stone-200 text-[11px] focus:outline-none focus:border-[#4A0E17]"
                />
              </div>
            </div>
            {photoUploadMessage && (
              <p className={`mt-2 text-xs ${
                photoUploadMessage.includes('មិនបាន') || photoUploadMessage.includes('មិនអាច')
                  ? 'text-rose-700'
                  : 'text-emerald-700'
              }`}>
                {photoUploadMessage}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              ឈ្មោះភ្ញៀវ (ខ្មែរ) *
            </label>
            <input
              type="text"
              required
              value={nameKm}
              onChange={(e) => setNameKm(e.target.value)}
              placeholder="ឧ. សុខ គង់ និងភរិយា"
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#4A0E17] font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              ឈ្មោះឡាតាំង (English Name - បើមាន)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Sok Kong & Wife"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#4A0E17]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              ចំណាំបន្ថែម (Note)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ឧ. ភ្ញៀវកិត្តិយស VIP..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#4A0E17]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-200">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-medium cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#4A0E17] hover:bg-[#32060f] text-white text-xs font-medium shadow cursor-pointer"
            >
              {guest ? 'កែប្រែព័ត៌មាន' : 'បន្ថែមភ្ញៀវ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
