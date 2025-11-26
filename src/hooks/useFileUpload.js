import { useState } from 'react';
import toast from 'react-hot-toast';

const useFileUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const uploadFile = async (file, userId) => {
        setUploading(true);
        setError(null);
        const functionUrl = 'https://us-central1-plataforma-cosmica.cloudfunctions.net/uploadFile';
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${functionUrl}?userId=${userId}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('La subida del archivo falló.');
            }

            const data = await response.json();
            setUploading(false);
            return data; // { fileURL, fileName }
        } catch (err) {
            console.error("Error uploading file:", err);
            setError(err.message);
            setUploading(false);
            toast.error("Error al subir el archivo.");
            throw err;
        }
    };

    return { uploadFile, uploading, error };
};

export default useFileUpload;
