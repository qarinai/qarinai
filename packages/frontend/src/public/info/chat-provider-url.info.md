# Chat Provider Base Url



it can be any OpenAI Compatible API that has the following endpoints:
- `/models` - [reference](https://platform.openai.com/docs/api-reference/models/list)
- `/chat/completions` - [reference](https://platform.openai.com/docs/api-reference/chat/create)
- `/embeddings` - [reference](https://platform.openai.com/docs/api-reference/embeddings/create)



examples of compatible APIs:
- ofcource OpenAI's: `https://api.openai.com/v1`
- VertexAI OpenAI endpoints. check [documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/migrate/openai/overview)
- selfhosted:
  - ollama: `https://your_ip_or_host/v1`
  - llama.cpp server: `https://your_ip_or_host/v1`
  - lm studio: `https://your_ip_or_host/v1`
