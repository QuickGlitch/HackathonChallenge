# @store-hackathon/prettier-config

Shared Prettier configuration for the store-hackathon monorepo.

## Usage

In your app's `package.json`:

```json
{
  "prettier": "@store-hackathon/prettier-config"
}
```

Or in `prettier.config.js`:

```js
import sharedConfig from '@store-hackathon/prettier-config';

export default {
  ...sharedConfig,
  // Add your app-specific overrides here
};
```
