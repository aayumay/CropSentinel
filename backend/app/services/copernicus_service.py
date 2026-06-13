"""
Service layer for interacting with the Copernicus Dataspace Ecosystem (CDSE) Sentinel-2 API.
"""
import os
import zlib
import struct
import math
from datetime import datetime, timedelta
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_copernicus_token() -> str:
    """
    Authenticates against Copernicus OAuth using client credentials and returns an access token.
    """
    client_id = os.getenv("COPERNICUS_CLIENT_ID")
    client_secret = os.getenv("COPERNICUS_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        raise ValueError("COPERNICUS_CLIENT_ID or COPERNICUS_CLIENT_SECRET environment variable is missing.")
        
    oauth_url = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
    payload = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret
    }
    
    response = requests.post(oauth_url, data=payload, timeout=15)
    response.raise_for_status()
    token_data = response.json()
    return token_data["access_token"]

def query_sentinel_metadata(latitude: float, longitude: float) -> dict:
    """
    Queries Sentinel-2 catalog metadata for a specific farm coordinate.
    """
    try:
        # 1. Authenticate and retrieve Bearer token
        token = get_copernicus_token()
        
        # 2. Configure time window (last 60 days)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=60)
        datetime_filter = f"{start_date.strftime('%Y-%m-%dT%H:%M:%SZ')}/{end_date.strftime('%Y-%m-%dT%H:%M:%SZ')}"
        
        # 3. Query the Sentinel Hub SpatioTemporal Asset Catalog (STAC) search endpoint on CDSE
        catalog_url = "https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "collections": ["sentinel-2-l2a"],
            "intersects": {
                "type": "Point",
                "coordinates": [longitude, latitude]
            },
            "datetime": datetime_filter,
            "limit": 10
        }
        
        response = requests.post(catalog_url, headers=headers, json=payload, timeout=15)
        response.raise_for_status()
        search_results = response.json()
        features = search_results.get("features", [])
        
        if not features:
            return {
                "authenticated": True,
                "dataset": "Sentinel-2",
                "scene_count": 0,
                "error": "No Sentinel-2 imagery found within the last 60 days for this location."
            }
            
        latest_feature = features[0]
        properties = latest_feature.get("properties", {})
        
        return {
            "authenticated": True,
            "dataset": "Sentinel-2",
            "scene_count": len(features),
            "latest_scene_date": properties.get("datetime"),
            "latest_scene_id": latest_feature.get("id"),
            "cloud_cover": properties.get("eo:cloud_cover")
        }
        
    except Exception as e:
        return {
            "authenticated": False,
            "error": f"Copernicus Sentinel-2 metadata retrieval failed: {str(e)}"
        }

