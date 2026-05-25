import { useState, useEffect, useRef, useCallback } from 'react';

interface TypewriterEffectProps {
    texts: string[];
    speed?: number;
    className?: string;
    lineClassNames?: string[];
    delay?: number;
    waitTime?: number;
    loop?: boolean;
}

export const TypewriterEffect = ({
    texts,
    speed = 40,
    className = "",
    lineClassNames,
    delay = 0,
    waitTime = 3000,
    loop = true
}: TypewriterEffectProps) => {
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const stateRef = useRef({
        charIndex: 0,
        textIndex: 0,
        isDeleting: false,
        started: false,
    });

    const tick = useCallback(() => {
        const s = stateRef.current;
        const currentText = texts[s.textIndex];

        if (!s.isDeleting) {
            // Typing forward
            s.charIndex++;
            setDisplayText(currentText.substring(0, s.charIndex));
            setIsTyping(true);

            if (s.charIndex >= currentText.length) {
                // Finished typing this text
                setIsTyping(false);
                if (!loop && s.textIndex >= texts.length - 1) return; // done
                timerRef.current = setTimeout(() => {
                    s.isDeleting = true;
                    tick();
                }, waitTime);
                return;
            }
        } else {
            // Deleting
            s.charIndex--;
            setDisplayText(currentText.substring(0, s.charIndex));
            setIsTyping(true);

            if (s.charIndex <= 0) {
                // Finished deleting, move to next text
                setIsTyping(false);
                s.isDeleting = false;
                s.textIndex = (s.textIndex + 1) % texts.length;
                timerRef.current = setTimeout(tick, 400);
                return;
            }
        }

        const nextDelay = s.isDeleting ? speed * 0.5 : speed;
        timerRef.current = setTimeout(tick, nextDelay);
    }, [texts, speed, waitTime, loop]);

    useEffect(() => {
        const startDelay = delay * 1000;
        timerRef.current = setTimeout(() => {
            stateRef.current.started = true;
            tick();
        }, startDelay);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [delay, tick]);

    const showCursor = loop || displayText.length < texts[texts.length - 1].length;

    return (
        <span className={`inline-block ${className}`}>
            {lineClassNames ? (
                displayText.split('\n').map((line, i) => (
                    <span key={i} className={lineClassNames[i] ?? ''}>
                        {i > 0 && '\n'}
                        {line}
                    </span>
                ))
            ) : (
                <span>{displayText}</span>
            )}
            {showCursor && (
                <span
                    className={`inline-block w-[3px] h-[0.8em] bg-humg-blue dark:bg-blue-500 ml-1 align-baseline ${isTyping ? 'opacity-100' : 'animate-[blink-cursor_0.8s_step-end_infinite]'}`}
                />
            )}
        </span>
    );
};
