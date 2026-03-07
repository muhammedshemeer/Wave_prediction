import os
import pandas as pd
import numpy as np

# Input/Output paths
RAW_DATA_DIR = "data/raw"
CLEAN_DATA_PATH = "data/cleaned_data.csv"

# Columns of interest based on NDBC format
# Common header: #YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP  VIS PTDY  TIDE
TARGET_COLUMNS = {
    'WSPD': 'wind_speed',
    'WVHT': 'wave_height',
    'PRES': 'pressure',
    'WTMP': 'sst'
}

def process_ndbc_file(filepath):
    """
    Parses a single NDBC standard meteorological data text file.
    """
    # Read the data, skipping the second row (units row usually starts with #yr)
    # The first row starts with #YY, but we want pandas to treat it as header, so we rename columns 
    # and handle the '#' in the year column.
    
    try:
        df = pd.read_csv(filepath, sep=r'\s+', skiprows=[1], na_values=['99.0', '99.00', '999.0', '9999.0'])
    except Exception as e:
        print(f"Error reading file {filepath}: {e}")
        return None
    col_dict = {col: col.replace('#', '') for col in df.columns}
    df.rename(columns=col_dict, inplace=True)
    
    # Fix Yr/YY depending on parsing
    if 'YY' in df.columns and 'YYYY' not in df.columns:
        df.rename(columns={'YY': 'YYYY'}, inplace=True)
        
    year_col = 'YYYY' if 'YYYY' in df.columns else 'YY'
    
    # NDBC includes YYYY, MM, DD, hh, mm
    # Some older files only have 'hh' and not 'mm'
    time_cols = [year_col, 'MM', 'DD', 'hh']
    if 'mm' in df.columns:
        time_cols.append('mm')
        
    for col in time_cols:
        if col not in df.columns:
            print(f"Warning: Expected time column {col} not found in {filepath}. Skipping.")
            return None
            
    # Create datetime index
    try:
        if 'mm' in df.columns:
            df['datetime'] = pd.to_datetime(df[year_col].astype(str).str.zfill(4) + '-' + 
                                            df['MM'].astype(str).str.zfill(2) + '-' + 
                                            df['DD'].astype(str).str.zfill(2) + ' ' + 
                                            df['hh'].astype(str).str.zfill(2) + ':' + 
                                            df['mm'].astype(str).str.zfill(2))
        else:
            df['datetime'] = pd.to_datetime(df[year_col].astype(str).str.zfill(4) + '-' + 
                                            df['MM'].astype(str).str.zfill(2) + '-' + 
                                            df['DD'].astype(str).str.zfill(2) + ' ' + 
                                            df['hh'].astype(str).str.zfill(2))
    except Exception as e:
        print(f"Error parsing dates in {filepath}: {e}")
        return None
        
    df.set_index('datetime', inplace=True)
    
    # Keep only target columns
    available_cols = [col for col in TARGET_COLUMNS.keys() if col in df.columns]
    df = df[available_cols]
    
    # Rename columns to standardized names
    df.rename(columns=TARGET_COLUMNS, inplace=True)
    
    # Replace NDBC missing value indicators with NaN (99.0, 999.0, 9999.0 etc. were partly handled by na_values)
    # Just to be sure, we also manually replace numeric equivalents
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Missing values placeholders often used in these specific columns:
    # Wave height (m): 99.00
    # Wind speed (m/s): 99.0
    # Pressure (hPa): 9999.0
    # SST (degC): 999.0
    df.replace([99.0, 99.00, 999.0, 9999.0], np.nan, inplace=True)
    
    return df

def compile_dataset():
    """
    Reads all raw texts files and compiles them into a single cleaned CSV.
    """
    all_data = []
    
    if not os.path.exists(RAW_DATA_DIR):
        print(f"Error: {RAW_DATA_DIR} does not exist. Run download_data.py first.")
        return
        
    for filename in sorted(os.listdir(RAW_DATA_DIR)):
        if filename.endswith(".txt"):
            filepath = os.path.join(RAW_DATA_DIR, filename)
            print(f"Processing {filepath}...")
            df = process_ndbc_file(filepath)
            if df is not None:
                all_data.append(df)
                
    if not all_data:
        print("No data was processed.")
        return
        
    # Concatenate all years
    combined_df = pd.concat(all_data)
    
    # Sort by datetime (index)
    combined_df.sort_index(inplace=True)
    
    # Handle missing values: Forward fill up to a limit, then backward fill 
    # to maintain sequential temporal flow without dropping too many periods
    print("Handling missing values (interpolation)...")
    combined_df.interpolate(method='time', limit_direction='both', inplace=True)
    
    # Drop rows that still have NaNs (if any entire columns were missing initially)
    combined_df.dropna(inplace=True)
    
    # Make sure target column exists
    if 'wave_height' not in combined_df.columns:
        print("Error: Target column 'wave_height' is missing from the compiled dataset.")
        return
    
    print(f"Compiled dataset shape: {combined_df.shape}")
    
    # Save to CSV
    combined_df.to_csv(CLEAN_DATA_PATH)
    print(f"Dataset successfully saved to {CLEAN_DATA_PATH}")

if __name__ == "__main__":
    compile_dataset()
