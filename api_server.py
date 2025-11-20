"""
Sales Dashboard Parser API Server

Flask-based REST API for parsing Excel sales data and returning JSON results.
Designed to be called by n8n workflows or other automation tools.
"""

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import os
import json
from datetime import datetime
from sales_parser import SalesDashboardParser
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
EXCEL_FILE_PATH = 'Payton YOY 8-18-24 to 8-19-25.xlsx'
OUTPUT_DIR = 'api_output'

# Create output directory if it doesn't exist
os.makedirs(OUTPUT_DIR, exist_ok=True)


@app.route('/')
def home():
    """API home endpoint with available routes"""
    return jsonify({
        'name': 'Sales Dashboard Parser API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'POST /parse-excel': 'Parse Excel file and return complete dashboard data',
            'GET /data': 'Get the most recent parsed dashboard data',
            'GET /data/summary': 'Get summary metrics only',
            'GET /data/accounts': 'Get account data (declining, increasing, new, reactivated)',
            'GET /data/frames': 'Get frame performance data',
            'GET /data/brands': 'Get brand performance data',
            'GET /data/insights': 'Get actionable insights',
            'GET /files/declining-accounts': 'Download declining accounts CSV',
            'GET /files/increasing-accounts': 'Download increasing accounts CSV',
            'GET /files/new-accounts': 'Download new accounts CSV',
            'GET /files/brand-performance': 'Download brand performance JSON',
            'GET /health': 'Health check endpoint'
        }
    })


@app.route('/health')
def health():
    """Health check endpoint"""
    excel_exists = os.path.exists(EXCEL_FILE_PATH)

    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'excel_file_exists': excel_exists,
        'excel_file_path': EXCEL_FILE_PATH
    })


@app.route('/parse-excel', methods=['POST'])
def parse_excel():
    """
    Main endpoint to parse the Excel file and return complete dashboard data

    Optional JSON body parameters:
    - excel_path: Custom path to Excel file (defaults to configured path)
    - include_details: Boolean to include detailed account lists (default: True)

    Returns:
        JSON with complete dashboard data including:
        - summary metrics
        - account lists (declining, increasing, new, reactivated)
        - frame performance
        - brand performance
        - insights
    """
    try:
        # Get optional parameters from request
        data = request.get_json() if request.is_json else {}
        excel_path = data.get('excel_path', EXCEL_FILE_PATH)
        include_details = data.get('include_details', True)

        # Check if Excel file exists
        if not os.path.exists(excel_path):
            return jsonify({
                'error': 'Excel file not found',
                'path': excel_path
            }), 404

        # Initialize parser
        parser = SalesDashboardParser(excel_path)

        # Load and parse data
        parser.load_data()

        # Get complete dashboard summary
        dashboard_data = parser.get_dashboard_summary()

        # Optionally limit details to reduce response size
        if not include_details:
            # Keep only top 5 of each list
            if 'accounts' in dashboard_data:
                dashboard_data['accounts']['top_declining'] = dashboard_data['accounts']['top_declining'][:5]
                dashboard_data['accounts']['top_increasing'] = dashboard_data['accounts']['top_increasing'][:5]
                dashboard_data['accounts']['new_accounts'] = dashboard_data['accounts']['new_accounts'][:5]
                dashboard_data['accounts']['reactivated_accounts'] = dashboard_data['accounts']['reactivated_accounts'][:5]

        # Save to file for persistence
        output_file = os.path.join(OUTPUT_DIR, 'latest_dashboard_data.json')
        with open(output_file, 'w') as f:
            json.dump(dashboard_data, f, indent=2, default=str)

        # Add metadata
        response = {
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'excel_file': excel_path,
            'data': dashboard_data
        }

        return jsonify(response)

    except Exception as e:
        error_trace = traceback.format_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': error_trace,
            'timestamp': datetime.now().isoformat()
        }), 500


