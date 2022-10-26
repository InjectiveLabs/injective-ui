# 🌟 Injective Components library

Collection of re-useable fonts, render-less FE components and tailwind configs to ease development across the wide range of Injective products.

## Development

- Run `npm run dev:prepare` to generate type stubs.
- Use `npm run dev` to start [playground](./playground) in development mode.
- `cd playground` and `yarn story:dev` to browse through the list of available components

## Publish

- Update package.json version
- Run `npm publish --access public`

## How to add new fonts

- Add the respective font files to `/lib/fonts` folder
- Create the `${fontName}.css` in the `/lib/css/fonts` folder
- Update package.json `exports` object

```json
{
  "exports": {
    "./lib/fonts/{fontName}.css": "./lib/css/fonts/{fontName}.css"
  }
}
```

## How to add a new icon

- Create the `{iconName}.vue` file in the `/lib/icons` folder
- Test the icon renders properly
  - yarn dev:prepare
  - cd playground
  - yarn story:dev

## How to add a new render-less components

- Create the `{componentName}.vue` file in the `/lib/components` folder
- Add the `{componentName}.test.ts` file in the `/test` folder
- Add the `${componentName}.story.vue` file in the `playground/story` folder
- Test the component test passes smoothly
  - yarn test:coverage
- Test the component renders properly
  - yarn dev:prepare
  - cd playground
  - yarn story:dev

## 🔓 License

This software is licensed under the MIT license. See [LICENSE](./LICENSE) for full disclosure.