def get_ndvi(latitude: float, longitude: float) -> dict:
    """
    Computes real-time NDVI for a given coordinate by querying Sentinel Hub Process API.
    """
    # 1. Query catalog metadata to get the latest available scene datetime
    metadata = query_sentinel_metadata(latitude, longitude)
    if not metadata.get("authenticated") or metadata.get("scene_count", 0) == 0:
        raise ValueError(f"Could not retrieve Sentinel-2 scene metadata: {metadata.get('error', 'No scenes found')}")
        
    latest_scene_date = metadata["latest_scene_date"]
    
    # 2. Parse date and define time range (+/- 12 hours) around image capture
    dt_clean = latest_scene_date.replace("Z", "")
    if "." in dt_clean:
        dt_clean = dt_clean.split(".")[0]
    dt = datetime.strptime(dt_clean, "%Y-%m-%dT%H:%M:%S")
    
    time_from = (dt - timedelta(hours=12)).strftime("%Y-%m-%dT%H:%M:%SZ")
    time_to = (dt + timedelta(hours=12)).strftime("%Y-%m-%dT%H:%M:%SZ")
    
    # 3. Retrieve Copernicus OAuth token
    token = get_copernicus_token()
    
    # 4. Construct Sentinel Hub Process API call
    process_url = "https://sh.dataspace.copernicus.eu/api/v1/process"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Tiny bbox around coordinates to simulate point extraction (~22m x ~22m)
    bbox = [longitude - 0.0001, latitude - 0.0001, longitude + 0.0001, latitude + 0.0001]
    
    payload = {
        "input": {
            "bounds": {
                "properties": {
                    "crs": "http://www.opengis.net/def/crs/OGC/1.3/CRS84"
                },
                "bbox": bbox
            },
            "data": [
                {
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "timeRange": {
                            "from": time_from,
                            "to": time_to
                        }
                    }
                }
            ]
        },
        "output": {
            "width": 1,
            "height": 1,
            "responses": [
                {
                    "identifier": "default",
                    "format": {
                        "type": "image/tiff"
                    }
                }
            ]
        },
        "evalscript": """//VERSION=3
function setup() {
  return {
    input: ["B04", "B08", "dataMask"],
    output: { id: "default", bands: 1, sampleType: "FLOAT32" }
  };
}
function evaluatePixel(samples) {
  let ndvi = (samples.B08 - samples.B04) / (samples.B08 + samples.B04);
  return [ndvi];
}"""
    }
    
    response = requests.post(process_url, headers=headers, json=payload, timeout=20)
    response.raise_for_status()
    
    # 5. Parse single-pixel Float32 GeoTIFF from compressed TIFF response
    is_little = response.content[:2] == b"II"
    endian = "<" if is_little else ">"
    
    ifd_offset = struct.unpack(f"{endian}I", response.content[4:8])[0]
    num_entries = struct.unpack(f"{endian}H", response.content[ifd_offset:ifd_offset+2])[0]
    
    strip_offset = None
    strip_bytes = None
    
    for idx in range(num_entries):
        entry_offset = ifd_offset + 2 + idx * 12
        tag = struct.unpack(f"{endian}H", response.content[entry_offset:entry_offset+2])[0]
        type_ = struct.unpack(f"{endian}H", response.content[entry_offset+2:entry_offset+4])[0]
        count = struct.unpack(f"{endian}I", response.content[entry_offset+4:entry_offset+8])[0]
        value_offset = struct.unpack(f"{endian}I", response.content[entry_offset+8:entry_offset+12])[0]
        
        if tag == 273:  # StripOffsets tag
            strip_offset = value_offset
        if tag == 279:  # StripByteCounts tag
            strip_bytes = value_offset
            
    if strip_offset is None or strip_bytes is None:
        raise ValueError("Could not parse TIFF metadata tags from Process API response.")
        
    compressed_pixel_data = response.content[strip_offset:strip_offset+strip_bytes]
    
    # Decompress using zlib (Adobe Deflate is the standard Sentinel Hub compression format)
    try:
        decompressed_data = zlib.decompress(compressed_pixel_data)
        ndvi = struct.unpack(f"{endian}f", decompressed_data)[0]
    except Exception as e:
        raise ValueError(f"Failed to decompress or parse Float32 from TIFF strip: {e}")
        
    # Handle NaN or out of bounds values gracefully
    if math.isnan(ndvi):
        ndvi = 0.0
        
    ndvi = round(max(-1.0, min(1.0, ndvi)), 3)
    
    # 6. Map NDVI to Farm Health Score and Status according to requirements:
    # NDVI >= 0.70 -> 90-100
    # NDVI >= 0.55 -> 70-89
    # NDVI >= 0.40 -> 50-69
    # NDVI < 0.40  -> 0-49
    if ndvi >= 0.70:
        farm_health_score = 90 + int((ndvi - 0.70) / 0.30 * 10)
        status = "healthy"
    elif ndvi >= 0.55:
        farm_health_score = 70 + int((ndvi - 0.55) / 0.15 * 19)
        status = "healthy"
    elif ndvi >= 0.40:
        farm_health_score = 50 + int((ndvi - 0.40) / 0.15 * 19)
        status = "moderate"
    else:
        farm_health_score = int(max(0.0, ndvi) / 0.40 * 49)
        status = "stressed"
        
    # Boundary checks
    farm_health_score = min(100, max(0, farm_health_score))
    
    return {
        "ndvi": ndvi,
        "farm_health_score": farm_health_score,
        "status": status,
        "captured_at": latest_scene_date
    }
