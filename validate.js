const Ajv = require("ajv")
const ajv = new Ajv({ allErrors: true })
const fs = require('fs')

// Get the schema
let schema = fs.readFileSync('./schema.json')
schema = JSON.parse(schema)

if (process.argv[2]) {
  // Get test case.
  const filePath = process.argv[2]
  let testCase = fs.readFileSync(filePath)
  testCase = JSON.parse(testCase)

  // Compare
  const validate = ajv.compile(schema)
  const valid = validate(testCase)
  if (!valid) console.log(validate.errors)
} else {
  console.log("Missing test case. Add a relative file path to a JSON file.")
}
