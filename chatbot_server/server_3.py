from flask import Flask, request
import json
from ast import literal_eval
import qa_helper
import qa_model
from dotenv import load_dotenv

load_dotenv()
# NEO4J_USERNAME = os.getenv('neo4j')
# NEO4J_PASSWORD = os.getenv('kracr')

NEO4J_USERNAME = "himanshu"
NEO4J_PASSWORD = "himanshu"

qa_model.init()
qa_helper.init_kg(NEO4J_USERNAME, NEO4J_PASSWORD)
qa_helper.init_spellcheck()
app = Flask(__name__)

@app.route('/get_answer', methods=['POST'])
def get_answer():
    data = literal_eval(request.data.decode('utf8'))
    sentences = qa_model.find_answer(data['query'])
    return json.dumps({'query':data['query'], 'sentences': sentences}).encode('utf-8')

if __name__ == '__main__':
   app.run(debug = True, port=8080)
