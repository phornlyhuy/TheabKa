/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { WeddingConfig, Guest } from './types/wedding';
import { EnvelopeIntro } from './components/guest/EnvelopeIntro';
import { GuestInvitationView } from './components/guest/GuestInvitationView';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Shield, HelpCircle, KeyRound } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<WeddingConfig>(storage.getConfig());
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(storage.isAdminLoggedIn());
  const [showAdminView, setShowAdminView] = useState(false);
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  // Parse URL query parameter or hash on mount and popstate
  const syncRouteFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;

    const tokenFromQuery = urlParams.get('token');
    const tokenFromHash = hash.startsWith('#token=') ? hash.replace('#token=', '') : null;
    const token = tokenFromQuery || tokenFromHash;

    const adminParam = urlParams.get('admin') === 'true' || hash === '#admin';

    if (adminParam) {
      setShowAdminView(true);
      return;
    }

    if (token) {
      const guest = storage.getGuestByToken(token);
      if (guest) {
        setCurrentGuest(guest);
        setInvalidToken(false);
      } else {
        setCurrentGuest(null);
        setInvalidToken(true);
      }
    } else {
      // Default: If no token provided, set to first demo guest
      const guests = storage.getGuests();
      if (guests.length > 0) {
        setCurrentGuest(guests[0]);
      }
    }
  };

  useEffect(() => {
    syncRouteFromUrl();
    window.addEventListener('popstate', syncRouteFromUrl);
    return () => window.removeEventListener('popstate', syncRouteFromUrl);
  }, []);

  const handleOpenAdmin = () => {
    setShowAdminView(true);
    window.history.pushState({}, '', `${window.location.pathname}?admin=true`);
  };

  const handleCloseAdmin = () => {
    setShowAdminView(false);
    const cleanUrl = currentGuest
      ? `${window.location.pathname}?token=${currentGuest.token}`
      : window.location.pathname;
    window.history.pushState({}, '', cleanUrl);
    setConfig(storage.getConfig());
  };

  // If Admin View is active
  if (showAdminView) {
    if (!isAdminLoggedIn) {
      return (
        <AdminLogin
          onSuccess={() => {
            setIsAdminLoggedIn(true);
          }}
          onCancel={handleCloseAdmin}
        />
      );
    }
    return (
      <AdminDashboard
        onLogout={() => {
          storage.logoutAdmin();
          setIsAdminLoggedIn(false);
          handleCloseAdmin();
        }}
        onViewGuestSite={handleCloseAdmin}
      />
    );
  }

  // If Guest token is invalid
  if (invalidToken) {
    return (
      <div className="min-h-screen khmer-pattern-bg flex items-center justify-center p-6 text-center bg-[#FAF7F0] font-kantumruy">
        <div className="max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-stone-200">
          <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h2 className="font-moul text-lg text-stone-900 mb-2">
            តំណភ្ជាប់មិនមានសុពលភាព
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed mb-6 font-kantumruy">
            សូមអភ័យទោស តំណភ្ជាប់ធៀបការដែលលោកអ្នកបានបើកមិនមានក្នុងប្រព័ន្ធ ឬត្រូវបានបិទដំណើរការ។ សូមទាក់ទងមកកាន់ក្រុមគ្រួសារសាមីដើមការ ដើម្បីទទួលបានតំណភ្ជាប់ថ្មី។
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                window.location.href = window.location.pathname;
              }}
              type="button"
              className="py-2.5 px-4 rounded-xl bg-[#4A0E17] text-white text-xs font-semibold cursor-pointer"
            >
              ត្រឡប់ទៅទំព័រដើម
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Guest Experience: Envelope vs Opened Invitation */}
      {!isEnvelopeOpened ? (
        <EnvelopeIntro
          guest={currentGuest}
          config={config}
          lang="km"
          onOpen={() => setIsEnvelopeOpened(true)}
        />
      ) : (
        <GuestInvitationView
          config={config}
          guest={currentGuest}
        />
      )}

      {/* Discreet Secret Key at bottom left for the Owner (no PIN text exposed) */}
      <button
        onClick={handleOpenAdmin}
        type="button"
        className="fixed bottom-3 left-3 z-40 p-2 rounded-full bg-stone-900/30 hover:bg-stone-900/80 text-stone-400 hover:text-amber-200 shadow-sm backdrop-blur-sm transition-all cursor-pointer opacity-30 hover:opacity-100"
        title="Admin Portal"
      >
        <Shield className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
