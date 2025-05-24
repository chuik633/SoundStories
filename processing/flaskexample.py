# app.py
from flask import Flask, jsonify, request
import yt_dlp
import subprocess
import os

app = Flask(__name__)

# --- Helper Function to Check FFmpeg ---
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

@app.route('/download', methods=['POST'])
def download_video_info():
    """
    Endpoint to get video info using yt-dlp.
    Expects JSON payload with a 'url' key.
    """
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify(error="Missing 'url' in JSON payload"), 400

    video_url = data['url']

    ydl_opts = {
        'quiet': True,       # Suppress yt-dlp output to console
        'noplaylist': True,  # Download only single video if URL is a playlist
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best' # Example format
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(video_url, download=False) # Set download=False to just get info
            # You can choose to download by setting download=True
            # ydl.download([video_url]) # This would download the video

        # Return some basic info
        return jsonify(
            title=info_dict.get('title', None),
            uploader=info_dict.get('uploader', None),
            duration=info_dict.get('duration_string', None),
            formats_available=len(info_dict.get('formats', [])),
            thumbnail=info_dict.get('thumbnail', None)
        )
    except yt_dlp.utils.DownloadError as e:
        app.logger.error(f"yt-dlp DownloadError: {e}")
        return jsonify(error=f"yt-dlp error: {str(e)}"), 500
    except Exception as e:
        app.logger.error(f"Unexpected error during download: {e}")
        return jsonify(error=f"An unexpected error occurred: {str(e)}"), 500

if __name__ == '__main__':
    # For development, you can run the app directly
    # For production, use a WSGI server like Gunicorn (as in the Dockerfile CMD)
    # Ensure FFmpeg is accessible if your app uses it directly for processing
    ffmpeg_ok, msg = check_ffmpeg()
    print(msg)
    app.run(host='0.0.0.0', port=5000, debug=True)
