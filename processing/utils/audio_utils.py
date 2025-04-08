import numpy as np
import wave

from sklearn.cluster import KMeans


## Audio I/O

def get_samples_and_rate(wav_filename):
  with wave.open(wav_filename, mode="rb") as wav_in:
    if wav_in.getsampwidth() != 2:
      raise Exception("Input not 16-bit")

    nchannels = wav_in.getnchannels()
    nframes = wav_in.getnframes()
    nsamples = nchannels * nframes
    xb = wav_in.readframes(nframes)
    b_np = np.frombuffer(xb, dtype=np.int16) / nchannels
    samples = [int(sum(b_np[b0 : b0 + nchannels])) for b0 in range(0, nsamples, nchannels)]

    return samples, wav_in.getframerate()

def wav_to_list(wav_filename):
  s, _ = get_samples_and_rate(wav_filename)
  return s

def list_to_wav(wav_array, wav_filename):
  lim = 2**15 - 1
  wav_array = [max(min(i, lim), -lim) for i in wav_array]
  xb = np.array(wav_array, dtype=np.int16).tobytes()
  with wave.open(wav_filename, "w") as wav_out:
    wav_out.setnchannels(1)
    wav_out.setsampwidth(2)
    wav_out.setframerate(44100)
    wav_out.writeframes(xb)


# Audio Analysis Functions

def logFilter(x, factor=3):
  if factor < 1:
    return x
  else:
    return np.exp(factor * np.log(x)) // np.power(10, factor*5)

def fft(samples, filter_factor=3):
  _fft = logFilter(np.abs(np.fft.fft(samples * np.hanning(len(samples))))[ :len(samples) // 2], filter_factor).tolist()
  num_samples = len(_fft)
  hps = (44100//2) / num_samples
  _freqs = [s * hps for s in range(num_samples)]
  return _fft, _freqs

def stft(samples, window_len=1024):
  _times = list(range(0, len(samples), window_len))

  sample_windows = []
  for s in _times:
    sample_windows.append(samples[s : s + window_len])

  sample_windows[-1] = (sample_windows[-1] + len(sample_windows[0]) * [0])[:len(sample_windows[0])]
  _ffts = [np.log(fft(s, filter_factor=0)[0]).tolist() for s in sample_windows]
  _, _freqs = fft(sample_windows[0], filter_factor=0)
  return _ffts, _freqs, _times

def cluster_fft_freqs(freqs, energy_freqs, *, top=50, clusters=6):
  energy_freqs = [(round(f), e) for f,e in zip(freqs, energy_freqs)]

  fft_sorted = sorted(energy_freqs, key=lambda x: x[1], reverse=True)[:top]
  top_freqs = [[f[0]] for f in fft_sorted]

  kmeans = KMeans(n_clusters=clusters, n_init="auto").fit(top_freqs)
  return np.sort(kmeans.cluster_centers_, axis=0)[:, 0].astype(np.int16).tolist()

def ifft(fs):
  return np.fft.fftshift(np.fft.irfft(fs)).tolist()

def tone(freq, length_seconds, amp=4096, sr=44100):
  length_samples = length_seconds * sr
  t = range(0, length_samples)
  ham = np.hamming(length_samples)
  two_pi = 2.0 * np.pi
  return np.array([amp * np.sin(two_pi * freq * x / sr) for x in t] * ham).astype(np.int16).tolist()

def tone_slide(freq0, freq1, length_seconds, amp=4096, sr=44100):
  length_samples = length_seconds * sr
  t = range(0, length_samples)
  ham = np.hamming(length_samples)
  two_pi = 2.0 * np.pi
  f0 = min(freq0, freq1)
  f_diff = max(freq0, freq1) - f0
  return np.array([amp * np.sin(two_pi * (f0 + x / length_samples * f_diff) * x / sr) for x in t] * ham).astype(np.int16).tolist()
