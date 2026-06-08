/**
 * Emergency Alarm Sound using Web Audio API
 * Generates a realistic siren sound without needing external audio files.
 */

let audioContext: AudioContext | null = null;
let oscillator1: OscillatorNode | null = null;
let oscillator2: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let lfoNode: OscillatorNode | null = null;
let lfoGain: GainNode | null = null;
let isPlaying = false;
let sirenInterval: ReturnType<typeof setInterval> | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

export function playEmergencyAlarm(): void {
  if (isPlaying) return;

  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Main gain node (master volume)
    gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.35, ctx.currentTime);
    gainNode.connect(ctx.destination);

    // Primary siren oscillator
    oscillator1 = ctx.createOscillator();
    oscillator1.type = 'sawtooth';
    oscillator1.frequency.setValueAtTime(600, ctx.currentTime);
    
    // Secondary oscillator for richer sound
    oscillator2 = ctx.createOscillator();
    oscillator2.type = 'square';
    oscillator2.frequency.setValueAtTime(600, ctx.currentTime);

    // Sub gain for oscillator2 (lower volume)
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.15, ctx.currentTime);

    // LFO for pulsating effect
    lfoNode = ctx.createOscillator();
    lfoNode.type = 'sine';
    lfoNode.frequency.setValueAtTime(4, ctx.currentTime);

    lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.12, ctx.currentTime);

    lfoNode.connect(lfoGain);
    lfoGain.connect(gainNode.gain);

    oscillator1.connect(gainNode);
    oscillator2.connect(subGain);
    subGain.connect(gainNode);

    oscillator1.start();
    oscillator2.start();
    lfoNode.start();
    isPlaying = true;

    // Siren sweep effect — oscillates between high and low frequencies
    let goingUp = true;
    const sweepSiren = () => {
      if (!oscillator1 || !oscillator2 || !isPlaying) return;
      const now = getAudioContext().currentTime;
      
      if (goingUp) {
        oscillator1.frequency.linearRampToValueAtTime(1200, now + 0.6);
        oscillator2.frequency.linearRampToValueAtTime(1000, now + 0.6);
      } else {
        oscillator1.frequency.linearRampToValueAtTime(600, now + 0.6);
        oscillator2.frequency.linearRampToValueAtTime(500, now + 0.6);
      }
      goingUp = !goingUp;
    };

    sweepSiren();
    sirenInterval = setInterval(sweepSiren, 600);

  } catch (err) {
    console.error('Failed to play emergency alarm:', err);
  }
}

export function stopEmergencyAlarm(): void {
  if (!isPlaying) return;

  try {
    if (sirenInterval) {
      clearInterval(sirenInterval);
      sirenInterval = null;
    }

    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Fade out smoothly
    if (gainNode) {
      gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
    }

    setTimeout(() => {
      try {
        oscillator1?.stop();
        oscillator2?.stop();
        lfoNode?.stop();
      } catch {}
      oscillator1 = null;
      oscillator2 = null;
      lfoNode = null;
      lfoGain = null;
      gainNode = null;
    }, 200);

  } catch (err) {
    console.error('Failed to stop emergency alarm:', err);
  }

  isPlaying = false;
}

export function isAlarmPlaying(): boolean {
  return isPlaying;
}
