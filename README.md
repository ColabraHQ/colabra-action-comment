# Colabra Comment Action

A GitHub Action to post comments on Colabra tasks and projects.

## Usage

```yaml
- name: Comment on Colabra task
  uses: colabra/comment@v1
  with:
    api_key: ${{ secrets.COLABRA_API_KEY }}
    workspace_slug: ${{ github.event.client_payload.workspace_slug }}
    resource_id: ${{ github.event.client_payload.resource_id }}
    body_text: 'Your comment text here'
```

## Inputs

| Input           | Description                                      | Required |
|----------------|--------------------------------------------------|----------|
| api_key        | Colabra API Key                                  | Yes      |
| workspace_slug | Colabra Workspace Slug                           | Yes      |
| resource_id    | Task or Project ID (e.g. "EXP-10")              | Yes      |
| body_text      | The text content of the comment                  | Yes      |

## Example Workflow

```yaml
name: Process Colabra Task

on:
  repository_dispatch:
    types: [colabra-connection]

jobs:
  process_task:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Comment on Colabra task
        uses: colabra/comment@v1
        with:
          api_key: ${{ secrets.COLABRA_API_KEY }}
          workspace_slug: ${{ github.event.client_payload.workspace_slug }}
          resource_id: ${{ github.event.client_payload.resource_id }}
          body_text: 'Hello World 🦠'
```

## Development

This action is built with TypeScript and uses the GitHub Actions toolkit.

To build:
```bash
pnpm install
pnpm build
```

To test:
```bash
pnpm test
```

## License

MIT 