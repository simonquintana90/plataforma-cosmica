import React, { useState } from 'react';

const BANKS = [
    "Bancolombia",
    "Nequi",
    "Daviplata",
    "Davivienda",
    "Banco de Bogotá",
    "BBVA",
    "Banco de Occidente",
    "Banco Popular",
    "Banco AV Villas",
    "Scotiabank Colpatria",
    "Banco Caja Social"
];

const WithdrawalModal = ({ isOpen, onClose, onSubmit, loading, amount }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        docType: 'CC',
        docNumber: '',
        bank: '',
        accountType: 'Ahorros',
        accountNumber: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900">Solicitar Retiro</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 bg-blue-50 border-b border-blue-100">
                    <p className="text-sm text-blue-800">
                        Estás solicitando un retiro de <span className="font-bold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)}</span>.
                        Por favor verifica que los datos sean correctos.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo del Titular</label>
                        <input
                            type="text"
                            name="fullName"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Como aparece en la cuenta bancaria"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Doc.</label>
                            <select
                                name="docType"
                                value={formData.docType}
                                onChange={handleChange}
                                className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="CC">CC</option>
                                <option value="CE">CE</option>
                                <option value="NIT">NIT</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Número de Documento</label>
                            <input
                                type="text"
                                name="docNumber"
                                required
                                value={formData.docNumber}
                                onChange={handleChange}
                                className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Banco</label>
                        <select
                            name="bank"
                            required
                            value={formData.bank}
                            onChange={handleChange}
                            className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="">Selecciona un banco</option>
                            {BANKS.map(bank => (
                                <option key={bank} value={bank}>{bank}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Cuenta</label>
                            <select
                                name="accountType"
                                value={formData.accountType}
                                onChange={handleChange}
                                className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="Ahorros">Ahorros</option>
                                <option value="Corriente">Corriente</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Número de Cuenta</label>
                            <input
                                type="text"
                                name="accountNumber"
                                required
                                value={formData.accountNumber}
                                onChange={handleChange}
                                className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Enviando...' : 'Confirmar Retiro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WithdrawalModal;
