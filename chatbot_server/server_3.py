from flask import Flask, request, jsonify, Response
import json
from ast import literal_eval
import qa_helper
import qa_model
from dotenv import load_dotenv
import pygsheets
import pandas as pd

load_dotenv()
# NEO4J_USERNAME = os.getenv('neo4j')
# NEO4J_PASSWORD = os.getenv('kracr')

NEO4J_USERNAME = "himanshu"
NEO4J_PASSWORD = "himanshu"

# NEO4J_USERNAME = "pankil"
# NEO4J_PASSWORD = "suzy"

qa_model.init()
qa_helper.init_kg(NEO4J_USERNAME, NEO4J_PASSWORD)
qa_helper.init_spellcheck()
app = Flask(__name__)

def send_headers():
    return {'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*',
        'Content-Type': 'application/json'
    }

@app.route('/sources', methods=['GET'])
def get_sources():
    sources = qa_helper.get_documents()
    return jsonify({'sources': sources}), 200, send_headers()

@app.route('/get_answer', methods=['POST'])
def get_answer():
    data = literal_eval(request.data.decode('utf8'))
    print("data1", data)
    gc = pygsheets.authorize(service_file='chatbot-350307-ffe9b3e1c31a.json')
    new_row = [data['query']]
    sh = gc.open('Chatbot logs')
    wks = sh[0]
    cells = wks.get_all_values(include_tailing_empty_rows=False, include_tailing_empty=False, returnas='matrix')
    last_row = len(cells)
    wks = wks.insert_rows(last_row, number=1, values=new_row)
    sentences = qa_model.find_answer(data['query'])
    return jsonify({'query':data['query'], 'sentences': sentences}), 200, send_headers()

@app.route('/get_sentence_details', methods=['POST'])
def get_sentence_details():
    data = literal_eval(request.data.decode('utf8'))
    print("data2", data)
    neighbouring_sentences, document = qa_helper.get_sentence_details(data['sentence'])
    return jsonify({'sentence': data['sentence'], 'neighbouring_sentences': neighbouring_sentences, 'document': document}), 200, send_headers()

@app.route('/get_closest_entities', methods=['POST'])
def get_closet_entities():
    data = literal_eval(request.data.decode('utf8'))
    print("data3", data)
    closest_entities = qa_helper.get_closest_entities(data['query'], data['threshold'])
    return jsonify({'query': data['query'], 'closest_entities': closest_entities}), 200, send_headers()

@app.route('/get_graph_with_neighbours', methods=['POST'])
def get_graph_entities():
    data = literal_eval(request.data.decode('utf8'))
    print("data4", data)
    nodes, edges = qa_helper.get_graph_with_neighbours(data['nodes'], data['nbr_of_nodes'])
    return jsonify({'nodes': nodes, 'edges': edges}), 200, send_headers()

@app.route('/correct_text', methods=['POST'])
def correct_text():
    data = literal_eval(request.data.decode('utf8'))
    print("data5", data)
    withoutTrailingText = qa_helper.removeTrailingCharacter(data['text'])
    corrected_text = qa_helper.spellcheck(withoutTrailingText)
    return jsonify({'corrected_text': corrected_text, 'text': withoutTrailingText}), 200, send_headers()

@app.route('/feedback', methods=['POST'])
def feedback():
    data = literal_eval(request.data.decode('utf8'))
    print("data6", data)
    gc = pygsheets.authorize(service_file='chatbot-350307-ffe9b3e1c31a.json')
    new_row = [data['question'],data['answer'],data["feedback"]]
    sh = gc.open('Chatbot logs')
    wks = sh[1]
    cells = wks.get_all_values(include_tailing_empty_rows=False, include_tailing_empty=False, returnas='matrix')
    last_row = len(cells)
    wks = wks.insert_rows(last_row, number=1, values=new_row)
    return jsonify({'success': True}), 200, send_headers()

if __name__ == '__main__':
   app.run(debug = True, port=8080)