@app.route('/data', methods=['GET'])
def get_data():
    """Get the most recently parsed dashboard data"""
    try:
        data_file = os.path.join(OUTPUT_DIR, 'latest_dashboard_data.json')

        if not os.path.exists(data_file):
            return jsonify({
                'error': 'No data available. Please call POST /parse-excel first.'
            }), 404

        with open(data_file, 'r') as f:
            data = json.load(f)

        return jsonify({
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'data': data
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/data/summary', methods=['GET'])
def get_summary():
    """Get summary metrics only"""
    try:
        data_file = os.path.join(OUTPUT_DIR, 'latest_dashboard_data.json')

        if not os.path.exists(data_file):
            return jsonify({
                'error': 'No data available. Please call POST /parse-excel first.'
            }), 404

        with open(data_file, 'r') as f:
            data = json.load(f)

        return jsonify({
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'summary': data.get('summary', {})
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/data/accounts', methods=['GET'])
def get_accounts():
    """Get account data (declining, increasing, new, reactivated)"""
    try:
        data_file = os.path.join(OUTPUT_DIR, 'latest_dashboard_data.json')

        if not os.path.exists(data_file):
            return jsonify({
                'error': 'No data available. Please call POST /parse-excel first.'
            }), 404

        with open(data_file, 'r') as f:
            data = json.load(f)

        # Optional query parameters for filtering
        limit = request.args.get('limit', type=int)
        account_type = request.args.get('type')  # 'declining', 'increasing', 'new', 'reactivated'

        accounts = data.get('accounts', {})

        # Filter by type if specified
        if account_type:
            if account_type == 'declining':
                accounts = {'top_declining': accounts.get('top_declining', [])}
            elif account_type == 'increasing':
                accounts = {'top_increasing': accounts.get('top_increasing', [])}
            elif account_type == 'new':
                accounts = {'new_accounts': accounts.get('new_accounts', [])}
            elif account_type == 'reactivated':
                accounts = {'reactivated_accounts': accounts.get('reactivated_accounts', [])}

        # Apply limit if specified
        if limit:
            for key in accounts:
                if isinstance(accounts[key], list):
                    accounts[key] = accounts[key][:limit]

        return jsonify({
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'accounts': accounts
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/data/frames', methods=['GET'])
def get_frames():
    """Get frame performance data"""
    try:
        data_file = os.path.join(OUTPUT_DIR, 'latest_dashboard_data.json')

        if not os.path.exists(data_file):
            return jsonify({
                'error': 'No data available. Please call POST /parse-excel first.'
            }), 404

        with open(data_file, 'r') as f:
            data = json.load(f)

        return jsonify({
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'frames': data.get('frames', {})
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/data/brands', methods=['GET'])
def get_brands():
    """Get brand performance data"""
    try:
        data_file = os.path.join(OUTPUT_DIR, 'latest_dashboard_data.json')

        if not os.path.exists(data_file):
            return jsonify({
                'error': 'No data available. Please call POST /parse-excel first.'
            }), 404

        with open(data_file, 'r') as f:
            data = json.load(f)

        # Optional query parameter for top N brands
        limit = request.args.get('limit', type=int)

        brands = data.get('brands', {})

        if limit and 'brands' in brands:
            brands['brands'] = brands['brands'][:limit]

        return jsonify({
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'brands': brands
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/data/insights', methods=['GET'])
def get_insights():
    """Get actionable insights"""
    try:
        data_file = os.path.join(OUTPUT_DIR, 'latest_dashboard_data.json')

        if not os.path.exists(data_file):
            return jsonify({
                'error': 'No data available. Please call POST /parse-excel first.'
            }), 404

        with open(data_file, 'r') as f:
            data = json.load(f)

        return jsonify({
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'insights': data.get('insights', [])
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/files/declining-accounts', methods=['GET'])
def download_declining_accounts():
    """Download declining accounts CSV"""
    csv_file = 'declining_accounts.csv'
    if not os.path.exists(csv_file):
        return jsonify({
            'error': 'File not found. Please run POST /parse-excel first.'
        }), 404

    return send_file(csv_file, mimetype='text/csv', as_attachment=True)


@app.route('/files/increasing-accounts', methods=['GET'])
def download_increasing_accounts():
    """Download increasing accounts CSV"""
    csv_file = 'increasing_accounts.csv'
    if not os.path.exists(csv_file):
        return jsonify({
            'error': 'File not found. Please run POST /parse-excel first.'
        }), 404

    return send_file(csv_file, mimetype='text/csv', as_attachment=True)


@app.route('/files/new-accounts', methods=['GET'])
def download_new_accounts():
    """Download new accounts CSV"""
    csv_file = 'new_accounts.csv'
    if not os.path.exists(csv_file):
        return jsonify({
            'error': 'File not found. Please run POST /parse-excel first.'
        }), 404

    return send_file(csv_file, mimetype='text/csv', as_attachment=True)


@app.route('/files/brand-performance', methods=['GET'])
def download_brand_performance():
    """Download brand performance JSON"""
    json_file = 'brand_performance.json'
    if not os.path.exists(json_file):
        return jsonify({
            'error': 'File not found. Please run POST /parse-excel first.'
        }), 404

    return send_file(json_file, mimetype='application/json', as_attachment=True)


if __name__ == '__main__':
    print("\n" + "="*70)
    print("SALES DASHBOARD PARSER API SERVER".center(70))
    print("="*70)
    print(f"\nStarting API server on http://localhost:3000")
    print(f"Excel file: {EXCEL_FILE_PATH}")
    print(f"Output directory: {OUTPUT_DIR}")
    print("\nAvailable endpoints:")
    print("  POST   http://localhost:3000/parse-excel")
    print("  GET    http://localhost:3000/data")
    print("  GET    http://localhost:3000/data/summary")
    print("  GET    http://localhost:3000/data/accounts")
    print("  GET    http://localhost:3000/data/frames")
    print("  GET    http://localhost:3000/data/brands")
    print("  GET    http://localhost:3000/data/insights")
    print("  GET    http://localhost:3000/health")
    print("\nReady for n8n workflow integration!")
    print("="*70 + "\n")

    app.run(host='0.0.0.0', port=3000, debug=True)
