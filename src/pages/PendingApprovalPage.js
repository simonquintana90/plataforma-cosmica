import React from 'react';

const PendingApprovalPage = ({ auth }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <img src="https://assets-global.website-files.com/68026a0651df0f492c75ff17/680528ad858ac75ca9598b70_CO%CC%81SMICA_Logo_N.avif" alt="Logo Cósmica" className="h-6 w-auto" />
                    <button onClick={() => auth.signOut()} className="text-sm font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">Cerrar Sesión</button>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center text-center p-4">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-slate-900">Cuenta Pendiente de Aprobación</h1>
                    <p className="mt-2 max-w-md mx-auto text-slate-500">Gracias por registrarte. Te notificaremos por correo cuando tu cuenta sea activada.</p>
                </div>
            </main>
        </div>
    );
};

export default PendingApprovalPage;
