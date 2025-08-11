# How to use Vector Store
----

You can directly query the store using the api

for example:

```sh
curl --location 'http://[YOUR_BASEURL]/api/vector-stores/[STORE_ID]/search' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer [PAT]' \
--data '{
    "query": "[YOUR_QUESTION]"
}'
```

or you can create an MCP Server for the store and add it either to a Qarin.Ai Agent, or you can use it with any other external MCP Client usinge the MCP Server's URL

for full api documentation click <a href="/api/documentation#/VectorStore/VectorStoreController_searchVectorStore" target="_blank">here</a>
