import os
import requests
import gzip
import shutil

# National Data Buoy Center (NDBC) Station ID for standard meteorological data
STATION_ID = "46059"
# The base URL for historical standard meteorological data
BASE_URL = "https://www.ndbc.noaa.gov/data/historical/stdmet/"

# Directory to save raw data
DATA_DIR = "data/raw"

def download_data(year, station_id=STATION_ID, output_dir=DATA_DIR):
    """
    Downloads historical standard meteorological data for a specific year.
    Returns the path to the extracted file, or None if failed.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # NDBC historical data files are named like 46059h2020.txt.gz
    # Some older years might have slightly different names, but this fits the standard format
    # for most recent years (e.g. h1999, h2000, ... h2023)
    filename_gz = f"{station_id}h{year}.txt.gz"
    url = f"{BASE_URL}{filename_gz}"
    
    output_gz_path = os.path.join(output_dir, filename_gz)
    extracted_txt_path = os.path.join(output_dir, f"{station_id}h{year}.txt")
    
    print(f"Downloading {url}...")
    
    try:
        response = requests.get(url, stream=True)
        # Check if the file exists on the server (status code 200)
        if response.status_code == 200:
            with open(output_gz_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"Successfully downloaded to {output_gz_path}")
            
            # Extract the gzipped file
            with gzip.open(output_gz_path, 'rb') as f_in:
                with open(extracted_txt_path, 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)
            
            print(f"Extracted to {extracted_txt_path}")
            
            # Remove the gz file to save space (optional, but good practice if we just need the txt)
            os.remove(output_gz_path)
            
            return extracted_txt_path
        else:
            print(f"Failed to download data for year {year}. HTTP Status Code: {response.status_code}")
            return None
    except Exception as e:
        print(f"An error occurred while downloading/extracting data for year {year}: {e}")
        return None

if __name__ == "__main__":
    # Download data for a sequence of recent years to have enough data for training
    # 2018 to 2023 provides a good amount of historical data
    years_to_download = range(2018, 2024) 
    
    for year in years_to_download:
        download_data(year)
    
    print("Data download process completed.")
