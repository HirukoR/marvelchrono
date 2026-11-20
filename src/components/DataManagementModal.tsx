import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

interface DataManagementModalProps {
  isOpen: boolean;
  exportedJson: string;
  watchedCount: number;
  onClose: () => void;
  onImportJson: (rawJson: string) => boolean;
  onResetAll: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  exportedJson,
  watchedCount,
  onClose,
  onImportJson,
  onResetAll,
}) => {
  const [importInput, setImportInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [confirmingReset, setConfirmingReset] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportedJson);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleDownloadFile = () => {
    const blob = new Blob([exportedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mcu-chronos-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importInput.trim()) {
      setImportStatus('error');
      return;
    }
    const ok = onImportJson(importInput);
    if (ok) {
      setImportStatus('success');
      setImportInput('');
    } else {
      setImportStatus('error');
    }
  };

  const handleConfirmReset = () => {
    onResetAll();
    setConfirmingReset(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Управление данными прогресса"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-white/15 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Экспорт, импорт и сброс хронологии
            </h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              Прогресс автоматически сохраняется в браузере (localStorage).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно управления данными"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Export section */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-zinc-300">
                ЭКСПОРТ ПРОГРЕССА (JSON)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Копировать JSON</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Скачать .json</span>
                </button>
              </div>
            </div>
            <textarea
              readOnly
              rows={3}
              value={exportedJson}
              aria-label="JSON-код текущего прогресса"
              className="w-full rounded-xl border border-white/10 bg-zinc-900/90 p-3 font-mono text-xs text-zinc-300 focus:outline-none"
            />
          </div>

          {/* Import section */}
          <form onSubmit={handleImportSubmit} className="border-t border-white/10 pt-4">
            <label
              htmlFor="import-json-textarea"
              className="mb-2 block font-mono text-xs font-semibold text-zinc-300"
            >
              ИМПОРТ ПРОГРЕССА
            </label>
            <textarea
              id="import-json-textarea"
              rows={3}
              value={importInput}
              onChange={(e) => {
                setImportInput(e.target.value);
                setImportStatus('idle');
              }}
              placeholder='Вставьте JSON-код, например: {"watchedIds": [1, 2, 3]}'
              className="w-full rounded-xl border border-white/10 bg-zinc-900/90 p-3 font-mono text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none"
            />
            <div className="mt-2.5 flex items-center justify-between gap-3">
              <div className="text-xs">
                {importStatus === 'success' && (
                  <span className="text-emerald-400 font-medium">
                    Прогресс успешно импортирован и сохранён!
                  </span>
                )}
                {importStatus === 'error' && (
                  <span className="text-rose-400 font-medium">
                    Ошибка формата JSON. Проверьте корректность данных.
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Загрузить прогресс</span>
              </button>
            </div>
          </form>

          {/* Reset with Confirmation */}
          <div className="border-t border-white/10 pt-4">
            {!confirmingReset ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-zinc-200">
                    Сброс всего прогресса
                  </div>
                  <div className="text-xs text-zinc-400">
                    Отмечено глав: {watchedCount} из 26
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmingReset(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Сбросить прогресс</span>
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3.5">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-rose-200">
                      Подтвердите полный сброс хронологии
                    </div>
                    <p className="mt-1 text-xs text-rose-300/80">
                      Все отметки о просмотре и личные заметки будут обнулены.
                      Это действие нельзя отменить.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleConfirmReset}
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 transition-colors cursor-pointer"
                      >
                        Да, очистить всё
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingReset(false)}
                        className="rounded-lg border border-white/15 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
