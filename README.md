# retry-on-ci

This is an npm package you can use in npm scripts to retry commands, but only in a CI environment.

```js
{
  "scripts": {
    "test": "retry-on-ci jest"
  }
}
```

### Environment variables

- `CI` - Set to `true` when running in a CI environment. Most CI environments such as GitHub Actions set this by default.
- `CI_RETRIES` - Number of retries, defaults to 3
- `CI_TIMEOUT`- Timeout for command, defaults to 10 minutes



