# app.py
from flask import Flask, jsonify, request
import yt_dlp
from main import getData
import subprocess
from writeData import writeFile
import os
from os import listdir



app = Flask(__name__)

# ---check that it all installed correctly--
def check_ffmpeg():
    """Checks if ffmpeg is installed and accessible."""
    try:
        # Execute ffmpeg -version command
        process = subprocess.Popen(['ffmpeg', '-version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        if process.returncode == 0:
            return True, "FFmpeg found: \n" + stdout.decode('utf-8').split('\n')[0] # Get first line of version info
        else:
            return False, "FFmpeg not found or error executing: \n" + stderr.decode('utf-8')
    except FileNotFoundError:
        return False, "FFmpeg command not found. Ensure it is installed and in PATH."
    except Exception as e:
        return False, f"An unexpected error occurred while checking FFmpeg: {str(e)}"

# --- Routes ---
@app.route('/')
def hello():
    """Basic endpoint to check if the app is running."""
    return jsonify(message="Hello from Flask! The app is running.")

@app.route('/check_dependencies')
def check_dependencies():
    """Endpoint to check if yt-dlp and ffmpeg are available."""
    ffmpeg_available, ffmpeg_message = check_ffmpeg()
    dependencies = {
        "yt_dlp_version": yt_dlp.version.__version__,
        "ffmpeg_status": "Available" if ffmpeg_available else "Not Available",
        "ffmpeg_details": ffmpeg_message
    }
    return jsonify(dependencies)

@app.route('/process', methods = ["POST"])
def process_data():
    data = request.json
    name = data.get('name')
    numSamples = data.get('numSamples',1)
    youtubeLink = data.get('youtubeLink', False)
    captions = data.get('captions', False)
    if not name:
        return jsonify({"error": "missing name"}), 400
    try:
        getData(name, numSamples, youtubeLink, captions)
        print('got th data')
        store_data(name)
        return jsonify({"message": "YAY! we got the data  and saved it:)"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def store_data(movieName):
    # image files
    moviePath = './data/tmp/'+movieName+'/'
    img_files = [f for f in listdir(moviePath+'images/')]
    for img_file in img_files:
        imgPath = moviePath + 'images/' + img_file
        writeFile(imgPath, movieName+'/images/'+img_file)
    # audio files
    audio_file = [f for f in listdir(moviePath+'audios/')]
    for audio_file in audio_file:
        audioPath = moviePath + 'audios/' + audio_file
        writeFile(audioPath, movieName+'/audios/'+audio_file)

    # data files    
    writeFile(moviePath+'imageSceneData.json', movieName+'/imageSceneData.json')
    writeFile(moviePath+'audioSceneData.json', movieName+'/audioSceneData.json')
    writeFile(moviePath+'videoInfo.json', movieName+'/videoInfo.json')



# if __name__ == '__main__':
#     # For development, you can run the app directly
#     # For production, use a WSGI server like Gunicorn (as in the Dockerfile CMD)
#     # Ensure FFmpeg is accessible if your app uses it directly for processing
#     ffmpeg_ok, msg = check_ffmpeg()
#     print(msg)
#     app.run(host='0.0.0.0', port=5000, debug=True)
