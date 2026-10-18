"use strict";

// Procedural sound effects and a quiet generative music loop (Web Audio, no audio files).
const Sfx = (() => {
  let ac = null, master = null, sfxBus = null, musicBus = null, noiseBuf = null;
  let muted = false, mood = 0, step = 0, nextT = 0, timer = null;
  const vol = { music: 0.6, sfx: 0.9 };
  try { muted = localStorage.getItem("afterglow.muted") === "1"; } catch (e) { /* storage unavailable */ }

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const SCALES = [[0, 3, 5, 7, 10], [0, 2, 4, 7, 9], [0, 3, 5, 7, 10], [0, 2, 5, 7, 9], [0, 2, 4, 7, 9]];
  const ROOTS = [45, 43, 41, 38, 48];
  const CHORDS = [0, 5, 3, 7];
  const KIND_NOTE = { shade: 67, glow: 72, phase: 70, flip: 65, tide: 62, spring: 69, gust: 74 };

  function ensure() {
    if (ac) return true;
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain();
      master.gain.value = muted ? 0 : 0.7;
      master.connect(ac.destination);
      sfxBus = ac.createGain();
      sfxBus.gain.value = vol.sfx;
      sfxBus.connect(master);
      const lp = ac.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1500;
      musicBus = ac.createGain();
      musicBus.gain.value = vol.music;
      musicBus.connect(lp);
      lp.connect(master);
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return true;
    } catch (e) {
      ac = null;
      return false;
    }
  }

  function tone(f, dur, type, vol, slide, delay, bus) {
    if (!ac) return;
    const t = ac.currentTime + (delay || 0);
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(bus || sfxBus);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function noise(dur, vol, freq, delay) {
    if (!ac) return;
    const t = ac.currentTime + (delay || 0);
    const s = ac.createBufferSource();
    s.buffer = noiseBuf;
    const f = ac.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = freq;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f);
    f.connect(g);
    g.connect(sfxBus);
    s.start(t);
    s.stop(t + dur + 0.05);
  }

  const S = {
    jump() { tone(280, 0.15, "square", 0.05, 2.1); },
    land() { noise(0.08, 0.1, 600); },
    recStart() { tone(440, 0.09, "triangle", 0.12); tone(660, 0.14, "triangle", 0.12, 1, 0.08); },
    recStop(kind) {
      const b = KIND_NOTE[kind] || 67;
      [0, 4, 7, 12].forEach((n, i) => tone(mtof(b + n), 0.35, "sine", 0.09, 1, i * 0.07));
    },
    cancel() { tone(300, 0.15, "triangle", 0.1, 0.5); },
    plateOn() { tone(220, 0.07, "square", 0.06); tone(330, 0.1, "square", 0.05, 1, 0.05); },
    plateOff() { tone(260, 0.08, "square", 0.05, 0.6); },
    door() { noise(0.4, 0.1, 260); tone(90, 0.35, "sawtooth", 0.05, 0.6); },
    swap() { tone(500, 0.2, "sine", 0.12, 2.2); tone(1000, 0.2, "sine", 0.08, 0.45, 0.05); },
    flip() { tone(240, 0.28, "sine", 0.09, 2); },
    wither() { tone(1200, 0.2, "sine", 0.03, 0.7); },
    die() { noise(0.35, 0.18, 1000); tone(320, 0.45, "sawtooth", 0.08, 0.3); },
    win() { [0, 4, 7, 12, 16].forEach((n, i) => tone(mtof(72 + n), 0.5, "triangle", 0.1, 1, i * 0.1)); },
    nope() { tone(130, 0.14, "square", 0.07); },
    ui() { tone(700, 0.05, "square", 0.04); },
    ok() { tone(880, 0.09, "square", 0.05); tone(1320, 0.1, "square", 0.04, 1, 0.06); },
    card() { [0, 7, 12].forEach((n, i) => tone(mtof(57 + n), 1.2, "sine", 0.07, 1, i * 0.18)); },
    spring() { tone(200, 0.26, "sine", 0.13, 3.4); tone(420, 0.2, "triangle", 0.06, 2, 0.05); },
    lantern() { [0, 7, 12, 19].forEach((n, i) => tone(mtof(76 + n), 0.55, "sine", 0.07, 1, i * 0.06)); },
  };

  function scheduleStep(t, n) {
    const root = ROOTS[mood] + CHORDS[Math.floor(n / 8) % CHORDS.length];
    const scale = SCALES[mood];
    if (n % 8 === 0) {
      [0, 7, 12].forEach((o) => tone(mtof(root + o), 4.6, "sine", 0.05, 1, t - ac.currentTime, musicBus));
      tone(mtof(root - 12), 2.4, "triangle", 0.06, 1, t - ac.currentTime, musicBus);
    }
    if (Math.random() < 0.42) {
      const note = root + 12 + scale[Math.floor(Math.random() * scale.length)] + (Math.random() < 0.3 ? 12 : 0);
      tone(mtof(note), 0.9, "triangle", 0.045, 1, t - ac.currentTime, musicBus);
    }
  }

  function musicLoop() {
    if (!ac || ac.state !== "running") return;
    while (nextT < ac.currentTime + 0.4) {
      if (nextT < ac.currentTime) nextT = ac.currentTime + 0.05;
      scheduleStep(nextT, step++);
      nextT += 0.6;
    }
  }

  return {
    // Call from a user gesture; safe to call repeatedly.
    resume() {
      if (!ensure()) return;
      if (ac.state === "suspended") ac.resume();
      if (!timer) {
        nextT = ac.currentTime + 0.1;
        timer = setInterval(musicLoop, 150);
      }
    },
    play(name, arg) {
      if (muted || !ac || ac.state !== "running") return;
      if (S[name]) S[name](arg);
    },
    setMood(i) { mood = Math.max(0, Math.min(SCALES.length - 1, i)); },
    // Music and effects volume, each 0 to 1.
    setVolumes(music, sfx) {
      vol.music = music;
      vol.sfx = sfx;
      if (musicBus) musicBus.gain.value = music;
      if (sfxBus) sfxBus.gain.value = sfx;
    },
    toggleMute() {
      muted = !muted;
      if (master) master.gain.value = muted ? 0 : 0.7;
      try { localStorage.setItem("afterglow.muted", muted ? "1" : "0"); } catch (e) { /* ignore */ }
      return muted;
    },
    isMuted() { return muted; },
    setMuted(v) {
      muted = !!v;
      if (master) master.gain.value = muted ? 0 : 0.7;
    },
  };
})();
