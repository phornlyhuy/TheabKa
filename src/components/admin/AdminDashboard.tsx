import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  LogOut,
  ExternalLink,
  Edit3,
  Settings,
  ChevronRight,
  TrendingUp,
  Heart,
  MessageSquare
} from 'lucide-react';
import { WeddingConfig, Guest } from '../../types/wedding';
import { storage } from '../../services/storage';
import { GuestListTable } from './GuestListTable';
import { InvitationEditor } from './InvitationEditor';
import { SettingsPanel } from './SettingsPanel';
import { GuestWishesManager } from './GuestWishesManager';
import {
  fetchAdminGuests,
  fetchAdminWishes,
  fetchPublishedWeddingConfig,
  isSupabaseConfigured,
} from '../../services/supabase';

interface AdminDashboardProps {
  onLogout: () => void;
  onViewGuestSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onViewGuestSite }) => {
  const [activeTab, setActiveTab] = useState<'guests' | 'wishes' | 'editor' | 'settings'>('guests');
  const [config, setConfig] = useState<WeddingConfig>(storage.getConfig());
  const [guests, setGuests] = useState<Guest[]>(storage.getGuests());
  const [wishesCount, setWishesCount] = useState<number>(
    isSupabaseConfigured ? 0 : storage.getAllWishes().length,
  );
  const [dataError, setDataError] = useState('');

  const refreshData = async () => {
    try {
      if (isSupabaseConfigured) {
        const [sharedGuests, sharedConfig, sharedWishes] = await Promise.all([
          fetchAdminGuests(),
          fetchPublishedWeddingConfig(),
          fetchAdminWishes(),
        ]);
        if (!storage.saveGuests(sharedGuests)) {
          throw new Error('Could not cache shared guest records in browser storage.');
        }
        setGuests(sharedGuests);
        if (sharedConfig) setConfig(sharedConfig);
        setWishesCount(sharedWishes.length);
      } else {
        setConfig(storage.getConfig());
        setGuests(storage.getGuests());
        setWishesCount(storage.getAllWishes().length);
      }
      setDataError('');
    } catch (error) {
      console.error('Failed to load shared admin data', error);
      setDataError('Could not load shared data. Check your Supabase setup and admin access, then reload.');
    }
  };

  useEffect(() => {
    void refreshData();
  }, []);

  // Stats Calculations
  const totalGuests = guests.length;
  const attendingGuests = guests.filter(g => g.rsvpStatus === 'attending');
  const declinedGuests = guests.filter(g => g.rsvpStatus === 'declined');
  const pendingGuests = guests.filter(g => g.rsvpStatus === 'pending');

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-stone-900 pb-20 selection:bg-amber-200">
      {/* Top Navbar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4A0E17] to-[#7A1E2C] flex items-center justify-center text-white shadow-md">
              <Heart className="w-5 h-5 fill-current text-amber-200" />
            </div>
            <div>
              <h1 className="font-moul text-sm sm:text-base text-stone-900 flex items-center gap-2">
                <span>{config.groomNameKm} & {config.brideNameKm}</span>
                <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  T & Y Admin
                </span>
              </h1>
              <p className="text-[11px] text-stone-500 font-kantumruy">
                {config.solarDateKm} • {config.venueNameKm}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onViewGuestSite}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F0] hover:bg-stone-200/60 text-[#4A0E17] border border-amber-300/80 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">មើលទំព័រភ្ញៀវ (View Website)</span>
              <span className="sm:hidden">ទំព័រភ្ញៀវ</span>
            </button>

            <button
              onClick={onLogout}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-stone-100 text-stone-600 hover:text-rose-600 text-xs font-medium transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">ចាកចេញ</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 border-t border-stone-100 overflow-x-auto">
          {[
            { id: 'guests', label: 'បញ្ជីភ្ញៀវ & តំណភ្ជាប់', icon: Users, badge: totalGuests },
            { id: 'wishes', label: '💌 សារជូនពរពីភ្ញៀវ', icon: MessageSquare, badge: wishesCount, highlight: true },
            { id: 'editor', label: 'កែសម្រួលធៀបការ', icon: Edit3 },
            { id: 'settings', label: 'ការកំណត់ & ការណែនាំ', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                type="button"
                className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap font-kantumruy ${
                  isActive
                    ? 'border-[#4A0E17] text-[#4A0E17]'
                    : 'border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#4A0E17]' : tab.highlight ? 'text-amber-600' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    isActive
                      ? 'bg-[#4A0E17] text-white'
                      : tab.highlight
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-stone-200 text-stone-600'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {!isSupabaseConfigured && (
          <div role="status" className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Supabase is not configured. Imported guests and RSVPs stay in this browser, so personal links will not work on guests' phones yet. Follow the setup steps in README.md.
          </div>
        )}
        {dataError && (
          <div role="alert" className="mb-5 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {dataError}
          </div>
        )}
        {/* STATS OVERVIEW CARDS */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          {/* Card 1: Total Invited */}
          <div
            onClick={() => setActiveTab('guests')}
            className="p-4 rounded-3xl bg-white border border-stone-200 shadow-sm cursor-pointer hover:border-stone-400 transition-colors"
          >
            <div className="flex items-center justify-between text-stone-500 text-xs mb-1 font-kantumruy">
              <span>ភ្ញៀវអញ្ជើញសរុប</span>
              <Users className="w-4 h-4 text-stone-400" />
            </div>
            <div className="font-moul text-xl sm:text-2xl text-stone-900">
              {totalGuests} <span className="text-xs font-sans font-normal text-stone-500">នាក់</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-1 font-kantumruy">
              បញ្ជីភ្ញៀវសរុបក្នុងប្រព័ន្ធ
            </div>
          </div>

          {/* Card 2: Attending Confirmed */}
          <div className="p-4 rounded-3xl bg-white border border-emerald-200/80 shadow-sm">
            <div className="flex items-center justify-between text-emerald-700 text-xs mb-1 font-semibold font-kantumruy">
              <span>បានឆ្លើយតបចូលរួម</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-moul text-xl sm:text-2xl text-emerald-800">
              {attendingGuests.length} <span className="text-xs font-sans font-normal text-stone-500">នាក់</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1 font-kantumruy">
              {totalGuests > 0 ? Math.round((attendingGuests.length / totalGuests) * 100) : 0}% នៃការអញ្ជើញ
            </div>
          </div>

          {/* Card 3: Guest Wishes Card - Directly answers user prompt */}
          <div
            onClick={() => setActiveTab('wishes')}
            className="p-4 rounded-3xl bg-gradient-to-br from-[#FAF7F0] to-amber-50 border-2 border-amber-300 shadow-sm cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center justify-between text-[#4A0E17] text-xs mb-1 font-bold font-kantumruy">
              <span>💌 សារជូនពរពីភ្ញៀវ</span>
              <MessageSquare className="w-4 h-4 text-[#4A0E17]" />
            </div>
            <div className="font-moul text-xl sm:text-2xl text-[#4A0E17]">
              {wishesCount} <span className="text-xs font-sans font-normal text-[#4A0E17]">សារ</span>
            </div>
            <div className="text-[11px] text-amber-800 font-medium mt-1 font-kantumruy flex items-center gap-1">
              <span>ចុចទីនេះដើម្បីអានសារ 👉</span>
            </div>
          </div>

          {/* Card 4: Declined */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between text-rose-700 text-xs mb-1 font-semibold font-kantumruy">
              <span>មិនអាចចូលរួម</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="font-moul text-xl sm:text-2xl text-rose-800">
              {declinedGuests.length} <span className="text-xs font-sans font-normal text-stone-500">នាក់</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-1 font-kantumruy">
              {totalGuests > 0 ? Math.round((declinedGuests.length / totalGuests) * 100) : 0}%
            </div>
          </div>

          {/* Card 5: Pending */}
          <div className="col-span-2 lg:col-span-1 p-4 rounded-3xl bg-white border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between text-amber-700 text-xs mb-1 font-semibold font-kantumruy">
              <span>រង់ចាំឆ្លើយតប</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="font-moul text-xl sm:text-2xl text-stone-800">
              {pendingGuests.length} <span className="text-xs font-sans font-normal text-stone-500">នាក់</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-1 font-kantumruy">
              មិនទាន់បានឆ្លើយតប
            </div>
          </div>
        </section>

        {/* Tab 1: Guest List Table */}
        {activeTab === 'guests' && (
          <GuestListTable
            guests={guests}
            onGuestsUpdated={refreshData}
            coupleNames={`${config.groomNameKm} & ${config.brideNameKm}`}
          />
        )}

        {/* Tab 2: Guest Wishes Manager - Dedicated wishes view */}
        {activeTab === 'wishes' && (
          <GuestWishesManager onRefresh={refreshData} />
        )}

        {/* Tab 3: Invitation Editor */}
        {activeTab === 'editor' && (
          <InvitationEditor
            initialConfig={config}
            onPublish={(newConfig) => {
              setConfig(newConfig);
              refreshData();
            }}
          />
        )}

        {/* Tab 4: Settings Panel & Documentation */}
        {activeTab === 'settings' && (
          <SettingsPanel onDataReset={refreshData} />
        )}
      </main>
    </div>
  );
};
