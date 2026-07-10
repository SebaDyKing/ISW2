import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { toast } from 'react-hot-toast';

export default function FirmaDocumentoModal({ isOpen, onClose, onFirmar }) {
  const sigCanvas = useRef({});
  const [isFirmando, setIsFirmando] = useState(false);

  if (!isOpen) return null;

  const handleClear = () => {
    sigCanvas.current.clear();
  };

  const handleFirmar = async () => {
    if (sigCanvas.current.isEmpty()) {
      toast.error('Por favor dibuje su firma antes de enviar');
      return;
    }
    
    setIsFirmando(true);
    const firmaBase64 = sigCanvas.current.getCanvas().toDataURL('image/png');
    
    try {
      await onFirmar(firmaBase64);
      handleClear();
      onClose();
    } catch (error) {
      // Error is handled in the parent component
    } finally {
      setIsFirmando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">Firma Electrónica</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 flex-1 flex flex-col items-center">
          <p className="text-sm text-slate-600 mb-4 text-center">
            Dibuje su firma en el recuadro inferior. Esta firma será almacenada como constancia de su conformidad con el documento.
          </p>
          
          <div className="w-full border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 overflow-hidden" style={{ height: '200px' }}>
            <SignatureCanvas 
              ref={sigCanvas}
              penColor="black"
              canvasProps={{ className: 'w-full h-full cursor-crosshair' }}
            />
          </div>
          
          <button 
            onClick={handleClear}
            className="mt-3 text-sm text-slate-500 hover:text-slate-700 underline"
          >
            Limpiar lienzo
          </button>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
            disabled={isFirmando}
          >
            Cancelar
          </button>
          <button
            onClick={handleFirmar}
            disabled={isFirmando}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isFirmando ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Firmando...
              </>
            ) : (
              'Guardar Firma'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
