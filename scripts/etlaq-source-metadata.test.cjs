const assert = require('node:assert/strict')
const path = require('node:path')
const test = require('node:test')
const babel = require('@babel/core')
const plugin = require('./etlaq-source-metadata.cjs')

test('adds bounded source metadata to intrinsic JSX elements', () => {
  const root = path.resolve(__dirname, '..')
  const result = babel.transformSync(
    'export function Card() { return <button>Save</button> }',
    {
      cwd: root,
      filename: path.join(root, 'components/card.tsx'),
      configFile: false,
      babelrc: false,
      plugins: [plugin],
      parserOpts: { plugins: ['jsx', 'typescript'] },
    }
  )
  assert.match(result.code, /data-etlaq-source="components\/card[.]tsx"/)
  assert.match(result.code, /data-etlaq-id="[a-f0-9]{20}"/)
  assert.match(result.code, /data-etlaq-component="Card"/)
})

test('does not add metadata to custom components', () => {
  const root = path.resolve(__dirname, '..')
  const result = babel.transformSync('const view = <Card />', {
    cwd: root,
    filename: path.join(root, 'app/page.tsx'),
    configFile: false,
    babelrc: false,
    plugins: [plugin],
    parserOpts: { plugins: ['jsx', 'typescript'] },
  })
  assert.doesNotMatch(result.code, /data-etlaq-source/)
})
