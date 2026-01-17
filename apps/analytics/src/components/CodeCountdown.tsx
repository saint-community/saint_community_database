import React, { useState, useEffect } from 'react';

const CodeCountdown: React.FC<{ expiresAt: number; onExpire?: () => void }> = ({
    expiresAt,
    onExpire,
}) => {
    const [timeLeft, setTimeLeft] = useState<number>(expiresAt - Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            const remaining = expiresAt - Date.now();
            if (remaining <= 0) {
                clearInterval(timer);
                setTimeLeft(0);
                if (onExpire) onExpire();
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [expiresAt, onExpire]);

    if (timeLeft <= 0)
        return <span className='text-red-500 font-black'>EXPIRED</span>;

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return (
        <span className='font-mono font-black text-xs text-[#CCA856]'>
            {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:
            {seconds.toString().padStart(2, '0')}
        </span>
    );
};

export default CodeCountdown;
