from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/process-image', methods=['POST'])
def process_image():
    # Just return a test response
    return jsonify({
        'message': 'Test detection - Server received the image',
        'isSafe': True
    })

if __name__ == '__main__':
    app.run(debug=True)
