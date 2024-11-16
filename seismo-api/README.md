# Setup

## Environment Configuration

Before running the project, create a `.dev.vars` file in your project root with the following variables:

```bash
# KV namespace ID
SEISMO_KV_ID=your_kv_namespace_id

# API Keys
GEMINI_KEY=your_gemini_api_key
GROQ_KEY=your_groq_api_key
```

These variables will be automatically picked up by Wrangler when running locally with `wrangler dev`.

For production deployment, make sure to set up your secrets in the Cloudflare dashboard or using:
```bash
wrangler secret put GEMINI_KEY
wrangler secret put GROQ_KEY
```