<h1 align="center">
    <img src="https://raw.githubusercontent.com/qarinai/qarinai/refs/heads/main/public/logo2.png" alt="Qarīn.ai Logo" width="200" height="200"/>
    <br/>
    Qarīn.ai
</h1>

<h3 align="center">
    Your AI Companion
</h3>

<h6 align="center" style="color:red">
🚧 STILL UNDER DEVELOPMENT — NOT READY FOR PRODUCTION USE 🚧
</h6>

<p align="center">
    Create unlimited AI Chatbot Agents for your websites
</p>

<p align="center">
    <a href="https://buymeacoffee.com/sayedmahmoud266" target="_blank">
        <img src="https://cdn.buymeacoffee.com/buttons/default-yellow.png" alt="Buy Me A Coffee" height="41" width="174">
    </a>
</p>

<p align="center">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/qarinai/qarinai">
    <img alt="GitHub watchers" src="https://img.shields.io/github/watchers/qarinai/qarinai">
    <img alt="License" src="https://img.shields.io/github/license/qarinai/qarinai">
</p>

---

## 📌 Overview

**Qarīn.ai** lets you **create unlimited AI chatbot agents** for your websites — no coding required.  
It works with any LLM provider that supports the **OpenAI-Compatible API**, including self-hosted providers like **llama.cpp** or **Ollama**.

With Qarīn.ai, you can:

- Define an agent's **name, identity, and instructions**.
- Instantly generate a **chat bubble widget** to embed on your site.
- **Enhance agents** by connecting to **MCP Servers** or importing your own API specs.
- Build **vector stores** from documents for retrieval-augmented generation (RAG).
- Expose vector stores or MCP Servers to **external AI agents**.

---

## ✨ Highlights

- **No Coding Needed!**
- Supports **RAG** & **MCP** out of the box.
- Works with **any OpenAI-Compatible LLM provider** (including self-hosted).
- **One-click MCP Server generation** from existing REST API specs (Swagger/OpenAPI).
- Native **vector storage** with optional MCP Server exposure for each store.
- **Easy-to-use chat bubble widget** for quick website integration.
- Simple Docker or Kubernetes deployment.

---

## 🚀 Quick Start (Docker Compose)

**Requirements**

- Docker & Docker Compose installed.

**Run Qarīn.ai**

```bash
git clone https://github.com/qarinai/qarinai.git
cd qarinai
docker compose up -d
```

This starts Qarīn.ai with all required environment variables pre-configured.

## 🛠 Creating Your First Agent

Once running:

1. Connect your desired LLM provider (OpenAI, Ollama, llama.cpp, etc.).
2. Select the models you want to use.
3. Set a default model for minor app tasks (summarization, descriptions, etc.).
4. (Optional) Import MCP Servers into Qarīn.ai.
5. (Optional) Import Swagger/OpenAPI specs to auto-generate MCP Servers.
6. (Optional) Create vector stores and upload documents for RAG.
7. Create your AI agent — define name, identity, and instructions.
8. Embed it — click “Add to Website” to get your dynamic snippet code.

## 🗺 Feature Roadmap

Qarīn.ai is still in active development — several existing features are only partially implemented or missing certain CRUD operations and use cases.  
The near-term focus will be **completing and stabilizing all current functionality** before expanding further.

**Planned enhancements:**

- 🛠 **Complete existing CRUD operations** and missing use cases for certain resources.
- 🔒 **Enhanced security**:
  - User management with multiple accounts and ACL (Access Control Lists).
  - Personal Access Tokens with **scopes** instead of full unrestricted access.
  - Secure the public bubble APIs.
- 📊 **Conversation tracking UI**:
  - Visual interface to inspect each conversation and message per agent (currently only stored in DB).
- 🎨 **Agent UI customization**:
  - Style, color, and branding customization for the chat bubble and iframe widget.
- 🚀 Additional quality-of-life improvements after stabilization.

## 📜 License

This project is licensed under the Apache 2.0 License — see [LICENSE](/LICENSE) for details.

## 🙏 Acknowledgements

Qarīn.ai would not have been possible without the incredible work of the **open-source community**.  
This project stands on the shoulders of countless developers and contributors who make their tools, libraries, and frameworks available for everyone to learn from and build upon.

A special thanks to the maintainers of the amazing technologies powering Qarīn.ai, including (but not limited to):

- **Frontend & UI**: [Angular](https://angular.io), [PrimeNG](https://primeng.org), [TailwindCSS](https://tailwindcss.com), [ngx-markdown](https://github.com/jfcere/ngx-markdown)
- **Backend & APIs**: [NestJS](https://nestjs.com), [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol), [OpenAI SDK](https://platform.openai.com), [Zod](https://zod.dev)
- **AI & NLP**: [@huggingface/transformers](https://huggingface.co/docs/transformers/index), [@langchain/textsplitters](https://js.langchain.com/docs/modules/data_connection/document_transformers/text_splitters)
- **Database & Storage**: [TypeORM](https://typeorm.io), [PostgreSQL](https://www.postgresql.org), [pgvector](https://github.com/pgvector/pgvector)
- **Build & Tooling**: [Webpack](https://webpack.js.org), [Gulp](https://gulpjs.com), [Docker](https://www.docker.com)
- **And many more...** — every dependency plays a role in making this project possible.

If you maintain one of these libraries: **thank you** for your dedication to open-source! ❤️

## 🤝 Contributing

Contributions are not open at the moment as the project is still in an early stage.
<br/>
However, suggestions and feedback are welcome — feel free to open an issue or discussion.
