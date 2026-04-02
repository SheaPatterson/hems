/**
 * TACTICAL AUDIO SERVICE
 * Handles mission-critical sound cues.
 */
export const playDispatchTones = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.type = 'square'; // Classic pager "beeper" sound
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
    };

    // Standard HEMS "Quick-Call II" style tone sequence
    const now = audioContext.currentTime;
    playTone(875, now, 0.5);
    playTone(1025, now + 0.6, 0.8);
};