import { useState, useEffect } from 'react';

interface TypewriterProps {
    text: string;
    speed?: number;
    onComplete?: () => void;
}

export default function Typewriter({ text, speed = 50, onComplete }: TypewriterProps) {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        setDisplayedText('');
        let index = 0;

        const interval = setInterval(() => {
            if (index >= text.length) {
                clearInterval(interval);
                if (onComplete) onComplete();
                return;
            }

            const charToAdd = text.charAt(index);
            setDisplayedText((prev) => prev + charToAdd);
            index++;
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return <span style={{ whiteSpace: 'pre-wrap' }}>{displayedText}</span>;
}
