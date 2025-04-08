
import subprocess
import json
import shutil
import os

from audioData import getAudioData
from imageData import getImageData
from captionsData import getCaptionData

"""
inputting a movie file, it then:
1. if its a youtube link, it downloads it to a video
2. splits the video in n_samples videos, and corresponding audio files and images
3. gets the color information for each scene imageSceneData.json
4. gets the audio data for each scene and saves it in audioSceneData.json
5. gets the caption data
6. saves a compiled scene data
"""
def clearDirectories(mainDir):
    for dir_name in ['videos', 'images', 'audios']:
        dir_path = os.path.join(mainDir, dir_name)
        if os.path.exists(dir_path) and os.path.isdir(dir_path):
            shutil.rmtree(dir_path)
            print('deleted dir', dir_name)

def getData(name, numSamples = 20, youtubeLink = False, captions = False):
    mainDir = f"./tmp/{name}/"
    clearDirectories(mainDir)
    os.makedirs(mainDir, exist_ok=True)

    #1. if its a youtube link, it downloads it to a video
    if youtubeLink != False:
        try:
            command = ['yt-dlp', '-f', 'mp4', '-o', mainDir + "video.mp4", youtubeLink]
            result = subprocess.run(command, capture_output=True, text=True, check=True)

            command1 = ["yt-dlp","--skip-download","--write-auto-sub", "--sub-lang", "en","--sub-format", "ass","-o", mainDir + "captions.ass",youtubeLink]
            result1 = subprocess.run(command1, capture_output=True, text=True, check=True)
            # captions = True

        except subprocess.CalledProcessError as e:
            print("Error downloading video:", e.stderr)
            return

    #2. splits the video in n_samples videos, and corresponding audio files and images
    
    command = ['node', 'processVideo.js', str(name), str(numSamples)]
    print(command)
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        print("Split video successfully")
    except subprocess.CalledProcessError as e:
        print("Error processing video:", e.stderr)
        return
    
    #get the info of the video
    videoInfo = None
    with open(mainDir+"videoInfo.json", 'r') as file:
        videoInfo = json.load(file)
    if(videoInfo == None):
        print("Error getting video info:", e.stderr)
        return
    print(videoInfo)
    

    #3. gets the color information for each scene imageSceneData.json
    getImageData(name)

    #4. gets the audio data for each scene and saves it in audioSceneData.json
    getAudioData(name)

    #5. saves captions if there are them
    if captions:
        getCaptionData(name, round(videoInfo['sampleLength']))

# getData('compilation', youtubeLink = "https://www.youtube.com/watch?v=xBasQG_6p40", numSamples = 50)
# testlink = "https://www.youtube.com/watch?v=T51QSG9VN8w&t=5s"
getData('Everything', numSamples = 50, captions = False)
# command1 = ["yt-dlp","--skip-download","--write-auto-sub", "--sub-lang", "en","--sub-format", "ass","-o", "captions.ass",testlink]
# result1 = subprocess.run(command1, capture_output=True, text=True, check=True)
# print(result1.stdout)