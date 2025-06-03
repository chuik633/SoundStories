from flask import Flask, jsonify, request
from threading import Thread
from uuid import uuid4
import yt_dlp
from main import  clear_directories,download_video, split_video, load_video_info, process_images, process_audio, process_captions
import subprocess
from databaseManagement import writeFile, clear_supabase_directory, report,save_job_status,get_job_status
import os
from os import listdir
from flask_cors import CORS

# creat app
app = Flask(__name__)
CORS(app, supports_credentials=True)


# routes
@app.route('/')
def hello():
    """Basic endpoint to check if the app is running."""
    return jsonify(message="Hi! Sound stories endpoint is running woot!")

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

@app.route('/process', methods = ['POST'])
def process_data():
    # read in the request params
    params = request.get_json() or {}
    name = params.get('name')
    numSamples = params.get('numSamples',1)
    youtubeLink = params.get('youtubeLink', False)
    captions = params.get('captions', False)

    # get movie name from request
    if not name:
        return jsonify(error="missing name"), 400
    
    # create a job to send
    job_id = str(uuid4()) #need unique user id
    print("SAVING JOB", job_id)
    
    # jobs[job_id] = {'progress':0, 'message':'queued'} #progress information
    save_job_status(job_id, 'queued')

    # start the job in the background
    thread = Thread(target = background_task, 
                    args = (job_id, name, numSamples, youtubeLink, captions), 
                    daemon=True)
    thread.start()

    return jsonify(job_id = job_id), 202

@app.route('/status/<job_id>')
def job_status(job_id):
    return get_job_status(job_id)


@app.route('/cancel/<job_id>/<movieName>')
def cancel_job(job_id, movieName):
    report(job_id, -100, 'Job cancelled')
    print("clearing the directories",str(movieName).upper())
    clear_supabase_directory(str(movieName).upper(), 'data')
    return jsonify({'message': "Job cancelled"}, 100)

def background_task(job_id, name, numSamples, youtubeLink, captions):
    with app.app_context():
        def check_cancel_job():
            response = get_job_status(job_id)
            if isinstance(response, tuple):  # Flask jsonify returns a tuple (response, status_code)
                response_data = response[0].get_json()  # Convert JSON response to a dictionary
            else:
                response_data = response.get_json()  # Directly convert if no tuple
            print("checking cancel", response_data.get('progress'))
            if(response_data.get('progress') == -100):
                print("CANCELING THE JOB")
                return True
            # job_status_return= get_job_status(job_id)
            # print("CHECKING JOB STATUS", job_status_return)
            # if(job_status_return['progress'] == -100):
            #     print("CANCELING JOB")
            #     return True
            return False
        # SETUP FoLDERS
        report(job_id,0, 'Setting up...')
        dataDir = f'./data/tmp/{name}/'
        os.makedirs(dataDir, exist_ok=True)
        print('clearing directoreis')
        clear_directories(dataDir)
        if(check_cancel_job()):
            return

        # DOWNLOAD VIDEO
        print('downloading video')
        if youtubeLink:
            if(check_cancel_job()):
                return
            report(job_id,10, 'Downloading youtube video')
            try:
                download_video(dataDir, youtubeLink, captions)
            except Exception as e:
                print("ERROR DOWNLAODING")
                if(check_cancel_job()):
                    return
                report(job_id,0, 'ERROR! Downloading video failed' + e)
            if(check_cancel_job()):
                return
            report(job_id,15, 'Downloaded! Now splitting the video')
            
        
        
        # SPLIT VIDEO
        print('splitting video')
        split_video(dataDir, numSamples)
        if(check_cancel_job()):
            return
        report(job_id,20, 'Split!')
        videoInfo = load_video_info(dataDir)
      
    
        # PROCESSING
        print('processing images')
        if(check_cancel_job()):
            return
        report(job_id,30, 'Processing Images')
        process_images(dataDir, name)

        
        print('processing audio')
        if(check_cancel_job()):
            return
        report(job_id,40, 'Processing Audio')
        process_audio(dataDir, name)
        if(check_cancel_job()):
            return
        
        if captions:
            print('processing captions')
            if(check_cancel_job()):
                return
            report(job_id,45, 'Processing Captions')
            process_captions(name, videoInfo['sampleLength'])

        if(check_cancel_job()):
                return
        print('storing files')
        report(job_id,50, 'Storing files')
        try:
            print('clearing any duplicates')
            clear_supabase_directory(name,'data')
            print('storing data')
            store_data(job_id,name, report,check_cancel_job)
        except Exception as e:
            report(job_id,0, 'ERROR!', e)
            return
        if(check_cancel_job()):
            return
        report(job_id,100, 'Completed!')
    
def store_data(job_id,movieName, report,check_cancel_job):
    base = f'./data/tmp/{movieName}/'
    image_files = listdir(base + 'images/')
    numImages = len(image_files)
    if(check_cancel_job()):
            return
    for imgNum,f in enumerate(image_files):
        val = 60 + round(imgNum/numImages*10)
        print('val', val)
        report(job_id,val, f'Uploading images ({imgNum+1}/{numImages})')
        writeFile(base + 'images/' + f, f'{movieName}/images/{f}')
    if(check_cancel_job()):
            return
    for f in listdir(base + 'audios/'):
        report(job_id,70, 'Uploading audio')
        writeFile(base + 'audios/' + f, f'{movieName}/audios/{f}')
    if(check_cancel_job()):
            return
    for f in listdir(base + 'videos/'):
        report(job_id,80, 'Uploading videos')
        writeFile(base + 'videos/' + f, f'{movieName}/videos/{f}')
    if(check_cancel_job()):
            return
    report(job_id,90, 'Uploading JSON data')
    writeFile(base + 'imageSceneData.json', f'{movieName}/imageSceneData.json')
    writeFile(base + 'audioSceneData.json', f'{movieName}/audioSceneData.json')
    writeFile(base + 'videoInfo.json', f'{movieName}/videoInfo.json')



# check ffmpeg helper function
def check_ffmpeg():
    """Checks if ffmpeg is installed and accessible."""
    try:
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
