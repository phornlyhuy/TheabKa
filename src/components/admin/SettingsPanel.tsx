import React, { useState } from 'react';
import {
  KeyRound,
  Database,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Server,
  Terminal,
  HelpCircle,
  Check,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Lock,
  Camera,
  ShieldCheck
} from 'lucide-react';
import { storage } from '../../services/storage';

interface SettingsPanelProps {
  onDataReset: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onDataReset }) => {
  const [currentPassword, setCurrentPassword] = useState(storage.getAdminPassword());
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || newPassword.length < 4) {
      setPasswordMessage({ text: 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៤ ខ្ទង់!', isError: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'ពាក្យសម្ងាត់ផ្ទៀងផ្ទាត់មិនដូចគ្នាទេ!', isError: true });
      return;
    }

    storage.setAdminPassword(newPassword);
    setCurrentPassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMessage({ text: 'បានផ្លាស់ប្តូរពាក្យសម្ងាត់ Admin ជោគជ័យ!', isError: false });
    setTimeout(() => setPasswordMessage(null), 3500);
  };

  const handleResetDemoData = () => {
    if (window.confirm('តើអ្នកពិតជាចង់កំណត់ទិន្នន័យគំរូដើមឡើងវិញ? ភ្ញៀវទាំង ៥ នាក់ នឹងត្រូវកំណត់មកវិញ។')) {
      storage.resetToDemoData();
      onDataReset();
      alert('បានកំណត់ទិន្នន័យដើមឡើងវិញដោយជោគជ័យ!');
    }
  };

  const handleClearAllGuests = () => {
    if (window.confirm('តើអ្នកប្រាកដជាចង់លុបភ្ញៀវទាំងអស់ចេញពីបញ្ជី? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។')) {
      storage.clearAllGuests();
      onDataReset();
      alert('បានសម្អាតបញ្ជីភ្ញៀវរួចរាល់!');
    }
  };

  const handleExportFullBackup = () => {
    const backup = {
      config: storage.getConfig(),
      guests: storage.getGuests(),
      exportedAt: new Date().toISOString(),
      app: 'RounReatrey-PhornChakriya-Wedding',
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Wedding_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.config && Array.isArray(json.guests)) {
          const configSaved = storage.saveConfig(json.config);
          const draftSaved = storage.saveDraftConfig(json.config);
          const guestsSaved = storage.saveGuests(json.guests);
          if (!configSaved || !draftSaved || !guestsSaved) {
            alert('ស្តារទិន្នន័យមិនបានពេញលេញទេ។ Browser Storage អាចពេញ សូមលុបទិន្នន័យ ឬរូបភាពខ្លះ រួចសាកល្បងម្តងទៀត។');
            return;
          }
          onDataReset();
          alert('បានស្តារទិន្នន័យពីឯកសារ Backup ដោយជោគជ័យ!');
        } else {
          alert('ឯកសារ Backup មិនត្រឹមត្រូវទេ!');
        }
      } catch (err) {
        alert('បរាជ័យក្នុងការអានឯកសារ JSON!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-kantumruy">
      {/* SECTION 1: Admin Security & Master Password */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4A0E17] to-[#7A1E2C] text-amber-200 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-moul text-base text-[#4A0E17]">
              សុវត្ថិភាពគណនី Admin (Security & Master Password)
            </h3>
            <p className="text-xs text-stone-500 font-kantumruy">
              ផ្លាស់ប្តូរពាក្យសម្ងាត់សម្រាប់ការពារផ្ទាំង Admin មិនឱ្យនរណាលួចចូលបាន
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-amber-200/80 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-stone-700 leading-relaxed font-kantumruy">
            <p className="font-bold text-stone-900">ប្រព័ន្ធការពារសុវត្ថិភាពខ្ពស់៖</p>
            <p className="mt-0.5">
              • តំណភ្ជាប់ធៀបការដែលផ្ញើទៅភ្ញៀវមិនបង្ហាញប៊ូតុង ឬលេខកូដ Admin ឡើយ។<br />
              • ប្រព័ន្ធចាក់សោសុវត្ថិភាព ៣នាទី ប្រសិនបើនរណាម្នាក់ព្យាយាមទាយពាក្យសម្ងាត់ខុសលើសពី ៥ដង។<br />
              • អ្នកអាចកំណត់ពាក្យសម្ងាត់ថ្មីរឹងមាំ (អក្សរ លេខ ឬសញ្ញា) នៅខាងក្រោមនេះ។
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              ពាក្យសម្ងាត់ថ្មី (New Password)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#4A0E17] font-mono tracking-wider"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់ថ្មី (Confirm Password)
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="វាយបញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#4A0E17] font-mono tracking-wider"
            />
          </div>

          {passwordMessage && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                passwordMessage.isError
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {passwordMessage.isError ? (
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              )}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#4A0E17] hover:bg-[#32060f] text-white text-xs font-semibold shadow transition-all cursor-pointer"
            >
              រក្សាទុកពាក្យសម្ងាត់ថ្មី
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: Data Backup & Reset */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#4A0E17] flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-moul text-base text-[#4A0E17]">
              បម្រុងទុក និងស្តារទិន្នន័យ (Backup & Restore)
            </h3>
            <p className="text-xs text-stone-500 font-kantumruy">
              ទាញយកទិន្នន័យទាំងអស់ទុក ឬកំណត់ទិន្នន័យគំរូឡើងវិញ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export Backup */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-amber-700" />
              <span>ទាញយកឯកសារ Backup (.json)</span>
            </h4>
            <p className="text-[11px] text-stone-500 font-kantumruy">
              រក្សាទុកព័ត៌មានធៀបការ បញ្ជីភ្ញៀវ រូបថត និងសារជូនពរទាំងអស់ជាឯកសារ JSON
            </p>
            <button
              onClick={handleExportFullBackup}
              type="button"
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-medium shadow-sm transition-colors cursor-pointer"
            >
              <span>Download Backup File</span>
            </button>
          </div>

          {/* Import Backup */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-amber-700" />
              <span>ស្តារទិន្នន័យពី Backup (.json)</span>
            </h4>
            <p className="text-[11px] text-stone-500 font-kantumruy">
              ផ្ទុកឡើងឯកសារ Backup ចាស់ដើម្បីស្តារឡើងវិញ
            </p>
            <label className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-medium shadow-sm transition-colors cursor-pointer">
              <span>ជ្រើសរើសឯកសារ Backup</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Reset / Clear Buttons */}
        <div className="pt-4 border-t border-stone-200 flex flex-wrap gap-3">
          <button
            onClick={handleResetDemoData}
            type="button"
            className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer font-kantumruy"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>កំណត់ទិន្នន័យដើមឡើងវិញ (Reset 5 Guests & Wishes)</span>
          </button>

          <button
            onClick={handleClearAllGuests}
            type="button"
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer font-kantumruy"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>លុបភ្ញៀវទាំងអស់ចេញពីបញ្ជី (Clear All Guests)</span>
          </button>
        </div>
      </div>

      {/* SECTION 3: Instructions on Sending Links and QR Codes */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-moul text-base text-stone-900">
              ការណែនាំផ្ញើ Link, QR Code និងរូបថតភ្ញៀវ
            </h3>
            <p className="text-xs text-stone-500 font-kantumruy">
              ជំហានងាយៗក្នុងការផ្ញើធៀបការទៅកាន់ភ្ញៀវកិត្តិយស
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-stone-700 leading-relaxed font-kantumruy">
          <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-amber-200/80 space-y-1.5">
            <h4 className="font-bold text-[#4A0E17] text-xs">
              ១. របៀបផ្ញើតំណភ្ជាប់ (Link) និង QR Code ទៅភ្ញៀវ៖
            </h4>
            <p>
              • ចូលទៅកាន់ Tab <strong>«បញ្ជីភ្ញៀវ & តំណភ្ជាប់»</strong><br />
              • នៅជួរឈ្មោះភ្ញៀវនីមួយៗ ចុចលើ <strong>«Copy Link»</strong> រួចផ្ញើទៅកាន់ Telegram, Messenger ឬ SMS របស់ភ្ញៀវ<br />
              • ឬចុចលើរូប <strong>QR Code</strong> ដើម្បីទាញយករូបភាព QR Code ជា file PNG សម្រាប់ព្រីន ឬផ្ញើជា Card
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-amber-200/80 space-y-1.5">
            <h4 className="font-bold text-[#4A0E17] text-xs">
              ២. របៀបដាក់រូបថតភ្ញៀវ (Guest Photo)៖
            </h4>
            <p>
              • នៅជួរឈ្មោះភ្ញៀវ ចុចប៊ូតុង <strong>Edit (រូបប៊ិច)</strong><br />
              • ចុច <strong>«ជ្រើសរើសរូបថត (Upload)»</strong> ដើម្បីជ្រើសរើសរូបថតភ្ញៀវពីទូរស័ព្ទ ឬកុំព្យូទ័រ<br />
              • នៅពេលភ្ញៀវបើក Link ធៀបការ គាត់នឹងឃើញរូបថតរបស់គាត់ផ្ទាល់ បង្ហាញក្នុងស៊ុមមាសយ៉ាងប្រណិត!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
