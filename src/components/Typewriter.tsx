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

        // 텍스트가 바로 보이지 않도록 약간의 지연 후 시작? 아니면 바로 시작.
        // requestAnimationFrame을 사용하면 더 부드러울 수 있으나, interval로도 충분함.
        const interval = setInterval(() => {
            setDisplayedText((prev) => {
                if (index < text.length) {
                    return prev + text.charAt(index);
                }
                return prev;
            });
            index++;

            if (index >= text.length) {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return <span style={{ whiteSpace: 'pre-wrap' }}>{displayedText}</span>;
}
