MATCH ()-[r]->() 
DELETE r;

MATCH (n)
DELETE n;

CALL apoc.load.json('http://localhost:11001/project-671bad4a-f262-4e36-813f-a06e0e3c586e/iiit_website_graph.json') 
YIELD value
UNWIND value['vertices']['documents'] AS u
MERGE (v:Document{id: u.id})
SET v.text = u.text
SET v.source = u.source;

CALL apoc.load.json('http://localhost:11001/project-671bad4a-f262-4e36-813f-a06e0e3c586e/iiit_website_graph.json') 
YIELD value
UNWIND value['vertices']['topics'] AS u
MERGE (v:Topic{id: u.id})
SET v.text = u.text
SET v.keywords = u.keywords
SET v.tags = u.tags;

CALL apoc.load.json('http://localhost:11001/project-671bad4a-f262-4e36-813f-a06e0e3c586e/iiit_website_graph.json') 
YIELD value
UNWIND value['vertices']['paragraphs'] AS u
MERGE (v:Paragraph{id: u.id})
SET v.text = u.text;

CALL apoc.load.json('http://localhost:11001/project-671bad4a-f262-4e36-813f-a06e0e3c586e/iiit_website_graph.json') 
YIELD value
UNWIND value['vertices']['sentences'] AS u
MERGE (v:Sentence{id: u.id})
SET v.text = u.text
SET v.stemmed_tokens = u.stemmed_tokens;

CALL apoc.load.json('http://localhost:11001/project-671bad4a-f262-4e36-813f-a06e0e3c586e/iiit_website_graph.json') 
YIELD value
UNWIND value['vertices']['extractions'] AS u
MERGE (v:Extraction{id: u.id});

CALL apoc.load.json('http://localhost:11001/project-671bad4a-f262-4e36-813f-a06e0e3c586e/iiit_website_graph.json') 
YIELD value
UNWIND value['vertices']['entities'] AS u
MERGE (v:ExtEntity{id: u.id})
SET v.text = u.text
SET v.tags = u.tags
SET v.tokens = u.tokens;


CALL apoc.load.json('http://localhost:11001/project-671bad4a-f262-4e36-813f-a06e0e3c586e/iiit_website_graph.json') 
YIELD value
UNWIND [x IN value['edges']['main'] WHERE x[1] = 'from_document'] AS e
MATCH (u{id:e[0]}), (v{id:e[2]})
MERGE((u)-[r:from_document]->(v));

CALL apoc.load.json('http://localhost:11001/project-671bad4a-f262-4e36-813f-a06e0e3c586e/iiit_website_graph.json') 
YIELD value
UNWIND [x IN value['edges']['main'] WHERE x[1] = 'about_concept'] AS e
MATCH (u{id:e[0]}), (v{id:e[2]})
MERGE((u)-[r:about_topic]->(v));

CALL apoc.load.json('http://localhost:11001/project-671bad4a-f262-4e36-813f-a06e0e3c586e/iiit_website_graph.json') 
YIELD value
UNWIND [x IN value['edges']['main'] WHERE x[1] = 'contains_sentence'] AS e
MATCH (u{id:e[0]}), (v{id:e[2]})
MERGE((u)-[r:contains_sentence]->(v));

CALL apoc.load.json('http://localhost:11001/project-671bad4a-f262-4e36-813f-a06e0e3c586e/iiit_website_graph.json') 
YIELD value
UNWIND [x IN value['edges']['main'] WHERE x[1] = 'contains_extraction'] AS e
MATCH (u{id:e[0]}), (v{id:e[2]})
MERGE((u)-[r:contains_extraction]->(v));

CALL apoc.load.json('http://localhost:11001/project-671bad4a-f262-4e36-813f-a06e0e3c586e/iiit_website_graph.json') 
YIELD value
UNWIND [x IN value['edges']['subjects']] AS e
MATCH (u{id:e[0]}), (v{id:e[2]})
MERGE ((u)-[r:subject]->(v));

CALL apoc.load.json('http://localhost:11001/project-671bad4a-f262-4e36-813f-a06e0e3c586e/iiit_website_graph.json') 
YIELD value
UNWIND [x IN value['edges']['relations']] AS e
MATCH (u{id:e[0]}), (v{id:e[2]})
MERGE ((u)-[r:relation{text:e[1], synsets: e[3]}]->(v));

CALL apoc.load.json('http://localhost:11001/project-671bad4a-f262-4e36-813f-a06e0e3c586e/iiit_website_graph.json') 
YIELD value
UNWIND [x IN value['edges']['modifiers']] AS e
MATCH (u{id:e[0]}), (v{id:e[2]})
MERGE ((u)-[r:modifier{text:e[1]}]->(v));

CALL apoc.load.json('http://localhost:11001/project-671bad4a-f262-4e36-813f-a06e0e3c586e/iiit_website_graph.json') 
YIELD value
UNWIND [x IN value['edges']['subject_modifiers']] AS e
MATCH (u{id:e[0]}), (v{id:e[2]})
MERGE ((u)-[r:subject_modifier{text:e[1]}]->(v));
                                
CALL apoc.load.json('http://localhost:11001/project-671bad4a-f262-4e36-813f-a06e0e3c586e/iiit_website_graph.json') 
YIELD value
UNWIND [x IN value['edges']['main'] WHERE x[1] = 'about_entity'] AS e
MATCH (u{id:e[0]}), (v{id:e[2]})
MERGE((u)-[r:about_entity]->(v));

MATCH (s:Sentence)-[*]->(e:ExtEntity)
MERGE ((s)-[r:about_entity]->(e));

MATCH (s:Sentence)-[*]->(e:ExtEntity)
WITH e, count(s) as doc_freq
SET e.idf = 1/log(doc_freq + 1.0);
