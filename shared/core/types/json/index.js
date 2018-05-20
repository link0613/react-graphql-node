/*
 GraphQLJSON {
  data: Object      # raw JSON data>
  resolved: boolean # true if value resolved
  errors: [Object]  # array of errors
 }
 */
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

function getObject(value) {
  return value && !Array.isArray(value) && typeof value === 'object' ? value : null;
}

function parseObject(ast) {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;

    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);

    case Kind.OBJECT: {
      const value = Object.create(null);

      ast.fields.forEach((field) => {
        value[field.name.value] = parseObject(field.value);
      });

      return value;
    }

    case Kind.LIST:
      return ast.values.map(parseObject);

    default:
      return null;
  }
}

module.exports = new GraphQLScalarType({
  name: 'JSON',

  serialize: getObject,

  parseValue: getObject,

  parseLiteral(ast) {
    return ast.kind === Kind.OBJECT ? parseObject(ast) : null;
  }
});
