# Dependency Management for MemeLash

This document outlines how to keep dependencies minimal and clean in the MemeLash project.

## Available Scripts

### Check for Unused Dependencies

```bash
npm run deps:check
```

This command will scan the root, client, and server directories for unused dependencies and report them.

### Clean Up Dependencies

```bash
npm run deps:clean
```

This command runs `npm prune` in the root, client, and server directories to remove dependencies that are in `node_modules` but not listed in `package.json`.

### Automatically Remove Unused Dependencies

```bash
npm run deps:remove-unused
```

This command will automatically detect and remove unused dependencies from all package.json files. Use with caution and verify the results.

## Best Practices

1. **Install Only What You Need**: Before adding a new dependency, consider if it's really necessary or if you can implement the functionality yourself.

2. **Regular Cleanup**: Run `npm run deps:check` periodically to identify unused dependencies.

3. **Shared Dependencies**: For dependencies used in both client and server, consider if they should be in the root package.json.

4. **Peer Dependencies**: Be aware of peer dependencies that might be required but not directly installed.

5. **Development vs Production**: Use `--save-dev` for dependencies only needed during development.

## Configuration

The `.depcheckrc` file in the root directory configures which packages to ignore during dependency checks. This is useful for packages that are used indirectly or through configuration files.

## When Adding New Features

1. Install only the packages you need for the feature
2. After implementation, run `npm run deps:check` to ensure no unnecessary packages were added
3. Document why non-obvious dependencies are needed in code comments

By following these practices, we can keep our dependency tree minimal, which improves:

- Security (fewer potential vulnerabilities)
- Performance (faster installs and builds)
- Maintainability (easier to understand what's being used and why)
