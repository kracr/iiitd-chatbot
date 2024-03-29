# -*- coding: utf-8 -*-
"""bm25_bert.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1gGMMyFBKSJvZNuYsNRGcewX76rpctCOI

Importing required modules
"""

import nltk
import itertools
import os
from gensim.summarization.bm25 import BM25
from transformers import AutoTokenizer, AutoModelForQuestionAnswering, QuestionAnsweringPipeline
import json
import spacy
import math
from nltk.corpus import stopwords  
from nltk.tokenize import word_tokenize
from collections import defaultdict
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer, util
from qa_helper import KnowledgeGraph

class bm25:

    def __init__(self, nlp):
        self.tokenize = lambda text: [token.lemma_ for token in nlp(text)]
        self.bm25 = None
        self.passages = None

    def preprocess(self, doc):
        passages = [p for p in doc.split('\n') if p and not p.startswith('=')]
        return passages

    def fit(self, docs):
        # passages = list(itertools.chain(*map(self.preprocess, docs)))
        corpus = [self.tokenize(p) for p in passages]
        self.bm25 = BM25(corpus)
        self.passages = passages

    def most_similar(self, question, topn=10):
        tokens = self.tokenize(question)
        # average_idf = sum(map(lambda k: float(self.bm25.idf[k]), self.bm25.idf.keys())) / len(self.bm25.idf.keys())
        scores = self.bm25.get_scores(tokens)
        pairs = [(s, i) for i, s in enumerate(scores)]
        pairs.sort(reverse=True)
        passages = [self.passages[i] for _, i in pairs[:topn]]
        return passages
    
    def rankDocuments(self, query):
        tokens = self.tokenize(query)
        # average_idf = sum(map(lambda k: float(self.bm25.idf[k]), self.bm25.idf.keys())) / len(self.bm25.idf.keys())
        scores = self.bm25.get_scores(tokens)
        return np.array([s for i,s in enumerate(scores)]).reshape((1,133))

class tfidf:

  def __init__(self, nlp):
    self.nlp = nlp
    self.tfidf_model = None
    self.documents = None

  def processSentence(self, sentence):
    sentence = sentence.lower() #Lowering sentences

    #Removing punctuations
    symbols = "!\"#$%&()*+-./:;<=>?@[\]^_`{|}~\n"
    sentence = sentence.translate(str.maketrans(symbols,' '*len(symbols)))

    #removing stopwords
    stop_words = set(stopwords.words('english')) 
    word_tokens = word_tokenize(sentence)  
    filtered_sentence = " ".join([w for w in word_tokens if w not in stop_words and len(w) > 1])

    #lemmatization
    doc = self.nlp(filtered_sentence)
    lemmatized_sentence = [t.lemma_ for t in doc]
    
    return lemmatized_sentence

  def preprocessDocument(self, passages):
    vocabulary = set()
    processed_passages = list()

    for p in range(len(passages)):
      lemmatized_sentence = self.processSentence(passages[p])
      processed_passages.append(" ".join(lemmatized_sentence))
      vocabulary.update(set(lemmatized_sentence))
    
    self.tfidf_model = TfidfVectorizer(vocabulary = list(vocabulary))
    self.documents = self.tfidf_model.fit_transform(processed_passages)
  
  def rankDocuments(self, query):
    query = " ".join(self.processSentence(query))
    queryVector = self.tfidf_model.transform([query])
    return np.transpose(cosine_similarity(self.documents, queryVector))

class sbert:

  def __init__(self):
    self.model = SentenceTransformer('msmarco-distilroberta-base-v2')
    self.document = None

  def fit(self, docs):
    self.document = self.model.encode(docs)
  
  def rankDocuments(self, query):
    query_encoded = self.model.encode(query)
    return util.pytorch_cos_sim(query_encoded, self.document).numpy()

class rerankPassages:

  def __init__(self, nlp):
    self.bm25_ranking = bm25(nlp)
    self.tfidf_ranking = tfidf(nlp)
    self.sbert_ranking = sbert()
    self.document = None
  
  def fit(self, document):
    self.document = document
    self.bm25_ranking.fit(document)
    self.tfidf_ranking.preprocessDocument(document)
    self.sbert_ranking.fit(document)
  
  def rankDocuments(self, query, mu, k):
    bm25_scores = self.bm25_ranking.rankDocuments(query)
    tfidf_scores = self.tfidf_ranking.rankDocuments(query)
    sbert_scores = self.sbert_ranking.rankDocuments(query)

    #Combined scoring
    # mu = 0.7
    # k = 10
    c = mu*sbert_scores + (1-mu)*tfidf_scores
    # rrf = 1/(k+c) + 1/(k + bm25_scores)
    rrf = c
    # print(rrf)
    # print(np.shape(rrf))
    #retrive top k passages
    scores = rrf.tolist()
    print(len(scores[0]))
    score_passage = [(s,i) for i, s in enumerate(scores[0])]
    score_passage.sort(reverse = True)
    return [self.document[i[1]] for i in score_passage[:3]]

