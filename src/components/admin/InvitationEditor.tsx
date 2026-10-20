import React, { useState } from 'react';
import {
  Save,
  Send,
  Eye,
  Check,
  Smartphone,
  Monitor,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Palette,
  Type,
  Calendar,
  MapPin,
  Users,
  Clock,
  Sparkles,
  Gift,
  AlertTriangle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { WeddingConfig, ScheduleItem, GalleryPhoto, ThemePreset, KhmerFontFamily } from '../../types/wedding';
import { storage } from '../../services/storage';
import { compressImageForStorage } from '../../services/imageUpload';
import { GuestInvitationView } from '../guest/GuestInvitationView';

interface InvitationEditorProps {
  initialConfig: WeddingConfig;
  onPublish: (newConfig: WeddingConfig) => void;
}

export const InvitationEditor: React.FC<InvitationEditorProps> = ({ initialConfig, onPublish }) => {
  const [config, setConfig] = useState<WeddingConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<'couple' | 'date-venue' | 'agenda' | 'photos' | 'gift' | 'theme'>('couple');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isStatusError, setIsStatusError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const showStatus = (msg: string, isError = false) => {
    setSaveStatus(msg);
    setIsStatusError(isError);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleSaveDraft = () => {
    const saved = storage.saveDraftConfig(config);
    showStatus(
      saved
        ? 'បានរក្សាទុកពង្រាង (Draft Saved)!'
        : 'រក្សាទុកមិនបានទេ។ ទំហំ Browser Storage ពេញ សូមលុបរូបភាពខ្លះ ឬប្រើរូបភាពតូចជាងនេះ។',
      !saved,
    );
  };

  const handlePublish = () => {
    const published = storage.publishDraft(config);
    if (!published) {
      showStatus('ផ្សព្វផ្សាយមិនបានទេ។ ទំហំ Browser Storage ពេញ សូមលុបរូបភាពខ្លះ ហើយសាកល្បងម្តងទៀត។', true);
      return;
    }
    setConfig(published);
    onPublish(published);
    showStatus('បានផ្សព្វផ្សាយជាផ្លូវការ (Published to Live Guests)!');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImage' | 'giftQrImage') => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressedImage = await compressImageForStorage(
        file,
        field === 'giftQrImage'
          ? { format: 'image/png', maxOutputSize: 400 * 1024, maxDimension: 1200 }
          : undefined,
      );
      setConfig(prev => ({ ...prev, [field]: compressedImage }));
      showStatus('រូបភាពបានផ្ទុករួច។ សូមចុច Save Draft ឬ Publish ដើម្បីរក្សាទុក។');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'មិនអាចផ្ទុករូបភាពបានទេ។';
      showStatus(message, true);
    } finally {
      setIsUploading(false);
      input.value = '';
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const files = Array.from(input.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    const newPhotos: GalleryPhoto[] = [];
    const failures: string[] = [];
    for (const file of files) {
      try {
        newPhotos.push({
          id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          url: await compressImageForStorage(file),
          captionKm: 'រូបថត Pre-wedding',
          captionEn: 'Pre-wedding Photo',
        });
      } catch (error) {
        failures.push(`${file.name}: ${error instanceof Error ? error.message : 'Upload failed'}`);
      }
    }
    if (newPhotos.length > 0) {
      setConfig(prev => ({ ...prev, gallery: [...prev.gallery, ...newPhotos] }));
    }
    if (failures.length > 0) {
      showStatus(
        `${newPhotos.length} រូបបានផ្ទុក, ${failures.length} រូបបរាជ័យ។ ${failures[0]}`,
        true,
      );
    } else {
      showStatus(`បានផ្ទុករូប ${newPhotos.length} សន្លឹក។ សូមចុច Save Draft ឬ Publish ដើម្បីរក្សាទុក។`);
    }
    setIsUploading(false);
    input.value = '';
  };

  // Agenda / Schedule handlers
  const handleAddSchedule = () => {
    const newItem: ScheduleItem = {
      id: 'agenda_' + Date.now(),
      timeKm: 'វេលាម៉ោង ០៨:០០ ព្រឹក',
      timeEn: '08:00 AM',
      titleKm: 'ពិធីថ្មី',
      titleEn: 'New Ceremony Event',
      descriptionKm: 'សូមបញ្ជាក់ការពិពណ៌នានៅទីនេះ',
      descriptionEn: 'Event description',
      icon: 'blessing',
    };
    setConfig(prev => ({
      ...prev,
      schedules: [...prev.schedules, newItem],
    }));
  };

  const handleUpdateSchedule = (index: number, updates: Partial<ScheduleItem>) => {
    setConfig(prev => {
      const updated = [...prev.schedules];
      updated[index] = { ...updated[index], ...updates };
      return { ...prev, schedules: updated };
    });
  };

  const handleDeleteSchedule = (index: number) => {
    setConfig(prev => {
      const updated = prev.schedules.filter((_, i) => i !== index);
      return { ...prev, schedules: updated };
    });
  };

  const handleMoveSchedule = (index: number, direction: 'up' | 'down') => {
    setConfig(prev => {
      const list = [...prev.schedules];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, schedules: list };
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="sticky top-2 z-30 flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-md">
        <div className="flex items-center gap-2">
          {/* Switch Edit / Preview */}
          <div className="bg-stone-100 p-1 rounded-2xl flex items-center">
            <button
              onClick={() => setViewMode('edit')}
              type="button"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'edit'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              កែសម្រួល (Editor)
            </button>
            <button
              onClick={() => setViewMode('preview')}
              type="button"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-amber-700" />
              <span>Preview ធៀបការ</span>
            </button>
          </div>

          {viewMode === 'preview' && (
            <div className="hidden sm:flex items-center gap-1 bg-stone-100 p-1 rounded-2xl">
              <button
                onClick={() => setPreviewDevice('mobile')}
                type="button"
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  previewDevice === 'mobile' ? 'bg-white text-amber-800 shadow-sm' : 'text-stone-500'
                }`}
                title="Mobile Mockup"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('desktop')}
                type="button"
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  previewDevice === 'desktop' ? 'bg-white text-amber-800 shadow-sm' : 'text-stone-500'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Status notification */}
        {saveStatus && (
          <div className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 animate-fadeIn ${
            isStatusError
              ? 'text-rose-700 bg-rose-50 border-rose-200'
              : 'text-emerald-700 bg-emerald-50 border-emerald-200'
          }`}>
            {isStatusError ? <AlertTriangle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
            <span>{saveStatus}</span>
          </div>
        )}

        {/* Save Draft & Publish */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-700" />
            <span>រក្សាទុកពង្រាង (Save Draft)</span>
          </button>

          <button
            onClick={handlePublish}
            type="button"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 text-amber-200" />
            <span>ផ្សព្វផ្សាយ (Publish Live)</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE: PREVIEW */}
      {viewMode === 'preview' ? (
        <div className="py-4">
          <div className="text-center mb-3">
            <span className="text-xs text-stone-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              កំពុងមើលគំរូ Preview ដូចភ្ញៀវពិត (Demo Guest Mode)
            </span>
          </div>

          {previewDevice === 'mobile' ? (
            <div className="max-w-sm mx-auto border-[12px] border-stone-800 rounded-[48px] shadow-2xl overflow-hidden bg-stone-900">
              <div className="w-32 h-4 bg-stone-800 mx-auto rounded-b-xl mb-1" />
              <div className="max-h-[750px] overflow-y-auto">
                <GuestInvitationView
                  config={config}
                  guest={{
                    id: 'preview_guest',
                    token: 'preview',
                    honorificKm: 'ឯកឧត្តម លោកជំទាវ',
                    honorificEn: 'His Excellency',
                    nameKm: 'ភ្ញៀវកិត្តិយសគំរូ',
                    nameEn: 'Distinguished Guest',
                    side: 'mutual',
                    allocatedSeats: 1,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    rsvpStatus: 'pending',
                    attendingGuestsCount: 1,
                  }}
                  isPreview={true}
                />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-stone-200">
              <GuestInvitationView
                config={config}
                guest={{
                  id: 'preview_guest',
                  token: 'preview',
                  honorificKm: 'ឯកឧត្តម លោកជំទាវ',
                  honorificEn: 'His Excellency',
                  nameKm: 'ភ្ញៀវកិត្តិយសគំរូ',
                  nameEn: 'Distinguished Guest',
                  side: 'mutual',
                  allocatedSeats: 1,
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  rsvpStatus: 'pending',
                  attendingGuestsCount: 1,
                }}
                isPreview={true}
              />
            </div>
          )}
        </div>
      ) : (
        /* VIEW MODE: EDITING TABS */
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          {/* Navigation Sub-Tabs */}
          <div className="flex overflow-x-auto border-b border-stone-200 bg-stone-50/70 p-2 gap-1">
            {[
              { id: 'couple', label: 'គូស្វាមីភរិយា & មាតាបិតា', icon: Users },
              { id: 'date-venue', label: 'កាលបរិច្ឆេទ & ទីតាំង', icon: MapPin },
              { id: 'agenda', label: 'កម្មវិធីពិធីការ', icon: Clock },
              { id: 'photos', label: 'រូបភាព & Gallery', icon: ImageIcon },
              { id: 'gift', label: 'ចងដៃ & KHQR', icon: Gift },
              { id: 'theme', label: 'រចនាប័ទ្ម & ពុម្ពអក្សរ', icon: Palette },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-amber-900 shadow-sm border border-stone-200'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-700" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: Couple & Parents Info */}
          {activeTab === 'couple' && (
            <div className="p-6 space-y-6">
              {/* Couple Info */}
              <div>
                <h4 className="font-moul text-base text-stone-900 mb-3 text-amber-900">
                  ព័ត៌មានកូនកម្លោះ និងកូនក្រមុំ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Groom */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      កូនកម្លោះ (Groom)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] text-stone-500 mb-1">ងារ (Title)</label>
                        <input
                          type="text"
                          value={config.groomTitleKm}
                          onChange={(e) => setConfig({ ...config, groomTitleKm: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[11px] text-stone-500 mb-1">ឈ្មោះខ្មែរ (Khmer Name)</label>
                        <input
                          type="text"
                          value={config.groomNameKm}
                          onChange={(e) => setConfig({ ...config, groomNameKm: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-500 mb-1">ឈ្មោះឡាតាំង (English Name)</label>
                      <input
                        type="text"
                        value={config.groomNameEn}
                        onChange={(e) => setConfig({ ...config, groomNameEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>
                  </div>

                  {/* Bride */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                      កូនក្រមុំ (Bride)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] text-stone-500 mb-1">ងារ (Title)</label>
                        <input
                          type="text"
                          value={config.brideTitleKm}
                          onChange={(e) => setConfig({ ...config, brideTitleKm: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[11px] text-stone-500 mb-1">ឈ្មោះខ្មែរ (Khmer Name)</label>
                        <input
                          type="text"
                          value={config.brideNameKm}
                          onChange={(e) => setConfig({ ...config, brideNameKm: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-500 mb-1">ឈ្មោះឡាតាំង (English Name)</label>
                      <input
                        type="text"
                        value={config.brideNameEn}
                        onChange={(e) => setConfig({ ...config, brideNameEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Parents Info */}
              <div className="pt-4 border-t border-stone-200">
                <h4 className="font-moul text-base text-stone-900 mb-3 text-amber-900">
                  ព័ត៌មានមាតាបិតាទាំងសងខាង
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Groom Parents */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <span className="text-xs font-bold text-amber-900">មាតាបិតាខាងប្រុស</span>
                    <div>
                      <label className="block text-[11px] text-stone-500 mb-1">លោកឪពុក</label>
                      <input
                        type="text"
                        value={config.groomFatherKm}
                        onChange={(e) => setConfig({ ...config, groomFatherKm: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-500 mb-1">អ្នកម្តាយ</label>
                      <input
                        type="text"
                        value={config.groomMotherKm}
                        onChange={(e) => setConfig({ ...config, groomMotherKm: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>
                  </div>

                  {/* Bride Parents */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <span className="text-xs font-bold text-amber-900">មាតាបិតាខាងស្រី</span>
                    <div>
                      <label className="block text-[11px] text-stone-500 mb-1">លោកឪពុក</label>
                      <input
                        type="text"
                        value={config.brideFatherKm}
                        onChange={(e) => setConfig({ ...config, brideFatherKm: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-500 mb-1">អ្នកម្តាយ</label>
                      <input
                        type="text"
                        value={config.brideMotherKm}
                        onChange={(e) => setConfig({ ...config, brideMotherKm: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Invitation Letter */}
              <div className="pt-4 border-t border-stone-200">
                <h4 className="font-moul text-base text-stone-900 mb-2 text-amber-900">
                  ខ្លឹមសារលិខិតអញ្ជើញ
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      ចំណងជើងធៀប (Khmer Title)
                    </label>
                    <input
                      type="text"
                      value={config.invitationTitleKm}
                      onChange={(e) => setConfig({ ...config, invitationTitleKm: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      សារអញ្ជើញជាភាសាខ្មែរ (Khmer Invitation Text)
                    </label>
                    <textarea
                      rows={4}
                      value={config.invitationMessageKm}
                      onChange={(e) => setConfig({ ...config, invitationMessageKm: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      សារអញ្ជើញជាភាសាអង់គ្លេស (English Invitation Text)
                    </label>
                    <textarea
                      rows={3}
                      value={config.invitationMessageEn}
                      onChange={(e) => setConfig({ ...config, invitationMessageEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Date & Venue */}
          {activeTab === 'date-venue' && (
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-moul text-base text-stone-900 mb-3 text-amber-900">
                  កាលបរិច្ឆេទពិធីមង្គលការ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      កាលបរិច្ឆេទ (YYYY-MM-DD)
                    </label>
                    <input
                      type="date"
                      value={config.weddingDate}
                      onChange={(e) => setConfig({ ...config, weddingDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      ម៉ោងទទួលភ្ញៀវពេលល្ងាច (Time)
                    </label>
                    <input
                      type="time"
                      value={config.weddingTime}
                      onChange={(e) => setConfig({ ...config, weddingTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      កាលបរិច្ឆេទខ្មែរសុរិយគតិ (Solar Date)
                    </label>
                    <input
                      type="text"
                      value={config.solarDateKm}
                      onChange={(e) => setConfig({ ...config, solarDateKm: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      កាលបរិច្ឆេទចន្ទគតិ (Lunar Date)
                    </label>
                    <input
                      type="text"
                      value={config.lunarDateKm}
                      onChange={(e) => setConfig({ ...config, lunarDateKm: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Venue */}
              <div className="pt-4 border-t border-stone-200">
                <h4 className="font-moul text-base text-stone-900 mb-3 text-amber-900">
                  ទីតាំងរៀបចំពិធី និង Google Maps
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">
                        ឈ្មោះទីតាំង (ខ្មែរ)
                      </label>
                      <input
                        type="text"
                        value={config.venueNameKm}
                        onChange={(e) => setConfig({ ...config, venueNameKm: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">
                        ឈ្មោះទីតាំង (English)
                      </label>
                      <input
                        type="text"
                        value={config.venueNameEn}
                        onChange={(e) => setConfig({ ...config, venueNameEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      អាសយដ្ឋានលម្អិត
                    </label>
                    <input
                      type="text"
                      value={config.venueAddressKm}
                      onChange={(e) => setConfig({ ...config, venueAddressKm: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      តំណភ្ជាប់ Google Maps URL
                    </label>
                    <input
                      type="url"
                      value={config.googleMapsUrl}
                      onChange={(e) => setConfig({ ...config, googleMapsUrl: e.target.value })}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Agenda / Ceremonial Schedules */}
          {activeTab === 'agenda' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-moul text-base text-amber-900">
                    កម្មវិធីសិរីសួស្តីមង្គលអាពាហ៍ពិពាហ៍
                  </h4>
                  <p className="text-xs text-stone-500">
                    អ្នកអាចកែប្រែ បន្ថែម លុប ឬរៀបលំដាប់ពិធីនីមួយៗបាន
                  </p>
                </div>
                <button
                  onClick={handleAddSchedule}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium shadow transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>បន្ថែមពិធី</span>
                </button>
              </div>

              <div className="space-y-4">
                {config.schedules.map((schedule, idx) => (
                  <div
                    key={schedule.id || idx}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200 relative group"
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-stone-200 pb-2">
                      <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{schedule.titleKm}</span>
                      </span>

                      {/* Reorder and Delete controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveSchedule(idx, 'up')}
                          disabled={idx === 0}
                          type="button"
                          className="p-1 rounded bg-white hover:bg-stone-200 disabled:opacity-30 text-stone-600 transition-colors cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveSchedule(idx, 'down')}
                          disabled={idx === config.schedules.length - 1}
                          type="button"
                          className="p-1 rounded bg-white hover:bg-stone-200 disabled:opacity-30 text-stone-600 transition-colors cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(idx)}
                          type="button"
                          className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-stone-500 mb-1">ម៉ោងពិធី</label>
                        <input
                          type="text"
                          value={schedule.timeKm}
                          onChange={(e) => handleUpdateSchedule(idx, { timeKm: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-stone-500 mb-1">ឈ្មោះពិធី</label>
                        <input
                          type="text"
                          value={schedule.titleKm}
                          onChange={(e) => handleUpdateSchedule(idx, { titleKm: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div className="mt-2">
                      <label className="block text-[11px] text-stone-500 mb-1">ការពិពណ៌នាសង្ខេប</label>
                      <input
                        type="text"
                        value={schedule.descriptionKm}
                        onChange={(e) => handleUpdateSchedule(idx, { descriptionKm: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Photos & Gallery */}
          {activeTab === 'photos' && (
            <div className="p-6 space-y-6">
              {/* Cover Image */}
              <div>
                <h4 className="font-moul text-base text-amber-900 mb-2">
                  រូបភាពធៀបមុខ (Cover Photo)
                </h4>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="w-40 aspect-[16/10] rounded-xl overflow-hidden bg-stone-200 border shadow-sm flex-shrink-0">
                    {config.coverImage ? (
                      <img src={config.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                        គ្មានរូបភាព
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium shadow cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? 'កំពុងផ្ទុករូបភាព...' : 'ផ្ទុករូបភាពឡើងពីឧបករណ៍'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={(e) => handleImageUpload(e, 'coverImage')}
                        className="hidden"
                      />
                    </label>
                    <div className="text-[11px] text-stone-500">ឬបញ្ចូលតំណភ្ជាប់រូបភាព (Image URL):</div>
                    <input
                      type="url"
                      value={config.coverImage}
                      onChange={(e) => setConfig({ ...config, coverImage: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Gallery Photos */}
              <div className="pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-moul text-base text-amber-900">
                      កម្រងរូបភាព Pre-Wedding ({config.gallery.length} សន្លឹក)
                    </h4>
                    <p className="text-xs text-stone-500">
                      ផ្ទុករូបភាពពីទូរសព្ទ/កុំព្យូទ័រ ឬបញ្ចូល Link
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium shadow cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'កំពុងផ្ទុករូប...' : 'បញ្ចូលរូបថតថ្មី'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={isUploading}
                      onChange={handleGalleryUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {config.gallery.map((photo, idx) => (
                    <div
                      key={photo.id || idx}
                      className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 relative group"
                    >
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-200 relative">
                        <img src={photo.url} alt="Gallery" className="w-full h-full object-cover" />
                        <button
                          onClick={() => {
                            setConfig(prev => ({
                              ...prev,
                              gallery: prev.gallery.filter((_, i) => i !== idx),
                            }));
                          }}
                          type="button"
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors cursor-pointer"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={photo.captionKm || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setConfig(prev => {
                            const updated = [...prev.gallery];
                            updated[idx] = { ...updated[idx], captionKm: val };
                            return { ...prev, gallery: updated };
                          });
                        }}
                        placeholder="ចំណងជើងរូបភាព..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Gift & KHQR */}
          {activeTab === 'gift' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-moul text-base text-amber-900">
                    ការចងដៃតាម QR Code (ABA / Bakong KHQR)
                  </h4>
                  <p className="text-xs text-stone-500">
                    អនុញ្ញាតឱ្យភ្ញៀវផ្ញើចំណងដៃ និងពរជ័យតាមប្រព័ន្ធឌីជីថល
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.giftEnabled}
                    onChange={(e) => setConfig({ ...config, giftEnabled: e.target.checked })}
                    className="w-4 h-4 accent-amber-600 rounded"
                  />
                  <span className="text-xs font-semibold text-stone-700">បើកបង្ហាញមុខងារនេះ</span>
                </label>
              </div>

              {config.giftEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">
                        ឈ្មោះធនាគារ (Bank Name)
                      </label>
                      <input
                        type="text"
                        value={config.giftBankName}
                        onChange={(e) => setConfig({ ...config, giftBankName: e.target.value })}
                        placeholder="ABA Bank / Bakong KHQR"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">
                        ឈ្មោះម្ចាស់គណនី (Account Name)
                      </label>
                      <input
                        type="text"
                        value={config.giftAccountName}
                        onChange={(e) => setConfig({ ...config, giftAccountName: e.target.value })}
                        placeholder="CHEA CHANDARA & SORN SOCHEATA"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">
                        លេខគណនី (Account Number)
                      </label>
                      <input
                        type="text"
                        value={config.giftAccountNumber}
                        onChange={(e) => setConfig({ ...config, giftAccountNumber: e.target.value })}
                        placeholder="001 999 888"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* QR Image Upload */}
                  <div className="text-center space-y-3">
                    <label className="block text-xs font-semibold text-stone-600">
                      រូបភាព KHQR ផ្ទាល់ខ្លួន (ប្រសិនបើមាន)
                    </label>
                    <div className="w-40 h-40 mx-auto rounded-2xl bg-white border border-stone-300 shadow-inner flex items-center justify-center overflow-hidden">
                      {config.giftQrImage ? (
                        <img src={config.giftQrImage} alt="Custom QR" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xs text-stone-400 p-2">បង្កើត QR Code ស្វ័យប្រវត្តិ</span>
                      )}
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-medium cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'កំពុងផ្ទុករូបភាព...' : 'ផ្ទុករូបភាព QR ពីឧបករណ៍'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={(e) => handleImageUpload(e, 'giftQrImage')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: Theme, Colors & Khmer Fonts */}
          {activeTab === 'theme' && (
            <div className="p-6 space-y-6">
              {/* Presets */}
              <div>
                <h4 className="font-moul text-base text-amber-900 mb-2">
                  ជ្រើសរើសរចនាប័ទ្មពណ៌ (Wedding Theme Presets)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'royal-gold', name: 'មាសសិរីមង្គល (Royal Gold)', primary: '#b48325', accent: '#8a1324', bg: '#fdfbf7' },
                    { id: 'crimson-ruby', name: 'ទទឹមក្រហម (Crimson Ruby)', primary: '#9b111e', accent: '#d4af37', bg: '#fffaf9' },
                    { id: 'romantic-rose', name: 'ផ្កាកុលាប (Romantic Rose)', primary: '#b76e79', accent: '#d4af37', bg: '#fffafa' },
                    { id: 'emerald-sage', name: 'ត្បូងមរកត (Emerald Sage)', primary: '#2d6a4f', accent: '#d4af37', bg: '#f4f9f4' },
                    { id: 'classic-noir', name: 'បុរាណរាជវាំង (Classic Luxury)', primary: '#3d2e1e', accent: '#c59b27', bg: '#fbf9f5' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setConfig(prev => ({
                          ...prev,
                          theme: {
                            ...prev.theme,
                            preset: preset.id as ThemePreset,
                            primaryColor: preset.primary,
                            accentColor: preset.accent,
                            bgColor: preset.bg,
                          },
                        }));
                      }}
                      type="button"
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        config.theme.preset === preset.id
                          ? 'border-amber-600 bg-amber-50/70 shadow-sm'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: preset.primary }} />
                        <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: preset.accent }} />
                        <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: preset.bg }} />
                      </div>
                      <span className="text-xs font-bold text-stone-800">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Khmer Font Family Selection */}
              <div className="pt-4 border-t border-stone-200">
                <h4 className="font-moul text-base text-amber-900 mb-2">
                  ពុម្ពអក្សរខ្មែរ (Khmer Font Family)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'kantumruy', name: 'Kantumruy Pro', sample: 'សិរីសួស្តី អាពាហ៍ពិពាហ៍' },
                    { id: 'moul', name: 'Moul (មូល)', sample: 'សិរីសួស្តី អាពាហ៍ពិពាហ៍' },
                    { id: 'battambang', name: 'Battambang', sample: 'សិរីសួស្តី អាពាហ៍ពិពាហ៍' },
                    { id: 'siemreap', name: 'Siemreap', sample: 'សិរីសួស្តី អាពាហ៍ពិពាហ៍' },
                  ].map((font) => (
                    <button
                      key={font.id}
                      onClick={() => {
                        setConfig(prev => ({
                          ...prev,
                          theme: {
                            ...prev.theme,
                            fontFamily: font.id as KhmerFontFamily,
                          },
                        }));
                      }}
                      type="button"
                      className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        config.theme.fontFamily === font.id
                          ? 'border-amber-600 bg-amber-50/70 shadow-sm'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <p className="text-xs font-semibold text-stone-700">{font.name}</p>
                      <p className="text-xs text-amber-900 mt-1 font-moul">{font.sample}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modules Toggles */}
              <div className="pt-4 border-t border-stone-200">
                <h4 className="font-moul text-base text-amber-900 mb-3">
                  គ្រប់គ្រងផ្នែកបង្ហាញលើទំព័រភ្ញៀវ (Show/Hide Modules)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'showRsvp', label: 'ប៊ូតុង RSVP ឆ្លើយតប' },
                    { key: 'showCountdown', label: 'រាប់ថយក្រោយ (Countdown)' },
                    { key: 'showCalendar', label: 'កត់ត្រាក្នុងប្រតិទិន (Calendar)' },
                    { key: 'showAgenda', label: 'កម្មវិធីពិធីការ (Agenda)' },
                    { key: 'showGallery', label: 'កម្រងរូបថត (Gallery)' },
                  ].map((mod) => (
                    <label
                      key={mod.key}
                      className="flex items-center gap-2 p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer hover:bg-stone-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={(config as any)[mod.key]}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setConfig(prev => ({ ...prev, [mod.key]: val }));
                        }}
                        className="w-4 h-4 accent-amber-600 rounded"
                      />
                      <span className="text-xs font-semibold text-stone-700">{mod.label}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
};
