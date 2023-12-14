# Create the following indexes on MongoDB Atlas for product searching purposes

## 1. Create an index called `default` for the default product search

```
{
  "mappings": {
    "dynamic": true
  }
}

```
## 2. Create an index called `autoCompleteProducts`  for autocompleting words in search
```
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name": [
        {
          "foldDiacritics": false,
          "maxGrams": 7,
          "minGrams": 3,
          "tokenization": "edgeGram",
          "type": "autocomplete"
        }
      ]
    }
  }
}
```

## 3. Create an index called `vector_index` for vector/semantic search
```
{
  "type": "vectorSearch",
  "fields": [
    {
      "numDimensions": 1536,
      "path": "embedding",
      "similarity": "euclidean",
      "type": "vector"
    }
  ]
}
```