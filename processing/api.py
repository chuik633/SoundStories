from flask import Flask, request, jsonify
from main import getData

app = Flask(__name__)

@app.route('/getData', methods=['POST'])
def process_data():
    data = request.json
    name = data.get('name')
    numSamples = data.get('numSamples',1)
    youtubeLink = data.get('youtubeLink', False)
    captions = data.get('captions', False)
    if not name:
        return jsonify({"error": "missing name"}), 400
    try:
        getData(name, numSamples, youtubeLink, captions)
        return jsonify({"message": "YAY! we got the data :)"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)