# --- Base Image ---
# Use an official Python runtime as a parent image
# Choose a specific version for reproducibility, e.g., python:3.11-slim
FROM python:3.13-slim

# --- Set Environment Variables ---
# Prevents Python from writing pyc files to disc
ENV PYTHONDONTWRITEBYTECODE==1
# Ensures Python output is sent straight to the terminal without buffering
ENV PYTHONUNBUFFERED==1

# --- Install System Dependencies ---
# Update package list and install ffmpeg and other build essentials
# Clean up apt cache to reduce image size
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg gcc libc-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# --- Set Working Directory ---
WORKDIR /app

# --- Install Python Dependencies ---
# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install yt-dlp and other Python packages specified in requirements.txt
# --no-cache-dir reduces image size
RUN pip install --no-cache-dir -r requirements.txt

# --- Copy Application Code ---
# Copy the rest of the application code into the working directory
COPY . .

# --- Expose Port ---
# Expose the port the Flask app runs on (default is 5000)
EXPOSE 5000

# --- Command to Run the Application ---
# Command to run the Flask application using gunicorn (recommended for production)
# You can also use "flask run --host=0.0.0.0" for development
# Make sure gunicorn is in your requirements.txt if you use it here
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
# If you prefer Flask's built-in server for development (not recommended for production):
# CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
