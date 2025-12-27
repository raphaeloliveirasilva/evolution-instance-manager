// src/components/modals/ConnectModal.jsx
import { X } from 'lucide-react';

export default function ConnectModal({
    isOpen,
    onClose,
    qrCode,
    isQrLoading,
    instanceName
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-slate-800">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in duration-200 relative">

                {/* Botão de fechar opcional no topo */}
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <h3 className="text-2xl font-bold mb-2">Conectar WhatsApp</h3>
                <p className="text-slate-500 text-sm mb-8">Instância: <span className="font-bold text-indigo-600">{instanceName}</span></p>

                <div className="bg-slate-50 p-6 rounded-[2rem] flex items-center justify-center min-h-[250px] border-4 border-dashed border-slate-100">
                    {isQrLoading ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                            <p className="text-xs text-slate-400 font-medium">Gerando QR Code...</p>
                        </div>
                    ) : (
                        <div className="relative group">
                            <img
                                src={qrCode}
                                alt="QR Code para conexão"
                                className="max-w-full rounded-xl shadow-sm transition-transform group-hover:scale-105"
                            />
                        </div>
                    )}
                </div>

                <div className="mt-8 space-y-4">


                    <button
                        onClick={onClose}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                        Concluir
                    </button>
                </div>
            </div>
        </div>
    );
}