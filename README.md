# envsnap

> CLI tool to snapshot and restore local environment variables across projects

## Installation

```bash
npm install -g envsnap
```

## Usage

Capture a snapshot of your current environment variables:

```bash
envsnap save --name my-project
```

Restore a previously saved snapshot:

```bash
envsnap restore --name my-project
```

List all saved snapshots:

```bash
envsnap list
```

Snapshots are stored locally in `~/.envsnap/` and can be scoped per project directory.

```bash
# Save with project scope
envsnap save --name staging --project ./my-app

# Restore into current shell session
eval $(envsnap restore --name staging --export)
```

## License

MIT © [envsnap contributors](https://github.com/envsnap/envsnap)