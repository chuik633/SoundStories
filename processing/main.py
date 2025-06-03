
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import subprocess
import json
import shutil

from audio.audioData import getAudioData
from image.imageData import getImageData
from captions.captionsData import getCaptionData
# from settings.settings import pathConfig


"""
inputting a movie file, it then:
1. if its a youtube link, it downloads it to a video
2. splits the video in n_samples videos, and corresponding audio files and images
3. gets the color information for each scene imageSceneData.json
4. gets the audio data for each scene and saves it in audioSceneData.json
5. gets the caption data
6. saves a compiled scene data
"""
def clear_directories(mainDir):
    for dir_name in ['videos', 'images', 'audios']:
        dir_path = os.path.join(mainDir, dir_name)
        if os.path.exists(dir_path) and os.path.isdir(dir_path):
            shutil.rmtree(dir_path)
            print('deleted dir', dir_name)


# each step
def download_video(dataDir, youtubeLink, captions):
    cmd = [
       'yt-dlp','-f','bestvideo[height<=720]+bestaudio/best[height<=720]',
       '--cookies-from-browser','chrome',
       '--merge-output-format','mp4','-o', dataDir+"video.mp4", youtubeLink
    ]
    try:
        result: subprocess.CompletedProcess = subprocess.run(
            [
                "yt-dlp",
                "-f", "bestvideo[height<=720]+bestaudio/best[height<=720]",
                "--cookies", "./cookies.txt",
                "--merge-output-format", "mp4",
                "--write-subs",              # download manual subtitles (if available)
                "--sub-lang", "en",          # specify the language code (e.g. "en")
                "--convert-subs", "ass",       # convert subs to .ass
                "-o", dataDir + "video.mp4",
                youtubeLink
            ],
            check=True,            # raises CalledProcessError on non-zero exit
            capture_output=True,
            text=True
        )
        print("Download stdout:", result.stdout)
        print("Download stderr:", result.stderr)
        print("Video download completed with exit code", result.returncode)
        if captions:
            cmd2 = ["yt-dlp","--skip-download","--write-auto-sub","--sub-lang","en",
                    "--sub-format","ass","-o",dataDir+"captions.ass", youtubeLink]
            subprocess.run(cmd2, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as e:
        print(f"Command `{e.cmd}` failed with exit code {e.returncode}")
        print("stderr:", e.stderr)

def split_video(dataDir, numSamples):
    subprocess.run(['node','./processVideo.js', dataDir, str(numSamples)],
                   check=True, capture_output=True, text=True)

def load_video_info(dataDir):
    with open(dataDir+"videoInfo.json") as f:
        return json.load(f)

def process_images(dataDir, name):
    getImageData(dataDir, name)

def process_audio(dataDir, name):
    getAudioData(dataDir, name)

def process_captions(name, videoInfo):
    dataDir = './data/tmp/'+f"{name}/"
    if os.path.exists(dataDir+'video.en.ass'):
        print('captions found...processing them')
        getCaptionData(name, round(videoInfo['sampleLength']))
    print("no captions found")

# THIS IS OLD
def getData(name, numSamples = 20, youtubeLink = False, captions = False):
    dataDir = './data/tmp/'+f"{name}/"
    print(dataDir)
    clear_directories(dataDir)
    os.makedirs(dataDir, exist_ok=True)

    #1. if its a youtube link, it downloads it to a video
    if youtubeLink != False:
        try:
            command = [
               'yt-dlp',
                '-f', 'bestvideo[height<=720]+bestaudio/best[height<=720]',
                '--merge-output-format', 'mp4',
                '-o', dataDir + "video.mp4",
                youtubeLink
            ]
            # command = ['yt-dlp', '-f', 'bestvideo+bestaudio', '-o', dataDir + "video.mp4", youtubeLink]
            result = subprocess.run(command, capture_output=True, text=True, check=True)

            if captions:
                command1 = ["yt-dlp","--skip-download","--write-auto-sub", "--sub-lang", "en","--sub-format", "ass","-o", dataDir + "captions.ass",youtubeLink]
                result1 = subprocess.run(command1, capture_output=True, text=True, check=True)
            # captions = True

        except subprocess.CalledProcessError as e:
            print("Error downloading video:", e.stderr)
            return

    #2. splits the video in n_samples videos, and corresponding audio files and images
    command = ['node', './processVideo.js',dataDir, str(numSamples)]
    print(command)
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        print("Split video successfully")
        print(result)
    except subprocess.CalledProcessError as e:
        print("Error processing video:", e.stderr)
        return
    
    #get the info of the video
    videoInfo = None
    with open(dataDir+"videoInfo.json", 'r') as file:
        videoInfo = json.load(file)
    if(videoInfo == None):
        print("Error getting video info:", e.stderr)
        return
    print(videoInfo)
    

    #3. gets the color information for each scene imageSceneData.json
    getImageData(dataDir,name)

    #4. gets the audio data for each scene and saves it in audioSceneData.json
    getAudioData(dataDir,name)

    #5. saves captions if there are them
    if os.path.exists(dataDir+'video.en.ass'):
        getCaptionData(name, round(videoInfo['sampleLength']))

# from sceneMetaData import sceneLinks
# getData('compilation', youtubeLink="https://www.youtube.com/watch?v=c9iCUxuWSwQ", numSamples = 5,captions = False)
# getData('Space', youtubeLink="https://www.youtube.com/watch?v=f9X1C7pTu-M", numSamples = 10,captions = False)
# testlink = "https://www.youtube.com/watch?v=T51QSG9VN8w&t=5s"
# getData('Everything', numSamples = 10, captions = False)
# command1 = ["yt-dlp","--skip-download","--write-auto-sub", "--sub-lang", "en","--sub-format", "ass","-o", "captions.ass",testlink]
# result1 = subprocess.run(command1, capture_output=True, text=True, check=True)
# print(result1.stdout)
# for movieName in sceneLinks.keys():
#     url = sceneLinks[movieName]["url"]
#     numSamples = sceneLinks[movieName]["numSamples"]
#     getData(movieName, numSamples, youtubeLink=url, captions = False)
# getData("Up", youtubeLink="https://www.youtube.com/watch?v=2rn-vMbFglI", numSamples = 1)
# getData("totoro", youtubeLink="https://www.youtube.com/watch?v=MZgBjQFMPvk", numSamples = 1)
# getData('Gymnopedie',youtubeLink='https://www.youtube.com/watch?v=S-Xm7s9eGxU', numSamples = 1)
# # getData('MysteryLove',youtubeLink='https://www.youtube.com/watch?v=y7Hq8hjlzd4', numSamples = 1)g
# getData('interstellarMusic2',youtubeLink="https://www.youtube.com/watch?v=8kooIgKESYE", numSamples = 1)
# getData('ghibli',youtubeLink="https://www.youtube.com/watch?v=RZuMZ79erzc", numSamples = 1)
# getData('totoro',youtubeLink="https://www.youtube.com/watch?v=92a7Hj0ijLs", numSamples = 1)https://www.youtube.com/watch?v=92a7Hj0ijLs