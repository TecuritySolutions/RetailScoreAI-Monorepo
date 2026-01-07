from flask import Flask, request, jsonify
from utils.predictor import predict_store_success
import logging
import os

# =========================
# APP CONFIG
# =========================
app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =========================
# ROUTES
# =========================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)

        required_fields = [
            "pincode",
            "area_type",
            "competitors",
            "employee_count",
            "stock_availability",
            "shoe_size"
        ]

        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        result = predict_store_success(data)

        if "error" in result:
            return jsonify(result), 404

        return jsonify({
            "status": "success",
            "result": result
        })

    except Exception as e:
        logger.exception("Prediction failed")
        return jsonify({"error": "Internal server error"}), 500

# =========================
# ENTRY POINT
# =========================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
