# data writing info
from dotenv import load_dotenv
import os
from supabase import create_client

load_dotenv() 
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
from supabase import StorageException


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