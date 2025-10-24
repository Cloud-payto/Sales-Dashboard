from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import tempfile
import re
from io import BytesIO
from datetime import datetime

# Add parent directory to path to import sales_parser
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

try:
    from sales_comparison_parser import SalesComparisonParser
    import pandas as pd
except ImportError:
    # Fallback if parser not available
    SalesComparisonParser = None
    pd = None

def parse_multipart_form_data(data, boundary):
    """Parse multipart/form-data to extract BOTH files"""
    parts = data.split(boundary.encode())
    files = {}

    for part in parts:
        if b'Content-Disposition' in part and b'filename=' in part:
            # Extract field name
            name_match = re.search(rb'name="([^"]+)"', part)
            # Extract filename
            filename_match = re.search(rb'filename="([^"]+)"', part)

            if name_match and filename_match:
                field_name = name_match.group(1).decode('utf-8')
                filename = filename_match.group(1).decode('utf-8')

                # Find the file content (after double CRLF)
                header_end = part.find(b'\r\n\r\n')
                if header_end != -1:
                    file_content = part[header_end + 4:]
                    # Remove trailing CRLF
                    if file_content.endswith(b'\r\n'):
                        file_content = file_content[:-2]

                    files[field_name] = {
                        'filename': filename,
                        'content': file_content
                    }

    return files

def clean_nan_values(obj):
    """Recursively clean NaN values from nested dictionaries and lists"""
    if isinstance(obj, dict):
        return {key: clean_nan_values(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [clean_nan_values(item) for item in obj]
    elif pd and pd.isna(obj):
        return None
    elif isinstance(obj, float):
        # Check if it's NaN using string comparison as fallback
        if str(obj) == 'nan' or obj != obj:  # NaN != NaN is True
            return None
        return obj
    else:
        return obj

def json_serializer(obj):
    """Custom JSON serializer to handle pandas types and datetime objects"""
    if pd and pd.isna(obj):
        return None  # Convert NaN to null
    if isinstance(obj, (datetime,)):
        return obj.isoformat()
    return str(obj)

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Handle TWO file uploads and parse sales comparison data"""
        previous_year_temp = None
        current_year_temp = None
        try:
            # Check if parser is available
            if SalesComparisonParser is None:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                error_response = {
                    'error': 'Sales comparison parser not available',
                    'message': 'Parser module could not be imported'
                }
                self.wfile.write(json.dumps(error_response).encode())
                return

            # Get content type and boundary
            content_type = self.headers.get('Content-Type', '')
            if 'multipart/form-data' not in content_type:
                raise ValueError('Expected multipart/form-data')

            # Extract boundary
            boundary_match = re.search(r'boundary=([^;]+)', content_type)
            if not boundary_match:
                raise ValueError('No boundary found in Content-Type')

            boundary = '--' + boundary_match.group(1)

            # Read the uploaded file data
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            # Parse multipart data to extract BOTH files
            files = parse_multipart_form_data(post_data, boundary)

            if 'previousYearFile' not in files or 'currentYearFile' not in files:
                raise ValueError('Both previousYearFile and currentYearFile are required')

            # Save previous year file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix='_py.xlsx') as temp_file:
                temp_file.write(files['previousYearFile']['content'])
                previous_year_temp = temp_file.name

            # Save current year file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix='_cy.xlsx') as temp_file:
                temp_file.write(files['currentYearFile']['content'])
                current_year_temp = temp_file.name

            # Parse BOTH Excel files with comparison parser
            parser = SalesComparisonParser(previous_year_temp, current_year_temp)
            parser.load_data()
            dashboard_data = parser.get_complete_comparison_summary()

            # Clean NaN values from the data
            dashboard_data = clean_nan_values(dashboard_data)

            # Clean up temp files
            if previous_year_temp and os.path.exists(previous_year_temp):
                os.remove(previous_year_temp)
                previous_year_temp = None
            if current_year_temp and os.path.exists(current_year_temp):
                os.remove(current_year_temp)
                current_year_temp = None

            # Return success with parsed data
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            response = {
                'success': True,
                'message': 'Files processed successfully with brand-level comparison',
                'data': dashboard_data
            }

            self.wfile.write(json.dumps(response, default=json_serializer).encode())

        except Exception as e:
            # Clean up temp files on error
            if previous_year_temp and os.path.exists(previous_year_temp):
                try:
                    os.remove(previous_year_temp)
                except:
                    pass
            if current_year_temp and os.path.exists(current_year_temp):
                try:
                    os.remove(current_year_temp)
                except:
                    pass

            # Return error response
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            error_response = {
                'error': str(e),
                'message': 'Failed to process files'
            }
            self.wfile.write(json.dumps(error_response).encode())

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
