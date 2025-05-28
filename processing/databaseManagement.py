# data writing info
from dotenv import load_dotenv
import os
from supabase import create_client
from flask import jsonify


load_dotenv() 
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
from supabase import StorageException

def save_job_status(job_id, message):
    supabase.table("jobs").insert({
        "job_id": job_id,
        "progress": 0,
        "message": message
    }).execute()

def report(job_id, progress_val, msg):
    supabase.table("jobs").update({
        "progress": progress_val,
        "message": msg
    }).eq("job_id", job_id).execute()

def get_job_status(job_id):
    resp = (
        supabase
        .table("jobs")
        .select("progress, message, updated_at")
        .eq("job_id", job_id)
        .execute()
    )

    print("-------- GETTING JOB STATUS ---------")
    print("Response:", resp)
    try:
        rows = resp.data or []
        if len(rows) == 0:
            return jsonify(error="Job not found"), 404
        job = rows[0]
        return jsonify(job)
    except Exception as e:
        return jsonify(error=str(e)), 500
  
def clear_supabase_directory(mainDir: str, bucket_name: str = "data"):
    """
    If any objects exist under the prefix `mainDir/`, delete them all.
    """
    bucket = supabase.storage.from_(bucket_name)
    print("BUCKET", bucket)
    
    # 1. list all objects under mainDir/
    print('getting list of objects in bucket')
    listed = bucket.list(path=f"{mainDir}")
    if not listed:
        print(f"No directory named '{mainDir}' found in bucket '{bucket_name}'.")
        return
    # print('listed', listed)
    # 2. collect their full paths
    paths = [mainDir+'/'+obj["name"] for obj in listed]
    print('paths', paths)
    # 3. delete them in one go

    try:
        res = bucket.remove(paths)
        print("REMOVED PATHS")
    except Exception as e:
        print(f"Error deleting '{mainDir}/': {res['error']}")
  
def writeFile(input_path, output_path):
    with open(input_path, "rb") as f:
        try:
            supabase.storage.from_("data").upload(
                file=f,
                path=output_path,
                file_options={"upsert": False}
            )
        except StorageException as err:
            if "ResourceAlreadyExists" in str(err) or "Duplicate" in str(err):
                f.seek(0)
                supabase.storage.from_("data").update(
                    file=f,
                    path=output_path,
                    file_options={"upsert": True}
                )
            else:
                raise
    # if res.error:
    #     raise Exception(f"Upload failed: {res.error.message}")
    return True