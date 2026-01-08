import os
import logging
import pandas as pd
import numpy as np
import joblib

# =========================
# LOGGING CONFIG
# =========================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# =========================
# BASE PATHS
# =========================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATA_PATH = os.path.join(BASE_DIR, "data", "retail_data_with_area_type.xlsx")
MODEL_DIR = os.path.join(BASE_DIR, "Pikels")

# =========================
# LOAD DATA (ONCE)
# =========================
try:
    df = pd.read_excel(DATA_PATH)
    logger.info("Retail data loaded successfully")
except Exception as e:
    logger.error("Failed to load retail data")
    raise e

# =========================
# LOAD MODELS
# =========================
try:
    market_scaler = joblib.load(os.path.join(MODEL_DIR, "market_scaler.pkl"))
    store_scaler = joblib.load(os.path.join(MODEL_DIR, "store_scaler.pkl"))
    store_model = joblib.load(os.path.join(MODEL_DIR, "store_model.pkl"))
    logger.info("Models loaded successfully")
except Exception as e:
    logger.error("Failed to load ML models")
    raise e

# =========================
# 🔐 LOCK MODEL FEATURES
# =========================
MODEL_FEATURES = [
    "total_population",
    "male_population",
    "population_density",
    "area_type_encoded",
    "shop_size",
    "Stoks availabity",
    "employee_count",
    "Competitors",
    "market_score"
]

assert store_model.n_features_in_ == len(MODEL_FEATURES), \
    "❌ Model feature count mismatch"

# =========================
# SCALE TO 0–1000
# =========================
def scale_to_1000(raw_value, min_expected=200, max_expected=1200):
    """
    Converts raw ML output to 0–1000 business score
    """
    raw_value = float(raw_value)
    raw_value = max(min_expected, min(raw_value, max_expected))
    score = ((raw_value - min_expected) / (max_expected - min_expected)) * 1000
    return round(score, 2)

# =========================
# SHOP SIZE NORMALIZER
# =========================
def normalize_shop_size(shop_size):
    """
    Dropdown / API safe adapter
    """
    if isinstance(shop_size, str):
        mapping = {
            "Small": 100,
            "Medium": 400,
            "Large": 700
        }
        return mapping.get(shop_size, 100)
    return shop_size

# =========================
# AREA TYPE ENCODER
# =========================
def encode_area_type(area_type):
    return {"Urban": 3, "Semi-Urban": 2, "Rural": 1}.get(area_type, 2)

# =========================
# PINCODE LOOKUP
# =========================
def get_pincode_data(pincode):
    record = df[df["pincode"] == pincode]

    if record.empty:
        return None

    density_raw = record.iloc[0]["population_density"]
    try:
        density = float(str(density_raw).replace(",", "").split()[0])
    except Exception:
        density = 0.0

    return {
        "place": record.iloc[0]["places"],
        "total_population": int(record.iloc[0]["total_population"]),
        "male_population": int(record.iloc[0]["male_population"]),
        "female_population": int(record.iloc[0]["female_population"]),
        "population_density": density,
        "coordinates": record.iloc[0]["coordinates"]
    }

# =========================
# MARKET SCORE
# =========================
def calculate_market_score(pincode_data, area_type):
    area_encoded = encode_area_type(area_type)

    market_input = pd.DataFrame([{
        "total_population": pincode_data["total_population"],
        "male_population": pincode_data["male_population"],
        "female_population": pincode_data["female_population"],
        "population_density": pincode_data["population_density"],
        "area_type_encoded": area_encoded
    }])

    market_input = market_input[market_scaler.feature_names_in_]
    scaled = market_scaler.transform(market_input)

    return round(float(np.mean(scaled)), 2)

# =========================
# STORE SCORE
# =========================
def calculate_store_score(inputs, market_score, pincode_data, area_type):
    area_encoded = encode_area_type(area_type)

    X = pd.DataFrame([{
        "total_population": pincode_data["total_population"],
        "male_population": pincode_data["male_population"],
        "population_density": pincode_data["population_density"],
        "area_type_encoded": area_encoded,
        "shop_size": normalize_shop_size(inputs["shoe_size"]),
        "Stoks availabity": inputs["stock_availability"],
        "employee_count": inputs["employee_count"],
        "Competitors": inputs["competitors"],
        "market_score": market_score
    }])

    X = X[MODEL_FEATURES]

    scale_cols = store_scaler.feature_names_in_
    X[scale_cols] = store_scaler.transform(X[scale_cols])

    raw_prediction = float(store_model.predict(X.values)[0])

    # =========================
    # BUSINESS RULES
    # =========================
    if inputs["competitors"] > 15:
        raw_prediction *= 0.90

    if area_type == "Urban":
        raw_prediction *= 1.08

    return scale_to_1000(raw_prediction)

# =========================
# MAIN PREDICT
# =========================
def predict_store_success(payload):
    pincode_data = get_pincode_data(payload["pincode"])

    if not pincode_data:
        return {"error": "Invalid pincode"}

    market_score = calculate_market_score(
        pincode_data,
        payload["area_type"]
    )

    store_score = calculate_store_score(
        payload,
        market_score,
        pincode_data,
        payload["area_type"]
    )

    return {
        "pincode": payload["pincode"],
        "area_type": payload["area_type"],
        "market_score": market_score,
        "store_score": store_score,
        "demographics": pincode_data
    }
