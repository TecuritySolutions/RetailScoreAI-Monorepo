"""
Flask API Key Authentication Middleware

This middleware validates API keys sent in the X-API-Key header
to secure the Flask ML prediction service.

Usage:
    from middleware.auth import require_api_key

    @app.route('/api/predict', methods=['POST'])
    @require_api_key
    def predict():
        # Your endpoint code here
        pass
"""

from functools import wraps
from flask import request, jsonify
import os


def require_api_key(f):
    """
    Decorator to require API key authentication for Flask endpoints

    The decorator checks for X-API-Key header and validates it against
    the API_KEY environment variable.

    Args:
        f: The Flask view function to protect

    Returns:
        The wrapped function with API key validation

    Example:
        @app.route('/api/predict', methods=['POST'])
        @require_api_key
        def predict():
            return jsonify({'result': 'success'})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get API key from request headers
        api_key = request.headers.get('X-API-Key')

        # Get expected API key from environment
        expected_key = os.getenv('API_KEY')

        # Check if API key is provided
        if not api_key:
            return jsonify({
                'error': 'Missing API key',
                'message': 'Include X-API-Key header in your request'
            }), 401

        # Validate API key
        if api_key != expected_key:
            # Log failed attempt (optional - add logging if needed)
            print(f"[Auth] Invalid API key attempt from {request.remote_addr}")

            return jsonify({
                'error': 'Invalid API key',
                'message': 'The provided API key is not valid'
            }), 401

        # API key is valid, proceed with the request
        return f(*args, **kwargs)

    return decorated_function


def validate_api_key_middleware():
    """
    Flask before_request middleware to validate API key on all requests

    To use this as global middleware, add to your Flask app:
        app.before_request(validate_api_key_middleware)

    Note: This will apply to ALL routes. For selective protection,
    use the @require_api_key decorator instead.
    """
    # Skip validation for health check endpoint
    if request.path == '/' or request.path == '/health':
        return None

    api_key = request.headers.get('X-API-Key')
    expected_key = os.getenv('API_KEY')

    if not api_key or api_key != expected_key:
        return jsonify({
            'error': 'Unauthorized',
            'message': 'Valid API key required'
        }), 401

    return None
