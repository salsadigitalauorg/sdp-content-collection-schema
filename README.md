# Content Collection Schema

The in-progress schema for configuring an advanced listing component (the Content Collection) for [Ripple](https://github.com/dpc-sdp/ripple).

`schema.js` contains the working draft.

## Validation

- A [JSON Schema](https://json-schema.org/) version can be found in `./schema.json`.

Validation against this schema can be tested by running the following:

```bash
npm install
npm run validate "./path-to-your-json-schema.json"
```

Or to test an example case:

``` bash
npm run example
```

Some example scripts:
```bash
npm run validate "examples/vh-convictions-register.json"
npm run validate "examples/vh-aging-and-age-care.json"
```