class bert:

  def __init__(self, model):
    self.tokenizer = AutoTokenizer.from_pretrained(model)
    self.model = AutoModelForQuestionAnswering.from_pretrained(model)
    self.bert = QuestionAnsweringPipeline(model = self.model, tokenizer = self.tokenizer)
  
  def evaluateAnswer(self, question, sentence):
    answer = self.bert(question = question, context = sentence)
    return answer

def completeAnswer(answer, para):
  for p in para:
    if answer in p:
      return p
  return None

def getTopics(filename):
  with open(filename) as file:
    data = json.load(file)
  topics = ['' for i in range(len(data["vertices"]["topics"]))]
  edges = data["edges"]["main"]
  count = 0
  # print(edges)
  for e in edges:
    if e[1] == "about_concept":
      # print(e)
      topic_id = int(str(e[2])[2:])
      para_id = int(str(e[0])[2:])
      # print(topic_id, para_id)
      topics[topic_id] += data["vertices"]["paragraphs"][para_id]["text"]
      count += 1
  return topics

def getPassages(filename):
    with open(filename) as file:
        data = json.load(file)
    passages = list()
    for i in data["vertices"]["paragraphs"]:
      passages.append(i["text"])
    return passages

passages = getPassages("../data/handbook_graph.json")
print(len(passages))

SPACY_MODEL = os.environ.get("SPACY_MODEL", "en_core_web_sm")
nlp = spacy.load(SPACY_MODEL, disable = ["ner","parser","textcat"])

retreivePassage = rerankPassages(nlp)
retreivePassage.fit(passages)

questions = [
             "How do I calculate cgpa",
             "What is the normal load for UG students",
             "If I fail a course and take it again in the later semester, will my earlier course with F grade be removed from the transcript",
            " what is the process of registration?",
            "how many seats are there in cse for admission?",
             " what is the admission criteria for btech",
             "I am in 1st year. Can I take overload?",
             "I am in 2nd year. Can I take overload?",
             "what happens if I miss the endsem because of a medical reason?",
             "what happens if I fail a course?",
             " what happens if I get an F grade in a course?",
             "How can I calculate sgpa",
             "What if I pass all my semesters",
             "What about canteen",
             "Will I get hostel",
             "I dont know anything about IIIT",
             "Who was abraham lincoln",
             "Can i take 8 credits of online courses in a semester",
             "how many credits do i need to graduate",
             "how is my semester graded",
             "what if I do more than 156 credits in my btech course",
             "can I take up internships during a semester?",
              "what is the i grade",
              "can I replace a core course on getting an F grade?",
              "how can I get the grade given to me in a course changed?",
              "how will my cgpa be computed if I do more than 156 credits?",
              "is there any rule for attendance?",
              "how can I apply for a semester leave?",
              "how can I apply for branch transfer from ece to cse",
              "what is the minimum credit requirement for graduation?",
              "what are the requirements to get an honors degree?",
              "when is the convocation held?"
]
for q in questions:
  print(q,"\n",retreivePassage.rankDocuments(q, 0.5,50))


# SPACY_MODEL = os.environ.get("SPACY_MODEL", "en_core_web_sm")
# nlp = spacy.load(SPACY_MODEL, disable = ["ner","parser","textcat"])
# retreivePassage = PassageRetrieval(nlp)
# retreivePassage.fit(passages)
# bertModel = bert("deepset/bert-base-cased-squad2")

# questions = [
#              "How do I calculate cgpa",
#              "What is the normal load for UG students",
#              "If I fail a course and take it again in the later semester, will my earlier course with F grade be removed from the transcript",
#             " what is the process of registration?",
#             "how many seats are there in cse for admission?",
#              " what is the admission criteria for btech",
#              "I am in 1st year. Can I take overload?",
#              "I am in 2nd year. Can I take overload?",
#              "what happens if I miss the endsem because of a medical reason?",
#              "what happens if I fail a course?",
#              " what happens if I get an F grade in a course?",
#              "How can I calculate sgpa",
#              "What if I pass all my semesters",
#              "What about canteen",
#              "Will I get hostel",
#              "I dont know anything about IIIT",
#              "Who was abraham lincoln",
#              "Can i take 8 credits of online courses in a semester",
#              "how many credits do i need to graduate",
#              "how is my semester graded",
#              "what if I do more than 156 credits in my btech course",
#              "can I take up internships during a semester?",
#               "what is the i grade",
#               "can I replace a core course on getting an F grade?",
#               "how can I get the grade given to me in a course changed?",
#               "how will my cgpa be computed if I do more than 156 credits?",
#               "is there any rule for attendance?",
#               "how can I apply for a semester leave?",
#               "how can I apply for branch transfer from ece to cse",
#               "what is the minimum credit requirement for graduation?",
#               "what are the requirements to get an honors degree?",
#               "when is the convocation held?"
# ]

# for q in questions:
#   topAnswer = retreivePassage.rankDocuments(q, 0.5, 20)
#   # print(topAnswer)
#   sentence = ""
#   for i in topAnswer:
#     # print(i)
#     sentence += i + " "
#   ans = bertModel.evaluateAnswer(q, sentence)
#   print(len(sentence.split()))
#   print("Q:",q)
#   print("Ans:",ans,completeAnswer(ans["answer"], topAnswer))
#   # print(len(sentence.split()))
#   print("---------------------")