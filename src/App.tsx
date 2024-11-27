import { useEffect, useRef, useState } from 'react';

function App() {
    const [standDuration, setStandDuration] = useState<number>(10);
    const [sitDuration, setSitDuration] = useState<number>(10);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [currentAction, setCurrentAction] = useState<'stand' | 'sit'>(
        'stand'
    );
    const [timeLeft, setTimeLeft] = useState<number>(standDuration * 60);
    const timerRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isRunning) {
            notifyUser(currentAction);
            playSound();

            const duration =
                currentAction === 'stand' ? standDuration : sitDuration;
            setTimeLeft(duration * 60); // Set timeLeft to the duration in seconds

            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
            }
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
            }

            // Timer to switch action after duration
            timerRef.current = window.setTimeout(() => {
                setCurrentAction((prev) =>
                    prev === 'stand' ? 'sit' : 'stand'
                );
            }, duration * 60 * 1000);

            // Interval to update countdown every second
            intervalRef.current = window.setInterval(() => {
                setTimeLeft((prev) => {
                    const newTimeLeft = prev - 1;
                    updateDocumentTitle(newTimeLeft, currentAction);
                    return newTimeLeft;
                });
            }, 1000);

            // Set initial title
            updateDocumentTitle(duration * 60, currentAction);
        }

        return () => {
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
            }
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
            }
            // Reset document title when timer stops
            document.title = 'Stand Up Reminder';
        };
    }, [isRunning, currentAction, standDuration, sitDuration]);

    const notifyUser = (action: 'stand' | 'sit') => {
        const message =
            action === 'stand' ? 'Time to Stand Up!' : 'Time to Sit Down!';
        if (Notification.permission === 'granted') {
            new Notification(message);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    new Notification(message);
                }
            });
        }
    };

    const playSound = () => {
        const audio = new Audio('/alert.mp3');
        audio.play();
    };

    const handleStart = () => {
        if (!isRunning) {
            setIsRunning(true);
            const duration =
                currentAction === 'stand' ? standDuration : sitDuration;
            setTimeLeft(duration * 60);
            // Start the countdown immediately
            intervalRef.current = window.setInterval(() => {
                setTimeLeft((prev) => {
                    const newTimeLeft = prev - 1;
                    updateDocumentTitle(newTimeLeft, currentAction);
                    return newTimeLeft;
                });
            }, 1000);
            // Set initial title
            updateDocumentTitle(duration * 60, currentAction);
        }
    };

    const handleStop = () => {
        if (isRunning) {
            setIsRunning(false);
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
            }
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
            }
            // Reset document title
            document.title = 'Stand Up Reminder';
        }
    };

    // Format timeLeft into minutes and seconds
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Update the document title with the countdown
    const updateDocumentTitle = (time: number, action: 'stand' | 'sit') => {
        const formattedTime = formatTime(time);
        document.title = `${formattedTime} - Time to ${
            action === 'stand' ? 'Stand Up' : 'Sit Down'
        }`;
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Stand Up Reminder</h1>
            <div>
                <label>
                    Stand Duration (minutes):
                    <input
                        type='number'
                        min='1'
                        value={standDuration}
                        onChange={(e) =>
                            setStandDuration(Number(e.target.value))
                        }
                        disabled={isRunning}
                    />
                </label>
            </div>
            <div>
                <label>
                    Sit Duration (minutes):
                    <input
                        type='number'
                        min='1'
                        value={sitDuration}
                        onChange={(e) => setSitDuration(Number(e.target.value))}
                        disabled={isRunning}
                    />
                </label>
            </div>
            <button onClick={handleStart} disabled={isRunning}>
                Start
            </button>
            <button onClick={handleStop} disabled={!isRunning}>
                Stop
            </button>
            {isRunning && (
                <div style={{ marginTop: '20px' }}>
                    <p>
                        It's time to{' '}
                        {currentAction === 'stand' ? 'Stand Up' : 'Sit Down'}!
                    </p>
                    <p>
                        Time left until next change:{' '}
                        <strong>{formatTime(timeLeft)}</strong>
                    </p>
                </div>
            )}
        </div>
    );
}

export default App;
