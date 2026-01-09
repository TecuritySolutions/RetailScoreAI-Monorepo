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

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "success",
        "message": "Welcome to the Retail Store Success Prediction API!"
    })


@app.route("/docs", methods=["GET"])
def docs():
    """
    Returns OpenAPI 3.0 specification for the API
    """
    openapi_spec = {
        "openapi": "3.0.0",
        "info": {
            "title": "Retail Store Success Prediction API",
            "version": "1.0.0",
            "description": "API for predicting retail store success based on location demographics and store characteristics"
        },
        "servers": [
            {
                "url": "/",
                "description": "Production server"
            }
        ],
        "paths": {
            "/": {
                "get": {
                    "summary": "Welcome endpoint",
                    "description": "Returns a welcome message to verify the API is running",
                    "responses": {
                        "200": {
                            "description": "Successful response",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "status": {
                                                "type": "string",
                                                "example": "success"
                                            },
                                            "message": {
                                                "type": "string",
                                                "example": "Welcome to the Retail Store Success Prediction API!"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/api/predict": {
                "post": {
                    "summary": "Predict store success",
                    "description": "Predicts retail store success score based on location demographics and store characteristics",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/PredictRequest"
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "Successful prediction",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/PredictSuccessResponse"
                                    }
                                }
                            }
                        },
                        "400": {
                            "description": "Missing required field",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/ErrorResponse"
                                    }
                                }
                            }
                        },
                        "404": {
                            "description": "Invalid pincode",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/ErrorResponse"
                                    }
                                }
                            }
                        },
                        "500": {
                            "description": "Internal server error",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/ErrorResponse"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "components": {
            "schemas": {
                "PredictRequest": {
                    "type": "object",
                    "required": [
                        "pincode",
                        "area_type",
                        "competitors",
                        "employee_count",
                        "stock_availability",
                        "shoe_size"
                    ],
                    "properties": {
                        "pincode": {
                            "type": "integer",
                            "description": "Indian postal code (must exist in database)"
                        },
                        "area_type": {
                            "type": "string",
                            "description": "Type of area",
                            "enum": ["Urban", "Semi-Urban", "Rural"]
                        },
                        "competitors": {
                            "type": "integer",
                            "description": "Number of competing stores"
                        },
                        "employee_count": {
                            "type": "integer",
                            "description": "Number of employees in the store"
                        },
                        "stock_availability": {
                            "type": "integer",
                            "description": "Stock availability score"
                        },
                        "shoe_size": {
                            "oneOf": [
                                {
                                    "type": "string",
                                    "enum": ["Small", "Medium", "Large"]
                                },
                                {
                                    "type": "integer"
                                }
                            ],
                            "description": "Shoe size category or numeric value"
                        }
                    }
                },
                "PredictSuccessResponse": {
                    "type": "object",
                    "properties": {
                        "status": {
                            "type": "string",
                            "example": "success"
                        },
                        "result": {
                            "type": "object",
                            "properties": {
                                "pincode": {
                                    "type": "integer",
                                    "description": "Input pincode"
                                },
                                "area_type": {
                                    "type": "string",
                                    "description": "Input area type"
                                },
                                "market_score": {
                                    "type": "number",
                                    "description": "Normalized market potential score (0-1)"
                                },
                                "store_score": {
                                    "type": "number",
                                    "description": "Business viability score (0-1000)"
                                },
                                "demographics": {
                                    "$ref": "#/components/schemas/Demographics"
                                }
                            }
                        }
                    }
                },
                "Demographics": {
                    "type": "object",
                    "properties": {
                        "place": {
                            "type": "string",
                            "description": "Location name"
                        },
                        "total_population": {
                            "type": "integer",
                            "description": "Total population count"
                        },
                        "male_population": {
                            "type": "integer",
                            "description": "Male population count"
                        },
                        "female_population": {
                            "type": "integer",
                            "description": "Female population count"
                        },
                        "population_density": {
                            "type": "number",
                            "description": "Population density (people per sq km)"
                        },
                        "coordinates": {
                            "type": "string",
                            "description": "GPS coordinates (latitude, longitude)"
                        }
                    }
                },
                "ErrorResponse": {
                    "type": "object",
                    "properties": {
                        "error": {
                            "type": "string",
                            "description": "Error message"
                        }
                    }
                }
            }
        }
    }

    return jsonify(openapi_spec)


@app.route("/api/predict", methods=["POST"])
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
# Vercel serverless deployment: app instance is automatically detected
# Uncomment below for local development only
# if __name__ == "__main__":
#     port = int(os.environ.get("PORT", 5000))
#     app.run(host="0.0.0.0", port=port)
