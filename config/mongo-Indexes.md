# Indexes on MongoDB Atlas

## 1. default index for product search

```
default

{
  "mappings": {
    "dynamic": true
  }
}

```
## 2. index for autocompletion of product search
```
autoCompleteProducts

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

## 3. index for vector search
```
vector_index

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