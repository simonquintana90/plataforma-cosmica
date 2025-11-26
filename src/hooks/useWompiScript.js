import { useEffect } from 'react';

const useWompiScript = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://checkout.wompi.co/widget.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);
};

export default useWompiScript;
