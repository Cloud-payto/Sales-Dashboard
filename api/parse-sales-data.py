from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import tempfile
import re
from io import BytesIO

# Add parent directory to path to import sales_parser
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

try:
    from sales_parser import SalesDashboardParser
except ImportError:
    # Fallback if parser not available
    SalesDashboardParser = None

def parse_multipart_form_data(data, boundary):
    """Parse multipart/form-data to extract file"""
    parts = data.split(boundary.encode())

    for part in parts:
        if b'Content-Disposition' in part and b'filename=' in part:
            # Extract filename
            filename_match = re.search(rb'filename="([^"]+)"', part)
            if filename_match:
                filename = filename_match.group(1).decode('utf-8')

                # Find the file content (after double CRLF)
                header_end = part.find(b'\r\n\r\n')
                if header_end != -1:
                    file_content = part[header_end + 4:]
                    # Remove trailing CRLF
                    if file_content.endswith(b'\r\n'):
                        file_content = file_content[:-2]
                    return filename, file_content

    return None, None

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Handle file upload and parse sales data"""
        temp_file_path = None
        try:
            # Check if parser is available
            if SalesDashboardParser is None:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                error_response = {
                    'error': 'Sales parser not available',
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

            # Parse multipart data to extract file
            filename, file_content = parse_multipart_form_data(post_data, boundary)

            if not file_content:
                raise ValueError('No file found in upload')

            # Save file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as temp_file:
                temp_file.write(file_content)
                temp_file_path = temp_file.name

            # Parse the Excel file
            parser = SalesDashboardParser(temp_file_path)
            parser.load_data()
            dashboard_data = parser.get_dashboard_summary()

            # Clean up temp file
            if temp_file_path and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                temp_file_path = None

            # Return success with parsed data
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            response = {
                'success': True,
                'message': 'File processed successfully',
                'data': dashboard_data
            }

            self.wfile.write(json.dumps(response, default=str).encode())

        except Exception as e:
            # Clean up temp file on error
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.remove(temp_file_path)
                except:
                    pass

            # Return error response
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            error_response = {
                'error': str(e),
                'message': 'Failed to process file'
            }
            self.wfile.write(json.dumps(error_response).encode())

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
