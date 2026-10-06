"""Synthesize the soundtrack: an original bouncy nursery tune plus door/sparkle effects
timed to js/timeline.json. Writes audio/soundtrack.wav and audio/soundtrack.m4a.

    python3 tools/make_audio.py
"""
import json, subprocess, wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / "js" / "timeline.json").read_text())
SR = 44100
D = TL["sceneDuration"]
N = len(TL["scenes"])
DUR = N * D + TL["outroDuration"]
rng = np.random.default_rng(3)
out = np.zeros((int(DUR * SR) + SR, 2))


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= len(out):
        return
    sig = sig[: len(out) - i]
    out[i:i + len(sig), 0] += sig * gain * (1 - pan)
    out[i:i + len(sig), 1] += sig * gain * (1 + pan)


def env(n, a=0.005, decay=6.0):
    t = np.arange(n) / SR
    e = np.exp(-t * decay)
    k = int(a * SR)
    if k:
        e[:k] *= np.linspace(0, 1, k)
    return e


def xylo(f, dur=0.6):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 20) + 0.15 * np.sin(2 * np.pi * f * 2 * t)
    return s * env(n, 0.002, 7)


def pluck(f, dur=0.9):
    # Karplus-Strong: a ukulele-ish strum voice
    n = int(dur * SR); p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p); y = np.zeros(n)
    for i in range(n):
        y[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return y * env(n, 0.002, 2.5)


def bass(f, dur=0.4):
    n = int(dur * SR); t = np.arange(n) / SR
    s = 2 / np.pi * np.arcsin(np.sin(2 * np.pi * f * t))
    return s * env(n, 0.01, 5)


def noise_hit(dur, decay, lp=0.0):
    n = int(dur * SR); s = rng.uniform(-1, 1, n)
    if lp:
        for i in range(1, n):
            s[i] = s[i - 1] * lp + s[i] * (1 - lp)
    return s * env(n, 0.001, decay)


def sweep(f0, f1, dur, decay=3):
    n = int(dur * SR); t = np.arange(n) / SR
    f = np.geomspace(f0, f1, n)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.01, decay)


# ---- music: 120 bpm, I-V-vi-IV style loop in C major ----
BPM = 120; beat = 60 / BPM
chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]   # C G Am F
roots = [48, 43, 45, 41]
# an original eight-bar melody (scale degrees as MIDI), quarter/eighth rhythms
mel = [
    (72, 1), (76, 0.5), (79, 0.5), (79, 1), (76, 1),
    (74, 1), (71, 0.5), (74, 0.5), (79, 2),
    (72, 0.5), (74, 0.5), (76, 1), (81, 1), (79, 1),
    (77, 1), (76, 0.5), (74, 0.5), (72, 2),
]
music_end = N * D + 3.6
t = 0.0
bar = 0
while t < music_end:
    c = chords[bar % 4]
    for b in range(4):
        bt = t + b * beat
        if bt > music_end:
            break
        add(bass(midi(roots[bar % 4] - (0 if b % 2 == 0 else -7)), 0.45), bt, 0.32)
        if b in (1, 3):  # off-beat strum
            for k, n in enumerate(c):
                add(pluck(midi(n), 0.8), bt + k * 0.012, 0.16, pan=0.25)
        add(noise_hit(0.06, 60), bt + beat / 2, 0.035, pan=-0.3)   # shaker
        add(noise_hit(0.05, 70), bt, 0.025, pan=-0.3)
    t += 4 * beat
    bar += 1

# melody enters after the first door opens, loops through
t = 2 * 4 * beat
while t < music_end - 1:
    for n, l in mel:
        if t > music_end - 0.5:
            break
        add(xylo(midi(n), 0.7), t, 0.22, pan=-0.15)
        t += l * beat

# ---- effects ----
for i, sc in enumerate(TL["scenes"]):
    s0 = i * D
    door = sc["door"] is not None
    for k in range(6):   # tiny footsteps
        add(noise_hit(0.05, 80, lp=0.6), s0 + 0.25 + k * 0.2, 0.12, pan=0.3)
    if door:
        add(noise_hit(0.04, 120), s0 + 1.95, 0.25)                    # handle click
        add(sweep(200, 900, 0.6, 4) * 0.4 + noise_hit(0.6, 5, lp=0.85), s0 + 2.05, 0.25)  # whoosh
        rev = s0 + 2.2
    else:
        for k in range(8):
            add(sweep(300 + k * 60, 900 + k * 80, 0.12, 25), s0 + 0.6 + k * 0.13, 0.12)  # bubbles
        rev = s0 + 1.0
    for k, n in enumerate([84, 88, 91, 96]):                           # sparkle arpeggio
        add(xylo(midi(n), 0.5), rev + k * 0.06, 0.18, pan=0.2)
    add(xylo(midi(84), 0.9) + xylo(midi(91), 0.9), rev + 0.25, 0.14)    # label "ding"
    add(sweep(500, 1500, 0.35, 6), s0 + D - 0.3, 0.12)              # wipe swoosh

# outro: ta-da chord and a little "bye-bye" two-note call
o = N * D
for k, n in enumerate([60, 64, 67, 72, 76]):
    add(pluck(midi(n), 2.0), o + 0.1 + k * 0.03, 0.3)
    add(xylo(midi(n + 12), 1.5), o + 0.1 + k * 0.05, 0.12)
for k, (n, dt) in enumerate([(79, 0.6), (76, 0.9), (79, 1.6), (76, 1.9)]):
    add(xylo(midi(n), 0.8), o + dt + 0.5, 0.28)
add(xylo(midi(72), 2.0) + xylo(midi(84), 2.0), o + 3.3, 0.22)

out = out[: int(DUR * SR)]
fade = int(1.0 * SR)
out[-fade:] *= np.linspace(1, 0, fade)[:, None]
out /= np.max(np.abs(out)) / 0.89
pcm = (out * 32767).astype(np.int16)
(ROOT / "audio").mkdir(exist_ok=True)
wav = ROOT / "audio" / "soundtrack.wav"
with wave.open(str(wav), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-c:a", "aac", "-b:a", "160k", str(ROOT / "audio" / "soundtrack.m4a")], check=True)
wav.unlink()
print("wrote audio/soundtrack.m4a", round(DUR, 2), "s")
