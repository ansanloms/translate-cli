# translate-cli

## Install

```bash
deno install --import-map=https://raw.githubusercontent.com/ansanloms/translate-cli/main/import_map.json -A --no-check --force --reload https://raw.githubusercontent.com/ansanloms/translate-cli/main/translate.ts
```

## Usage

### Describe settings

The path to the configuration file can be obtained by executing the following
command.

```bash
translate config
```

Example:

```json
{
  "defaultProvider": "codic",
  "codic": {
    "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "projectId": "123abc",
    "casing": "camel",
    "acronymStyle": "literal"
  },
  "chatgpt": {
    "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "sourceLanguage": "English",
    "targetLanguage": "Japanese",
    "systemMessage": "Translate from English to Japanese.",
    "model": "gpt-3.5-turbo"
  }
}
```

### Translate

```bash
translate "Hello." -p chatgpt
```
