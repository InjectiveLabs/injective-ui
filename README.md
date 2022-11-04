# 🌟 Injective UI

`Injective ui` is a collection of UI packages to ease development across the wide range of Injective products.

## 📚 Overview

[`@injectivelabs/injective-ui`](injective-ui/tree/master/packages/injective-ui/README.md) provides a collection of re-useable fonts, render-less FE components and tailwind configs to ease development across the wide range of Injective products.

[`@injectivelabs/notifications`](injective-ui/tree/master/packages/notification/README.md) provides a notification solution for FE products which consists of FE components and composables.

[`@injectivelabs/eslint-config`](injective-ui/tree/master/packages/eslint-config/README.md) provides a set of shared eslint config rules.

[`@injectivelabs/prettier-config`](injective-ui/tree/master/packages/prettier-config/README.md) provides a set of shared prettier config.

[`@injectivelabs/stylelint-config`](injective-ui/tree/master/packages/stylelint-config/README.md) provides a set of shared stylelint config.

## Developer guide:

1. Links different projects within the repo so they can import each other without having to publish anything to NPM

- `lerna boostrap`

2. Making changes to eslint, prettier or stylelint config

- update the respective `index.js` file
- commit the changes, which will trigger the lint-staged and vitest yarn scripts [here](injective-ui/../.husky/pre-commit)

3. Publishing the changes to npm

- `TBD`

## ⛑ Support

Reach out to us at one of the following places!

- Website at <a href="https://injective.com" target="_blank">`injective.com`</a>
- Twitter at <a href="https://twitter.com/Injective_" target="_blank">`@Injective`</a>
- Discord at <a href="https://discord.com/invite/NK4qdbv" target="_blank">`Discord`</a>
- Telegram at <a href="https://t.me/joininjective" target="_blank">`Telegram`</a>

---

## 🔓 License

This software is licensed under the MIT license. See [LICENSE](./LICENSE) for full disclosure.
