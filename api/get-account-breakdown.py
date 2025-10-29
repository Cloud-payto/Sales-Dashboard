from http.server import BaseHTTPRequestHandler
import json
import os
import sys
import tempfile

# Add parent directory to path to import our parser
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sales_comparison_parser import SalesComparisonParser

def clean_nan_values(obj):
    """Recursively clean NaN values from nested dictionaries and lists"""
    import pandas as pd

    if isinstance(obj, dict):
        return {key: clean_nan_values(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [clean_nan_values(item) for item in obj]
    elif pd and pd.isna(obj):
        return None
    elif isinstance(obj, float):
        if str(obj) == 'nan' or obj != obj:  # NaN != NaN is True
            return None
        return obj
    return obj

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET request to get account color group breakdown"""
        # CORS headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

        try:
            # Parse query parameters
            from urllib.parse import urlparse, parse_qs
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)

            account_number = query_params.get('account_number', [None])[0]

            if not account_number:
                raise ValueError("Missing account_number query parameter")

            account_number = int(account_number)

            # Get file paths from environment or use defaults
            # Note: In production, these should come from the uploaded files
            # For now, we'll return empty data structure
            # This will be populated when the frontend uploads files

            response_data = {
                'account_number': account_number,
                'color_groups_cy': [],
                'color_groups_py': [],
                'total_units_cy': 0,
                'total_units_py': 0,
                'error': 'Account breakdown requires uploaded comparison files'
            }

            # Clean and return
            response_data = clean_nan_values(response_data)
            self.wfile.write(json.dumps(response_data).encode())

        except Exception as e:
            error_response = {
                'error': str(e),
                'message': 'Failed to get account breakdown'
            }
            self.wfile.write(json.dumps(error_response).encode())

    def do_OPTIONS(self):
        """Handle OPTIONS request for CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
