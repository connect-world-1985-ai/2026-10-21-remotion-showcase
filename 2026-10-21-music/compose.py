"""Synthesize the soundtrack for the showcase with numpy only.
120 BPM (one beat = 15 video frames at 30 fps), A minor, 100 s.
Sections are aligned to the video's scene boundaries (seconds):
0 intro | 12 springs | 26 paths | 39 data | 56 particles | 69 3D drop | 85 finale | 100 end
"""
import numpy as np, wave, subprocess, os
SR = 44100
DUR = 100.0
BPM = 120
BEAT = 60 / BPM
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)

def midi(m): return 440 * 2 ** ((m - 69) / 12)
def env_adsr(n, a=0.01, d=0.1, s=0.7, r=0.2):
    t = np.arange(n) / SR; tot = n / SR
    e = np.ones(n) * s
    e[t < a] = t[t < a] / a
    m = (t >= a) & (t < a + d); e[m] = 1 - (1 - s) * (t[m] - a) / d
    rel = t > tot - r; e[rel] *= np.clip((tot - t[rel]) / r, 0, 1)
    return e
def saw(f, n, harm=12, detune=0.0):
    t = np.arange(n) / SR; y = np.zeros(n)
    for k in range(1, harm + 1):
        if f * k > SR / 2.2: break
        y += np.sin(2 * np.pi * f * k * t * (1 + detune)) / k
    return y
def add(sig, start, pan=0.0, gain=1.0):
    i = int(start * SR); j = min(N, i + len(sig))
    if i >= N: return
    s = sig[: j - i] * gain
    L[i:j] += s * np.cos((pan + 1) * np.pi / 4); R[i:j] += s * np.sin((pan + 1) * np.pi / 4)
def lp(x, k):  # crude moving-average lowpass
    if k <= 1: return x
    return np.convolve(x, np.ones(k) / k, mode="same")

# drums
def kick():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7) * 1.0
def snare():
    n = int(0.3 * SR); t = np.arange(n) / SR
    noise = rng.standard_normal(n); noise = noise - lp(noise, 6)
    return (noise * 0.5 * np.exp(-t * 18) + np.sin(2 * np.pi * 190 * t) * 0.4 * np.exp(-t * 25))
def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n); x = x - lp(x, 3)
    return x * np.exp(-t * (12 if open_ else 70)) * 0.25

# chords: Am - F - C - G  (i - VI - III - VII), one per bar (2 s)
prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
bass_roots = [45, 41, 48, 43]
sections = [(0, 12, "intro"), (12, 26, "springs"), (26, 39, "paths"), (39, 56, "data"),
            (56, 69, "break"), (69, 85, "drop"), (85, 100, "finale")]
def sec_at(t):
    for a, b, n in sections:
        if a <= t < b: return n
    return "finale"

bar = 4 * BEAT
nbars = int(DUR / bar)
for b in range(nbars):
    t0 = b * bar; s = sec_at(t0 + 0.01); ch = prog[b % 4]
    # pad (always, louder in intro/break)
    pg = {"intro": 0.10, "break": 0.11, "finale": 0.09}.get(s, 0.06)
    if t0 >= 96: pg *= 0.6
    n = int(bar * SR * 1.05)
    for m in ch + [ch[0] + 12]:
        y = lp(saw(midi(m), n, 8, 0.003) + saw(midi(m), n, 8, -0.003), 8)
        add(y * env_adsr(n, 0.6, 0.3, 0.8, 0.6), t0, pan=rng.uniform(-0.5, 0.5), gain=pg)
    # bass
    if s in ("data", "drop", "finale", "paths"):
        for k in range(8):
            if s == "paths" and k % 2: continue
            n = int(BEAT / 2 * SR * 0.9)
            y = lp(saw(midi(bass_roots[b % 4]), n, 10), 4)
            add(y * env_adsr(n, 0.005, 0.08, 0.6, 0.05), t0 + k * BEAT / 2, gain=0.22)
    # arpeggio
    if s in ("paths", "data", "break", "drop", "finale"):
        pat = [0, 1, 2, 3, 2, 1, 0, 2] * 2
        notes = ch + [ch[0] + 12]
        for k, p in enumerate(pat):
            n = int(BEAT / 4 * SR)
            m = notes[p] + 12
            y = saw(midi(m), n, 6) * 0.5 + np.sin(2 * np.pi * midi(m) * np.arange(n) / SR)
            add(y * env_adsr(n, 0.003, 0.05, 0.3, 0.05), t0 + k * BEAT / 4,
                pan=0.4 * np.sin(k), gain=0.07 if s != "break" else 0.09)
    # drums
    if s in ("springs", "paths", "data", "drop", "finale") and t0 < 98:
        for k in range(4):
            add(kick(), t0 + k * BEAT, gain=0.8)
            if k in (1, 3) and s != "springs": add(snare(), t0 + k * BEAT, gain=0.45)
        for k in range(8):
            add(hat(open_=(k % 2 == 1 and s == "drop")), t0 + k * BEAT / 2, pan=0.3, gain=0.9)
    if s == "break" and t0 >= 64:  # snare roll build into the drop
        for k in range(16):
            add(snare(), t0 + k * BEAT / 4, gain=0.1 + 0.25 * k / 16)

# riser before each section boundary + impact
for a, _, _ in sections[1:]:
    n = int(2 * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n); x = lp(x, 3) - lp(x, 30)
    add(x * (t / 2) ** 2 * 0.15, a - 2)
    imp = np.sin(2 * np.pi * 40 * t) * np.exp(-t * 3) * 0.5
    add(imp, a, gain=0.6)
# intro lead melody (bell)
mel = [76, 74, 72, 71, 72, 74, 76, 79]
for k, m in enumerate(mel):
    n = int(1.4 * SR); t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * midi(m) * t) + 0.3 * np.sin(2 * np.pi * midi(m) * 3.01 * t)) * np.exp(-t * 2.5)
    add(y, 2 + k * BEAT * 1.5, pan=0.2 * (-1) ** k, gain=0.12)
# finale melody
for k, m in enumerate(mel[::-1] + [81]):
    n = int(1.4 * SR); t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * midi(m) * t) + 0.3 * np.sin(2 * np.pi * midi(m) * 3.01 * t)) * np.exp(-t * 2.5)
    add(y, 86 + k * BEAT * 1.5, pan=0.2 * (-1) ** k, gain=0.12)

# reverb: FFT convolution with decaying noise
irn = int(2.2 * SR); t = np.arange(irn) / SR
for ch_i, X in enumerate((L, R)):
    ir = rng.standard_normal(irn) * np.exp(-t * 2.8); ir[0] = 0
    nfft = 1 << int(np.ceil(np.log2(N + irn)))
    wet = np.fft.irfft(np.fft.rfft(X, nfft) * np.fft.rfft(ir, nfft), nfft)[:N]
    wet /= np.max(np.abs(wet)) + 1e-9
    X += wet * 0.18 * np.max(np.abs(X))
# fade out & normalize
fade = int(3 * SR)
for X in (L, R): X[-fade:] *= np.linspace(1, 0, fade) ** 2
st = np.stack([L, R], 1)
st = np.tanh(st / np.max(np.abs(st)) * 1.4) * 0.89
out = os.path.join(os.path.dirname(__file__), "soundtrack.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
pub = os.path.join(os.path.dirname(__file__), "..", "public", "soundtrack.mp3")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", out, "-b:a", "192k", pub], check=True)
print("wrote", out, pub)
