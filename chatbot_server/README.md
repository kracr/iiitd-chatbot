# chatbot_server

## To run:
1. clone iiitd_policy_chatbot and chatbot_server in the same folder.
2. Create a Neo4J database and add the 2 files in `iiitd_policy_chatbot/neo4j` to the Neo4J project.
3. Start the database and run `script.cypher` added to the Neo4J project in the previous step. This will create the knowledge graph.
4. Run command `python3 server_2.py` to start the backend.
