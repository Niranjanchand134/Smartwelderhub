# Environment Setup

## Required Environment Variables

Create a `.env` file in the root directory of `SmartWeldBackend` with the following variables:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Optional OpenAI API Configuration (defaults provided in application.properties)
# OPENAI_API_MODEL=gpt-4o-mini
# OPENAI_API_TEMPERATURE=0.8
# OPENAI_API_MAX_TOKENS=160

# SMTP Configuration (if not in application.properties)
SMTP_PASSWORD=your_smtp_password_here
```

## Getting Your OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it in the `.env` file

## OpenAI Configuration Options

The following OpenAI settings are configurable (defaults are set in `application.properties`):

- **Model**: `gpt-4o-mini` (default) - You can change this to other OpenAI models like `gpt-3.5-turbo`, `gpt-4`, etc.
- **Temperature**: `0.8` (default) - Controls randomness (0.0 = deterministic, 1.0 = very creative)
- **Max Tokens**: `160` (default) - Maximum number of tokens in the response

You can override these in your `.env` file:
```env
OPENAI_API_MODEL=gpt-4o-mini
OPENAI_API_TEMPERATURE=0.8
OPENAI_API_MAX_TOKENS=160
```

## Notes

- The `.env` file is automatically loaded by the `EnvConfig` class
- Make sure to add `.env` to your `.gitignore` file to keep your API keys secure
- The application will throw an error on startup if the OpenAI API key is not configured
- Default values are set in `application.properties` and can be overridden via environment variables
