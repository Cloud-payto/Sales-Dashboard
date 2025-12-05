"""
Claude AI Chat API Endpoint

Vercel serverless function for handling chat requests with Claude API.
Uses the Anthropic SDK to communicate with Claude models.
"""

from http.server import BaseHTTPRequestHandler
import json
import os

# Store import error for debugging
import_error = None
anthropic_client = None

try:
    import anthropic
    # Initialize the client - uses ANTHROPIC_API_KEY env var automatically
    anthropic_client = anthropic.Anthropic()
except ImportError as e:
    import_error = str(e)


SYSTEM_PROMPT = """You are a helpful AI assistant integrated into a Sales Dashboard application.
You help users understand their sales data, analyze trends, and provide insights.

The dashboard contains:
- Sales performance metrics (current vs previous year)
- Account analysis (declining, increasing, new, reactivated accounts)
- Brand performance data
- Territory/route management
- City-level sales insights

When users ask questions:
- Be concise and actionable
- Reference specific metrics when relevant
- Suggest next steps or areas to investigate
- If asked about data you don't have access to, explain what information would be helpful

Keep responses focused and practical for a sales professional."""


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Handle chat message requests"""
        try:
            # Check if anthropic is available
            if anthropic_client is None:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                error_response = {
                    'error': 'Anthropic SDK not available',
                    'message': 'The anthropic package could not be imported',
                    'import_error': import_error
                }
                self.wfile.write(json.dumps(error_response).encode())
                return

            # Read and parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))

            # Extract messages from request
            messages = data.get('messages', [])

            if not messages:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                self.wfile.write(json.dumps({
                    'error': 'No messages provided',
                    'message': 'Request must include a "messages" array'
                }).encode())
                return

            # Optional: Get context about current dashboard state
            context = data.get('context', {})

            # Build system prompt with optional context
            system = SYSTEM_PROMPT
            if context:
                system += f"\n\nCurrent dashboard context:\n{json.dumps(context, indent=2)}"

            # Call Claude API
            response = anthropic_client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=system,
                messages=messages
            )

            # Extract the text response
            assistant_message = ""
            for block in response.content:
                if hasattr(block, 'text'):
                    assistant_message += block.text

            # Return success response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            self.wfile.write(json.dumps({
                'success': True,
                'message': assistant_message,
                'usage': {
                    'input_tokens': response.usage.input_tokens,
                    'output_tokens': response.usage.output_tokens
                }
            }).encode())

        except json.JSONDecodeError as e:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            self.wfile.write(json.dumps({
                'error': 'Invalid JSON',
                'message': str(e)
            }).encode())

        except anthropic.APIError as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            self.wfile.write(json.dumps({
                'error': 'Claude API error',
                'message': str(e)
            }).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            self.wfile.write(json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            }).encode())

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
