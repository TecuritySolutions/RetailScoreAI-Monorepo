#!/usr/bin/env python3
"""
Convert scikit-learn models to ONNX format for deployment.
This reduces deployment size from ~250 MB to ~73 MB by replacing
scikit-learn (~150 MB) with onnxruntime (~15 MB).
"""

import joblib
import numpy as np
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

print("Loading scikit-learn models...")

# Load existing models
market_scaler = joblib.load('Pikels/market_scaler.pkl')
store_scaler = joblib.load('Pikels/store_scaler.pkl')
store_model = joblib.load('Pikels/store_model.pkl')

print(f"✓ Loaded 3 models")
print(f"  - market_scaler: {market_scaler.n_features_in_} features")
print(f"  - store_scaler: {store_scaler.n_features_in_} features")
print(f"  - store_model: {store_model.n_features_in_} features")

print("\nConverting to ONNX...")

# Convert market_scaler to ONNX
initial_type_market = [('float_input', FloatTensorType([None, market_scaler.n_features_in_]))]
market_scaler_onnx = convert_sklearn(market_scaler, initial_types=initial_type_market)
with open('Pikels/market_scaler.onnx', 'wb') as f:
    f.write(market_scaler_onnx.SerializeToString())
print("  ✓ market_scaler.onnx")

# Convert store_scaler to ONNX
initial_type_store_scaler = [('float_input', FloatTensorType([None, store_scaler.n_features_in_]))]
store_scaler_onnx = convert_sklearn(store_scaler, initial_types=initial_type_store_scaler)
with open('Pikels/store_scaler.onnx', 'wb') as f:
    f.write(store_scaler_onnx.SerializeToString())
print("  ✓ store_scaler.onnx")

# Convert store_model to ONNX
initial_type_model = [('float_input', FloatTensorType([None, store_model.n_features_in_]))]
store_model_onnx = convert_sklearn(store_model, initial_types=initial_type_model)
with open('Pikels/store_model.onnx', 'wb') as f:
    f.write(store_model_onnx.SerializeToString())
print("  ✓ store_model.onnx")

print("\n✓ All models converted to ONNX successfully!")
print("\nNext steps:")
print("1. Update requirements.txt to use onnxruntime instead of scikit-learn")
print("2. Update utils/predictor.py to load and use ONNX models")
print("3. Deploy to Vercel (will be ~73 MB instead of ~250 MB)")
