import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle, Download } from 'lucide-react';
import { storage } from '../../services/storage';
import { CsvGuestRow } from '../../types/wedding';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedCount: number) => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<CsvGuestRow[]>([]);
  const [rowErrors, setRowErrors] = useState<Array<{ row: number; error: string; data: any }>>([]);
  const [hasParsed, setHasParsed] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        processCsvContent(content);
      }
    };
    reader.readAsText(file);
  };

  const processCsvContent = (content: string) => {
    const { validRows, errors } = storage.parseCsv(content);
    setParsedRows(validRows);
    setRowErrors(errors);
    setHasParsed(true);
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;

    let importedCount = 0;
    parsedRows.forEach((row) => {
      storage.addGuest({
        honorificKm: row.honorificKm || 'លោក/លោកស្រី',
        honorificEn: row.honorificEn || '',
        nameKm: row.nameKm,
        nameEn: row.nameEn,
        phoneNumber: row.phoneNumber,
        note: row.note,
        isActive: true,
      });
      importedCount++;
    });

    onImportSuccess(importedCount);
    onClose();
  };

  const handleDownloadTemplate = () => {
    const sampleCsv = `Name,Honorific,Phone,Note
សុក សុវណ្ណ,លោក,012345678,សាច់ញាតិ
លី ធីតា,កញ្ញា,098765432,មិត្តរួមការងារ
ឯកឧត្តម ជា វិចិត្រ,ឯកឧត្តម,017888999,ភ្ញៀវកិត្តិយស
សុខ គង់ និងភរិយា,លោក,012888999,ភ្ញៀវ VIP`;

    const blob = new Blob(['\uFEFF' + sampleCsv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Khmer_Wedding_Guest_Template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-fadeIn max-h-[90vh] flex flex-col font-kantumruy">
        {/* Header */}
        <div className="p-6 bg-[#FAF7F0] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#4A0E17] flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-moul text-base text-[#4A0E17]">
                បញ្ចូលបញ្ជីភ្ញៀវពី CSV (Batch Import)
              </h3>
              <p className="text-xs text-stone-500">
                អាច Upload ឯកសារ CSV/Excel ឬបិទភ្ជាប់ទិន្នន័យផ្ទាល់
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Template helper */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
            <span className="text-amber-900 font-medium">
              ទាញយកគំរូឯកសារ CSV សម្រាប់បំពេញទិន្នន័យ៖
            </span>
            <button
              onClick={handleDownloadTemplate}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-[#4A0E17] border border-amber-300 font-semibold shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          {/* File Upload Zone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
              ជ្រើសរើសឯកសារ CSV ពីកុំព្យូទ័រ
            </label>
            <div className="border-2 border-dashed border-stone-300 hover:border-[#4A0E17] rounded-2xl p-6 text-center transition-colors cursor-pointer bg-stone-50/50 hover:bg-amber-50/20">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-file-input"
              />
              <label htmlFor="csv-file-input" className="cursor-pointer block space-y-2">
                <FileText className="w-8 h-8 text-amber-700 mx-auto" />
                <div className="text-xs font-semibold text-stone-800">
                  {fileName ? `ឯកសារ: ${fileName}` : 'ចុចទីនេះដើម្បីជ្រើសរើសឯកសារ CSV'}
                </div>
                <div className="text-[11px] text-stone-400">
                  គាំទ្រ UTF-8 អក្សរខ្មែរ Unicode ពេញលេញ
                </div>
              </label>
            </div>
          </div>

          {/* Raw Text area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                ឬ បិទភ្ជាប់ទិន្នន័យ CSV ផ្ទាល់ (Paste CSV Text)
              </label>
              {csvText && (
                <button
                  onClick={() => processCsvContent(csvText)}
                  type="button"
                  className="text-xs text-[#4A0E17] font-semibold hover:underline cursor-pointer"
                >
                  ដំណើរការទិន្នន័យឡើងវិញ (Re-parse)
                </button>
              )}
            </div>
            <textarea
              rows={3}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                processCsvContent(e.target.value);
              }}
              placeholder={`ឈ្មោះ,គោរមងារ,លេខទូរសព្ទ,ចំណាំ\nសុក សុវណ្ណ,លោក,012345678,សាច់ញាតិ\nលី ធីតា,កញ្ញា,098765432,មិត្ត`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-mono focus:outline-none focus:border-[#4A0E17]"
            />
          </div>

          {/* Errors Section (if any) */}
          {rowErrors.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>រកឃើញកំហុសទិន្នន័យ {rowErrors.length} ជួរ (Rows with errors skipped):</span>
              </div>
              <ul className="text-xs text-rose-700 space-y-1 list-disc list-inside">
                {rowErrors.map((err, idx) => (
                  <li key={idx}>
                    ជួរទី {err.row}: <span className="font-semibold">{err.error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* PREVIEW TABLE */}
          {hasParsed && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>តារាង Preview ភ្ញៀវត្រឹមត្រូវ ({parsedRows.length} នាក់)</span>
                </h4>
              </div>

              {parsedRows.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl border border-stone-200">
                  មិនទាន់មានទិន្នន័យត្រឹមត្រូវសម្រាប់បញ្ចូលទេ។ សូមពិនិត្យមើលទ្រង់ទ្រាយ CSV របស់អ្នក។
                </div>
              ) : (
                <div className="border border-stone-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs font-kantumruy">
                    <thead className="bg-[#FAF7F0] text-stone-700 font-semibold sticky top-0 border-b border-stone-200">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">គោរមងារ</th>
                        <th className="p-2.5">ឈ្មោះភ្ញៀវ</th>
                        <th className="p-2.5">ទូរសព្ទ</th>
                        <th className="p-2.5">ចំណាំ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {parsedRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/40">
                          <td className="p-2.5 text-stone-400 font-mono">{idx + 1}</td>
                          <td className="p-2.5 font-medium text-amber-900">{row.honorificKm}</td>
                          <td className="p-2.5 font-bold text-stone-900">{row.nameKm}</td>
                          <td className="p-2.5 text-stone-600 font-mono">{row.phoneNumber || '-'}</td>
                          <td className="p-2.5 text-stone-500 truncate max-w-[150px]">{row.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            {parsedRows.length > 0 ? `ត្រៀមបញ្ចូលភ្ញៀវ ${parsedRows.length} នាក់` : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200 text-xs font-medium cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={parsedRows.length === 0}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-[#4A0E17] hover:bg-[#32060f] disabled:opacity-50 text-white text-xs font-semibold shadow transition-all cursor-pointer"
            >
              បញ្ចូលក្នុងបញ្ជី ({parsedRows.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
