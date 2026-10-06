const crypto = require('node:crypto')
const path = require('node:path')

function componentNameFor(elementPath) {
  let current = elementPath.parentPath
  while (current) {
    if (current.isFunctionDeclaration() || current.isClassDeclaration()) {
      return current.node.id?.name || 'Anonymous'
    }
    if (current.isVariableDeclarator() && current.node.id?.type === 'Identifier') {
      return current.node.id.name
    }
    if (
      (current.isObjectMethod() || current.isClassMethod()) &&
      current.node.key?.type === 'Identifier'
    ) {
      return current.node.key.name
    }
    current = current.parentPath
  }
  return 'Anonymous'
}

function metadataAttribute(types, name, value) {
  return types.jsxAttribute(
    types.jsxIdentifier(name),
    types.stringLiteral(value)
  )
}

module.exports = function etlaqSourceMetadata({ types }) {
  return {
    name: 'etlaq-source-metadata',
    visitor: {
      JSXOpeningElement(elementPath, state) {
        const nameNode = elementPath.node.name
        if (nameNode.type !== 'JSXIdentifier' || !/^[a-z]/.test(nameNode.name)) return
        if (!elementPath.node.loc || !state.filename) return
        if (
          elementPath.node.attributes.some(
            (attribute) =>
              attribute.type === 'JSXAttribute' &&
              attribute.name.type === 'JSXIdentifier' &&
              attribute.name.name === 'data-etlaq-source'
          )
        ) {
          return
        }

        const absoluteFilename = path.resolve(state.filename)
        const projectRoot = path.resolve(state.cwd || process.cwd())
        const relativeFilename = path
          .relative(projectRoot, absoluteFilename)
          .replaceAll(path.sep, '/')
        if (!relativeFilename || relativeFilename.startsWith('../')) return

        const line = elementPath.node.loc.start.line
        const column = elementPath.node.loc.start.column + 1
        const component = componentNameFor(elementPath)
        const identity = `${relativeFilename}:${line}:${column}:${nameNode.name}`
        const stableId = crypto
          .createHash('sha256')
          .update(identity)
          .digest('hex')
          .slice(0, 20)

        elementPath.node.attributes.push(
          metadataAttribute(types, 'data-etlaq-id', stableId),
          metadataAttribute(types, 'data-etlaq-source', relativeFilename),
          metadataAttribute(types, 'data-etlaq-line', String(line)),
          metadataAttribute(types, 'data-etlaq-column', String(column)),
          metadataAttribute(types, 'data-etlaq-component', component)
        )
      },
    },
  }
}
