import pandas as pd
import json
from os import listdir
import numpy as np

from audio.singleAudioSceneData import AudioScene

def getAudioData(dataDir,name):
    audioDir = dataDir+'audios/'
    audioFilenames = [f for f in listdir(audioDir) if f.endswith('wav')]

    all_audio_Data = []
    for audioFilename in audioFilenames:
        file_name_info = audioFilename.split('.')
        if len(file_name_info[0])>0:
            i = int(file_name_info[0])
        else:
            print("ERROR:",audioFilename)
        sceneAudio = AudioScene(audioDir+audioFilename)
        entry = sceneAudio.getData()
        entry['sceneNum']=i
        all_audio_Data.append(entry)

    audio_df = pd.DataFrame(all_audio_Data)
    audio_df.to_json(dataDir+'audioSceneData.json', orient = 'records')


# getAudioData("PrincessMononoke")