import React, { useState, useEffect } from 'react';
import { X, Download, Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { Guest } from '../../types/wedding';
import { getInvitationUrl } from '../../services/invitationLinks';

interface GuestQrModalProps {
  guest: Guest | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GuestQrModal: React.FC<GuestQrModalProps> = ({ guest, isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    setQrDataUrl('');
    setQrError('');
    if (!guest) {
      return () => {
        isCurrent = false;
      };
    }
    const personalUrl = getInvitationUrl(guest.token);
    if (!personalUrl) {
      setQrError('សូមកំណត់ Supabase និង URL សាធារណៈ HTTPS ជាមុនសិន។');
      return () => {
        isCurrent = false;
      };
    }

    QRCode.toDataURL(personalUrl, {
      width: 360,
      margin: 2,
      color: {
        dark: '#4A0E17',
        light: '#ffffff',
      },
    })
      .then(dataUrl => {
        if (isCurrent) setQrDataUrl(dataUrl);
      })
      .catch(error => {
        console.error('Failed to generate guest QR code', error);
        if (isCurrent) setQrError('មិនអាចបង្កើត QR Code បានទេ។ សូមសាកល្បងម្ដងទៀត។');
      });
    return () => {
      isCurrent = false;
    };
  }, [guest]);

  if (!isOpen || !guest) return null;

  const personalUrl = getInvitationUrl(guest.token);

  const handleCopy = () => {
    if (!personalUrl) return;
    void navigator.clipboard.writeText(personalUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(error => {
        console.error('Failed to copy guest invitation link', error);
        setQrError('មិនអាចចម្លង Link បានទេ។ សូមប្រើ HTTPS ហើយពិនិត្យសិទ្ធិ Clipboard។');
      });
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR-${guest.nameKm.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-kantumruy">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-amber-300 p-6 text-center animate-fadeIn">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Guest Photo if available */}
        {guest.photoUrl ? (
          <div className="w-16 h-16 rounded-full mx-auto mb-2.5 p-0.5 border-2 border-[#C5A059] shadow-sm">
            <img
              src={guest.photoUrl}
              alt={guest.nameKm}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        ) : (
          <div className="w-12 h-12 bg-amber-100 text-[#4A0E17] rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
            <QrCode className="w-6 h-6" />
          </div>
        )}

        <h3 className="font-moul text-base text-stone-900">
          QR Code ធៀបការផ្ទាល់ខ្លួន
        </h3>
        <p className="font-bold text-[#4A0E17] text-sm mt-1">
          {guest.honorificKm} {guest.nameKm}
        </p>

        {/* QR Canvas Container */}
        <div className="mt-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 inline-block">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR for ${guest.nameKm}`}
              className="w-48 h-48 mx-auto rounded-xl shadow-sm"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center p-3 text-xs text-stone-600 leading-relaxed">
              {personalUrl
                ? (qrError || 'កំពុងបង្កើត QR Code...')
                : 'សូមកំណត់ Supabase និងផ្សព្វផ្សាយវេបសាយលើ URL សាធារណៈ HTTPS ជាមុនសិន។ QR ពី localhost មិនអាចបើកលើទូរស័ព្ទភ្ញៀវបានទេ។'}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2">
          <button
            onClick={handleDownload}
            type="button"
            disabled={!qrDataUrl}
            className="w-full py-2.5 rounded-xl bg-[#4A0E17] hover:bg-[#32060f] text-white font-medium text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-200" />
            <span>ទាញយករូបភាព QR Code (.png)</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              type="button"
              disabled={!personalUrl}
              className="flex-1 py-2 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#4A0E17]" />}
              <span>{copied ? 'បានចម្លង!' : 'ចម្លង Link'}</span>
            </button>

            {personalUrl ? (
              <a
                href={personalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="មើលផ្ទាល់"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#4A0E17]" />
                <span>បើកមើល</span>
              </a>
            ) : (
              <span
                className="py-2 px-3 rounded-xl border border-stone-200 text-stone-400 font-medium text-xs flex items-center justify-center gap-1.5"
                title="ត្រូវការ Supabase និងវេបសាយសាធារណៈ HTTPS"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>បើកមើល</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
