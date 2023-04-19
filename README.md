# 🌟 Injective UI

`Injective ui` is a collection of UI packages to ease development across the wide range of Injective products.

## 📚 Overview

[`@injectivelabs/ui-shared`](packages/ui-shared/README.md) provides a collection of re-useable fonts, render-less FE components, and tailwind configs to ease development across the wide range of Injective products.

[`@injectivelabs/eslint-config`](packages/eslint-config/README.md) provides a set of shared eslint config rules.

[`@injectivelabs/prettier-config`](packages/prettier-config/README.md) provides a set of shared prettier config.

[`@injectivelabs/stylelint-config`](packages/stylelint-config/README.md) provides a set of shared stylelint config.

## Developer guide:

1. Create a new branch off of the master branch as to make your changes

2. Links different projects within the repo so they can import each other without having to publish anything to NPM

- `lerna boostrap`

3. Making changes to any of the packages
- Run `git add . && git commit -m 'commit message'` which will trigger the lint-staged and vitest yarn scripts [here](injective-ui/../.husky/pre-commit)
- Run `git push` to publish a new branch in the remote repository
- Create a PR to merge to master. Once approved, you can move on to step 4

4. Publishing the changes to npm

- `lerna version`
- `lerna publish from-package`

## ⛑ Support

Reach out to us at one of the following places!

- Website at <a href="https://injective.com" target="_blank">`injective.com`</a>
- Twitter at <a href="https://twitter.com/Injective_" target="_blank">`@Injective`</a>
- Discord at <a href="https://discord.com/invite/NK4qdbv" target="_blank">`Discord`</a>
- Telegram at <a href="https://t.me/joininjective" target="_blank">`Telegram`</a>

---

## 🔓 License

This software is licensed under the MIT license. See [LICENSE](./LICENSE) for full disclosure.
