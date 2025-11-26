import React from 'react';

export const StatusBadge = ({ status }) => {
    const baseClasses = "text-xs font-bold px-2.5 py-1 rounded-full";
    if (status === 'completed' || status === 'approved') {
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completado</span>;
    }
    return <span className={`${baseClasses} bg-amber-100 text-amber-800`}>Pendiente</span>;
};

export const UserStatusBadge = ({ status }) => {
    const baseClasses = "text-xs font-bold px-2.5 py-1 rounded-full";
    if (status === 'approved') {
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Aprobado</span>;
    }
    return <span className={`${baseClasses} bg-amber-100 text-amber-800`}>Pendiente de Aprobación</span>;
};
