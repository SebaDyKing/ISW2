function IconExternal() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

/**
 * Vista previa del PDF de una licencia médica.
 * Muestra el documento embebido (iframe) y ofrece abrir en pestaña / descargar.
 *
 * Para que el iframe lo renderice inline, el backend debe responder con
 * Content-Type: application/pdf (y, si querés que "Descargar" fuerce la bajada,
 * Content-Disposition: attachment vía res.download).
 */
export default function PdfPreviewModal({ isOpen, onClose, pdfUrl, titulo }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 grid place-items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-slate-200">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 truncate">
              {titulo || "Vista previa del PDF"}
            </h2>
            <p className="text-xs text-slate-500">Revisá el documento antes de decidir</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <IconExternal /> Abrir
            </a>
            <a
              href={pdfUrl}
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-slate-900 rounded-lg hover:bg-slate-800"
            >
              <IconDownload /> Descargar
            </a>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 text-2xl leading-none px-1"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>

        <iframe
          src={pdfUrl}
          title={titulo || "PDF de la licencia médica"}
          className="flex-1 w-full bg-slate-100"
        />
      </div>
    </div>
  )
}
