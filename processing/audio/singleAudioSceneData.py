import pandas as pd
import json
from os import listdir
import numpy as np

# sound libs
import librosa
import pyAudioAnalysis as pya
from pyAudioAnalysis import audioTrainTest
from pyAudioAnalysis import audioBasicIO
from pyAudioAnalysis import ShortTermFeatures
from pyAudioAnalysis import MidTermFeatures
import matplotlib.pyplot as plt
note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

short_features_selected = ['spectral_centroid', 'spectral_spread', 'zcr']
for start in ['chroma', 'mfcc']:
    for i in range(13):
        short_features_selected.append(start+"_"+str(i))

class AudioScene():
    def __init__(self, filepath):
        self.filepath = filepath

        # Fs - sample rate, x - audio signal as nparray
        [self.Fs, self.x] = audioBasicIO.read_audio_file(filepath)

        # convert stereo to mono
        if self.x.shape[1] == 2:
            # print("converting stereo to mono")
            self.x = np.mean(self.x, axis = 1)

        # set up the window size and step size
        self.short_window_size = .05*self.Fs
        self.short_step_size = .02*self.Fs
        self.mid_window_size = 2.0 *self.Fs
        self.mid_step_size = 1.0*self.Fs
        # print('windowInfo:',  self.short_window_size, self.short_step_size, self.mid_window_size,   self.mid_step_size )
        print(self.Fs)
        # print('computing shorterm features')
        self.short_features, self.short_feature_names = ShortTermFeatures.feature_extraction(self.x, self.Fs, self.short_window_size, self.short_step_size)

        # print('computing midterm features')
        self.mid_features, _, self.mid_feature_names  = MidTermFeatures.mid_feature_extraction(
            self.x,
            self.Fs, 
            self.mid_window_size,
            self.mid_step_size,
            self.short_window_size,
            self.short_step_size)


    def getData(self):
        avgamp, amp = self.getAmplitude()
        avgenergy, energy = self.getEnergy()

        self.feature_dict = {name: value for name, value in zip(self.short_feature_names, self.short_features) if name in short_features_selected}
        self.feature_dict.update(
            {
            'sample_rate':self.Fs,
            'notes_at_timestamps':self.getNotes(),
            'amplitude_avg':avgamp,
            'amplitude':amp,
            'tempo':self.getTempo(),
            'energy_avg':avgenergy,
            'energy':energy,
            'instruments':self.getInstruments(),
            'emotion': self.getEmotionLabel()
            }
        )
        return self.feature_dict
       

    def getBeat(self):
        bpm, ratio = MidTermFeatures.beat_extraction(self.short_features, 1)
        return bpm
    
    def getNotes(self, threshold = .05):
        chromagram, time_axis, _ = ShortTermFeatures.chromagram(self.x, self.Fs, self.short_window_size, self.Fs)
        chromagram = chromagram.T
        notes_at_timestamps = {}
        for i, time in enumerate(time_axis):
            # each column is that time index, so just look at this time index
            chroma_frame = chromagram[:, i] 
            active_notes = np.where(chroma_frame>threshold)[0]

            detected_notes = [note_names[note] for note in active_notes]
            notes_at_timestamps[time] = detected_notes
        return notes_at_timestamps
    
    def getAmplitude(self):
        peak_amplitude = np.max(np.abs(self.x))
        return float(peak_amplitude),np.abs(self.x)
    
    def getEnergy(self):
        energy = librosa.feature.rms(y=self.x, hop_length=self.Fs)
        avg = sum(energy[0])/len(energy[0])
        return float(avg), energy
    
    def getTempo(self):
        tempo, beats = librosa.beat.beat_track(y=self.x, sr=self.Fs)
        return float(tempo[0])
    
    def getInstruments(self):
        #TODO: DO THIS for ML class
        return { #each value is the loudness of each
            'strings':.5,
            'woodwinds':.5,
            'piano':.1
        }
    

    
    def getEmotionLabel(self):
         #TODO: DO THIS for ML class
        return {
            'happy':.5,
            'sad':.25,
            'fear':.25,
            "funny":0
        }
    
# # TESTINGGGG
# sceneAudio = AudioScene('./tmp/pingu/audios/4.wav')
# print(sceneAudio.getData().keys())
# # print(sceneAudio.getBeat())