"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// package.json
var require_package = __commonJS({
  "package.json"(exports, module2) {
    module2.exports = {
      name: "prisma-generator-drizzle",
      description: "A Prisma generator for generating Drizzle schema with ease",
      version: "0.6.0",
      main: "dist/generator.js",
      license: "MIT",
      bin: {
        "prisma-generator-drizzle": "dist/bin.js"
      },
      engines: {
        node: ">=14.0"
      },
      scripts: {
        start: "node dist/bin.js",
        dev: "tsup src/generator.ts src/bin.ts --watch",
        build: "tsup src/generator.ts src/bin.ts --clean",
        prepack: "bun run build",
        test: "bun test"
      },
      dependencies: {
        "@prisma/client": "5.8.1",
        "@prisma/generator-helper": "5.8.1",
        "@prisma/sdk": "4.0.0",
        "fp-ts": "^2.16.2",
        lodash: "^4.17.21",
        pluralize: "^8.0.0"
      },
      devDependencies: {
        "@types/lodash": "^4.14.202",
        "@types/node": "^20.11.5",
        "@types/pluralize": "^0.0.33",
        "@types/prettier": "3.0.0",
        prisma: "5.8.1",
        tsup: "^8.0.1",
        typescript: "5.3.3"
      },
      repository: {
        type: "git",
        url: "https://github.com/farreldarian/prisma-generator-drizzle"
      },
      author: "Farrel Darian <contact@farreldarian.com>",
      keywords: ["prisma", "drizzle", "generator"]
    };
  }
});

// src/generator.ts
var generator_exports = {};
__export(generator_exports, {
  reduceImports: () => reduceImports
});
module.exports = __toCommonJS(generator_exports);
var import_generator_helper = require("@prisma/generator-helper");
var import_child_process = require("child_process");
var import_Array3 = require("fp-ts/lib/Array");
var import_function4 = require("fp-ts/lib/function");
var import_fs = __toESM(require("fs"));
var import_lodash7 = require("lodash");
var import_path = __toESM(require("path"));

// src/constants.ts
var GENERATOR_NAME = "prisma-generator-drizzle";

// src/lib/prisma-helpers/getDbName.ts
function getDbName(field) {
  var _a;
  return (_a = field.dbName) != null ? _a : field.name;
}

// src/lib/prisma-helpers/enums.ts
var import_lodash = require("lodash");
var getEnumVarName = (0, import_lodash.memoize)((prismaEnum) => {
  return `${(0, import_lodash.camelCase)(prismaEnum.name)}Enum`;
});
var getEnumModuleName = (0, import_lodash.memoize)((prismaEnum) => {
  return (0, import_lodash.kebabCase)(getEnumVarName(prismaEnum));
});

// src/lib/adapter/declarations/generateEnumDeclaration.ts
function generateEnumDeclaration(adapter, prismaEnum) {
  const varName = getEnumVarName(prismaEnum);
  const enumFuncCall = adapter.getDeclarationFunc.enum(
    getDbName(prismaEnum),
    prismaEnum.values.map(getDbName)
  );
  return {
    imports: enumFuncCall.imports,
    code: `export const ${varName} = ${enumFuncCall.func};`
  };
}

// src/lib/adapter/declarations/generateSchemaDeclaration.ts
var import_lodash2 = require("lodash");

// src/lib/syntaxes/imports.ts
function namedImport(names, path2) {
  return {
    type: "namedImport",
    names,
    module: path2,
    render() {
      return `import { ${names.join(", ")} } from '${renderImportPath(path2)}';`;
    }
  };
}
function wildcardImport(alias, path2) {
  return {
    type: "wildcardImport",
    module: path2,
    render() {
      return `import * as ${alias} from '${renderImportPath(path2)}';`;
    }
  };
}
function renderImportPath(path2) {
  return path2.startsWith(".") ? `${path2}.js` : path2;
}

// src/lib/adapter/declarations/generateSchemaDeclaration.ts
function generateSchemaDeclaration(models) {
  const aliasFor = (m) => (0, import_lodash2.camelCase)(m.name);
  return {
    imports: models.map((m) => wildcardImport(aliasFor(m), `./${m.name}`)),
    code: `export const schema = { ${models.map((m) => `...${aliasFor(m)}`).join(", ")} };`
  };
}

// src/lib/adapter/declarations/generateTableRelationsDeclaration.ts
var import_Array = require("fp-ts/lib/Array");
var import_function = require("fp-ts/lib/function");
var import_lodash4 = require("lodash");
var import_pluralize2 = __toESM(require("pluralize"));

// src/lib/prisma-helpers/field.ts
function isKind(kind) {
  return (field) => field.kind === kind;
}
function isRelationField(field) {
  return field.kind === "object" && field.relationFromFields != null && field.relationToFields != null;
}

// src/lib/prisma-helpers/model.ts
var import_lodash3 = require("lodash");
var import_pluralize = __toESM(require("pluralize"));
var getModelVarName = (0, import_lodash3.memoize)((model) => {
  return (0, import_lodash3.camelCase)((0, import_pluralize.default)(typeof model === "string" ? model : model.name));
});
var getModelModuleName = (0, import_lodash3.memoize)((model) => {
  return (0, import_lodash3.kebabCase)((0, import_pluralize.default)(typeof model === "string" ? model : model.name));
});

// src/lib/adapter/declarations/generateTableRelationsDeclaration.ts
function generateTableRelationsDeclaration(input) {
  const { tableVar } = input.modelModule;
  const _fields = input.fields.map(getRelationField(input));
  const func = `relations(${tableVar.name}, (helpers) => ({ ${_fields.map((f) => `${f.name}: ${f.func}`).join(", ")} }))`;
  return {
    imports: [
      namedImport(["relations"], "drizzle-orm"),
      namedImport([tableVar.name], `./${input.modelModule.name}`),
      ..._fields.flatMap((field) => field.imports)
    ],
    implicit: _fields.flatMap((field) => field.implicit),
    code: `export const ${tableVar.name}Relations = ${func};`
  };
}
function getRelationField(ctx) {
  return function(field) {
    const { implicit, opts, referenceModelVarName } = !field.isList ? getOneToOneOrManyRelation(field, ctx) : opposingIsList(field, ctx) ? getManyToManyRelation(field, ctx) : getManyToOneRelation(field);
    const relFunc = field.isList ? "helpers.many" : "helpers.one";
    return {
      name: field.name,
      implicit,
      imports: [
        namedImport(
          [referenceModelVarName],
          `./${(0, import_lodash4.kebabCase)(referenceModelVarName)}`
        )
      ],
      func: `${relFunc}(${referenceModelVarName}${opts ? `, ${opts}` : ""})`
    };
  };
}
var DetermineRelationshipError = class extends Error {
  constructor(field, message) {
    super(`Cannot determine relationship ${field.relationName}, ${message}`);
  }
};
function getManyToManyRelation(field, ctx) {
  const opposingModel = findOpposingRelationModel(field, ctx.datamodel);
  const joinTable = createImplicitJoinTable(field.relationName, [
    ctx.modelModule.model,
    opposingModel
  ]);
  return createRelation({
    referenceModelVarName: getModelVarName(joinTable.varName),
    implicit: [joinTable.model]
  });
}
function createRelation(input) {
  var _a, _b;
  return {
    referenceModelVarName: input.referenceModelVarName,
    opts: (_a = input.opts) != null ? _a : null,
    implicit: (_b = input.implicit) != null ? _b : []
  };
}
function getOneToOneOrManyRelation(field, ctx) {
  if (hasReference(field)) {
    const opts2 = createRelationOpts({
      relationName: field.relationName,
      from: {
        modelVarName: getModelVarName(ctx.modelModule.model),
        fieldNames: field.relationFromFields
      },
      to: {
        modelVarName: getModelVarName(field.type),
        fieldNames: field.relationToFields
      }
    });
    return createRelation({
      referenceModelVarName: getModelVarName(field.type),
      opts: opts2
    });
  }
  const opposingModel = findOpposingRelationModel(field, ctx.datamodel);
  const opposingField = findOpposingRelationField(field, opposingModel);
  const opts = createRelationOpts({
    relationName: field.relationName,
    from: {
      modelVarName: getModelVarName(ctx.modelModule.model),
      fieldNames: opposingField.relationToFields
    },
    to: {
      modelVarName: getModelVarName(field.type),
      fieldNames: opposingField.relationFromFields
    }
  });
  return createRelation({
    referenceModelVarName: getModelVarName(field.type),
    opts
  });
}
function getManyToOneRelation(field) {
  const opts = createRelationOpts({ relationName: field.relationName });
  return createRelation({
    referenceModelVarName: getModelVarName(field.type),
    opts
  });
}
function createRelationOpts(input) {
  const { relationName, from, to } = input;
  const entries = Object.entries({
    relationName: relationName ? `'${relationName}'` : null,
    fields: from ? `[ ${from.fieldNames.map((fieldName) => `${from.modelVarName}.${fieldName}`).join(", ")} ]` : null,
    references: to ? `[ ${to.fieldNames.map((fieldName) => `${to.modelVarName}.${fieldName}`).join(", ")} ]` : null
  }).flatMap(([key, value]) => value == null ? [] : `${key}: ${value}`);
  if (entries.length === 0)
    return;
  return `{ ${entries.join(", ")} }`;
}
function createImplicitJoinTable(baseName, models) {
  const pair = models.map(getDbName).sort();
  const name = (0, import_function.pipe)(pair, (0, import_Array.map)(import_pluralize2.default), (names) => names.join("To"));
  const varName = (0, import_lodash4.camelCase)(name);
  const model = {
    name,
    dbName: `_${baseName}`,
    fields: [
      {
        name: "A",
        kind: "scalar",
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        isReadOnly: false,
        hasDefaultValue: false,
        type: "String",
        isGenerated: false,
        isUpdatedAt: false
      },
      {
        name: (0, import_lodash4.camelCase)(pair[0]),
        kind: "object",
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        isReadOnly: false,
        hasDefaultValue: false,
        type: pair[0],
        // relationName: `${baseName}_A`,
        relationFromFields: ["A"],
        relationToFields: ["id"],
        isGenerated: false,
        isUpdatedAt: false
      },
      {
        name: "B",
        kind: "scalar",
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        isReadOnly: false,
        hasDefaultValue: false,
        type: "String",
        isGenerated: false,
        isUpdatedAt: false
      },
      {
        name: (0, import_lodash4.camelCase)(pair[1]),
        kind: "object",
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        isReadOnly: false,
        hasDefaultValue: false,
        type: pair[1],
        // relationName: `${baseName}_B`,
        relationFromFields: ["B"],
        relationToFields: ["id"],
        isGenerated: false,
        isUpdatedAt: false
      }
    ],
    primaryKey: { name: null, fields: ["A", "B"] },
    uniqueFields: [],
    uniqueIndexes: [],
    isGenerated: false
  };
  return { varName, baseName, model, pair };
}
function findOpposingRelationModel(field, datamodel) {
  const opposingModel = datamodel.models.find((m) => m.name === field.type);
  if (opposingModel)
    return opposingModel;
  throw new DetermineRelationshipError(field, `model ${field.type} not found`);
}
function findOpposingRelationField(field, opposingModel) {
  const opposingField = opposingModel.fields.find(
    (f) => f.relationName === field.relationName && isRelationField(f)
  );
  if (opposingField)
    return opposingField;
  throw new DetermineRelationshipError(
    field,
    `field with relation ${field.relationName} not found`
  );
}
function hasReference(field) {
  return field.relationFromFields.length > 0 && field.relationToFields.length > 0;
}
function opposingIsList(field, ctx) {
  const opposingModel = findOpposingRelationModel(field, ctx.datamodel);
  return findOpposingRelationField(field, opposingModel).isList;
}

// src/lib/syntaxes/module.ts
var import_Array2 = require("fp-ts/lib/Array");
var import_function2 = require("fp-ts/lib/function");
function createModule(input) {
  const imports = (0, import_function2.pipe)(
    input.declarations,
    (0, import_Array2.flatMap)((d) => d.imports),
    reduceImports
  );
  const code = [
    imports.map((i) => i.render()).join("\n"),
    ...input.declarations.map((d) => d.code)
  ].join("\n\n");
  return {
    ...input,
    name: input.name,
    code
  };
}

// src/lib/adapter/declarations/generateTableDeclaration.ts
var import_Refinement = require("fp-ts/lib/Refinement");
var import_function3 = require("fp-ts/lib/function");
function generateTableDeclaration(adapter, model) {
  const fields = model.fields.filter((0, import_function3.pipe)(isKind("scalar"), (0, import_Refinement.or)(isKind("enum")))).map(adapter.parseField);
  const name = getModelVarName(model);
  const tableDeclaration = adapter.getDeclarationFunc.table(
    getDbName(model),
    fields
  );
  return {
    name,
    imports: [
      ...tableDeclaration.imports,
      ...fields.flatMap((field) => field.imports)
    ],
    code: `export const ${name} = ${tableDeclaration.func};`
  };
}

// src/lib/adapter/modules/createModelModule.ts
function createModelModule(input) {
  const tableVar = generateTableDeclaration(input.ctx.adapter, input.model);
  return createModule({
    name: getModelModuleName(input.model),
    model: input.model,
    tableVar,
    declarations: [tableVar]
  });
}

// src/lib/adapter/providers/mysql.ts
var import_lodash5 = require("lodash");

// src/lib/adapter/adapter.ts
function createAdapter(impl) {
  return {
    ...impl,
    parseField(field) {
      const fieldType = field.kind === "enum" ? "enum" : field.type;
      const fieldFunc = fieldType in impl.fields ? impl.fields[fieldType] : void 0;
      if (fieldFunc == null) {
        throw new Error(
          `Adapter ${impl.name} does not support ${field.type} field`
        );
      }
      return fieldFunc(field);
    }
  };
}

// src/lib/adapter/fields/createField.ts
function createField(input) {
  var _a, _b, _c, _d, _e, _f;
  const { field } = input;
  let imports = (_a = input.imports) != null ? _a : [];
  let func = `${input.func}`;
  const customType = getCustomType(field);
  if (customType) {
    imports = imports.concat(customType.imports);
    func += customType.code;
  }
  const customDefault = getCustomDefault(field);
  if (customDefault) {
    imports = imports.concat(customDefault.imports);
    func += customDefault.code;
  } else if (field.hasDefaultValue) {
    const _field = field;
    const def = (_c = (_b = input.onDefault) == null ? void 0 : _b.call(input, _field)) != null ? _c : onDefault(_field);
    if (def) {
      imports = imports.concat((_d = def.imports) != null ? _d : []);
      func += def.code;
    }
  }
  if (field.isId)
    func += (_f = (_e = input.onPrimaryKey) == null ? void 0 : _e.call(input, field)) != null ? _f : ".primaryKey()";
  else if (field.isRequired || field.hasDefaultValue || !!customDefault)
    func += ".notNull()";
  return {
    imports,
    field,
    name: field.name,
    func
  };
}
function getDirective(field, directive) {
  var _a;
  if (field.documentation == null)
    return;
  return (_a = field.documentation.split("\n").find((doc) => doc.startsWith(directive))) == null ? void 0 : _a.replaceAll(directive, "").trim();
}
function getCustomType(field) {
  const directive = getDirective(field, "drizzle.type");
  if (directive == null)
    return;
  const splits = directive.split("::");
  if (splits.length !== 2)
    throw new Error(`Invalid type definition: ${field.documentation}`);
  const [module2, type] = splits;
  return {
    imports: namedImport([type], module2),
    code: `.$type<${type}>()`
  };
}
function getCustomDefault(field) {
  const directive = getDirective(field, "drizzle.default");
  if (directive == null)
    return;
  const splits = directive.split("::");
  if (splits.length !== 2)
    throw new Error(`Invalid default definition: ${field.documentation}`);
  const [module2, _secondFragment] = splits;
  const splits2 = _secondFragment.split("`").map((s) => s.trim());
  if (splits2.length === 1) {
    const [type2] = splits2;
    return {
      imports: namedImport([type2], module2),
      code: `.$defaultFn(() => ${type2}())`
    };
  } else if (splits2.length !== 3)
    throw new Error(`Invalid default definition: ${field.documentation}`);
  const [type, code] = splits2;
  return {
    imports: namedImport([type], module2),
    code: `.$defaultFn(${code})`
  };
}
function hasDefault(field) {
  return field.hasDefaultValue;
}
function isDefaultScalar(field) {
  return typeof field.default !== "object";
}
function isDefaultFunc(field) {
  return typeof field.default === "object" && !Array.isArray(field.default);
}
function isDefaultScalarList(field) {
  return Array.isArray(field.default);
}
function onDefault(field) {
  if (isDefaultFunc(field)) {
    if (field.default.name === "dbgenerated") {
      return {
        imports: [namedImport(["sql"], "drizzle-orm")],
        code: `.default(sql\`${field.default.args[0]}\`)`
      };
    }
    if (field.type === "DateTime" && field.default.name === "now") {
      return { code: ".defaultNow()" };
    }
  }
  if (isDefaultScalar(field)) {
    if (field.type === "Bytes") {
      return {
        code: `.$defaultFn(() => Buffer.from('${field.default}', 'base64'))`
      };
    }
    const defaultDef = getDefaultScalarDefinition(field, field.default);
    if (defaultDef == null)
      return;
    return {
      code: `.default(${defaultDef})`
    };
  }
  if (isDefaultScalarList(field)) {
    if (field.type === "Bytes") {
      return {
        code: `.$defaultFn(() => [ ${field.default.map((value) => `Buffer.from('${value}', 'base64')`).join(", ")} ])`
      };
    }
    const defaultDefs = field.default.map(
      (value) => getDefaultScalarDefinition(field, value)
    );
    if (defaultDefs.some((val) => val == null))
      return;
    return {
      code: `.default([${defaultDefs.join(", ")}])`
    };
  }
  console.warn(
    `Unsupported default value: ${JSON.stringify(field.default)} on field ${field.name}`
  );
}
function getDefaultScalarDefinition(field, value) {
  if (field.kind === "enum") {
    return `'${value}'`;
  }
  switch (field.type) {
    case "BigInt":
      return `BigInt(${value})`;
    case "Int":
    case "Float":
    case "Boolean":
    case "Json":
      return `${value}`;
    case "Decimal":
    case "String":
      return `'${value}'`;
    case "DateTime":
      return `new Date('${value}')`;
    default:
      console.warn(
        `Unsupported default value: ${JSON.stringify(value)} on field ${field.name}`
      );
  }
}

// src/lib/adapter/providers/mysql.ts
var coreModule = "drizzle-orm/mysql-core";
var customBytesModule = createModule({
  name: "custom-bytes",
  declarations: [
    {
      imports: [namedImport(["customType"], coreModule)],
      code: `export const customBytes = customType<{ data: Buffer }>({
	dataType() {
		return 'LONGBLOB';
	},
	fromDriver(value: unknown) {
		if (Buffer.isBuffer(value)) return value
		throw new Error('Expected Buffer')
	},
	toDriver(value: Buffer) {
		return value
	}
});`
    }
  ]
});
var mysqlAdapter = createAdapter({
  name: "mysql",
  getDeclarationFunc: {
    enum(_, values) {
      return {
        imports: [namedImport(["mysqlEnum"], coreModule)],
        func: `(fieldName: string) => mysqlEnum(fieldName, [${values.map((v) => `'${v}'`).join(", ")}])`
      };
    },
    table(name, fields) {
      return {
        imports: [namedImport(["mysqlTable"], coreModule)],
        func: `mysqlTable('${name}', { ${fields.map(({ field, func }) => `${field.name}: ${func}`).join(", ")} })`
      };
    }
  },
  fields: {
    enum(field) {
      const func = `${(0, import_lodash5.camelCase)(field.type)}Enum`;
      return createField({
        field,
        imports: [namedImport([func], `./${(0, import_lodash5.kebabCase)(field.type)}-enum`)],
        func: `${func}('${getDbName(field)}')`
      });
    },
    // https://orm.drizzle.team/docs/column-types/mysql/#bigint
    BigInt(field) {
      return createField({
        field,
        imports: [namedImport(["bigint"], coreModule)],
        func: `bigint('${getDbName(field)}', { mode: 'bigint' })`
      });
    },
    // https://orm.drizzle.team/docs/column-types/mysql/#boolean
    Boolean(field) {
      return createField({
        field,
        imports: [namedImport(["boolean"], coreModule)],
        func: `boolean('${getDbName(field)}')`
      });
    },
    Bytes(field) {
      return createField({
        field,
        imports: [namedImport(["customBytes"], `./${customBytesModule.name}`)],
        func: `customBytes('${getDbName(field)}')`
      });
    },
    // https://orm.drizzle.team/docs/column-types/mysql#datetime
    DateTime(field) {
      return createField({
        field,
        imports: [namedImport(["datetime"], coreModule)],
        func: `datetime('${getDbName(field)}', { mode: 'date', fsp: 3 })`,
        // https://github.com/drizzle-team/drizzle-orm/issues/921
        onDefault: (field2) => {
          if (hasDefault(field2) && isDefaultFunc(field2) && field2.default.name === "now") {
            return {
              imports: [namedImport(["sql"], "drizzle-orm")],
              code: ".default(sql`CURRENT_TIMESTAMP(3)`)"
            };
          }
          if (field2.type === "DateTime") {
            return {
              code: `.$defaultFn(() => new Date('${field2.default}'))`
            };
          }
        }
      });
    },
    // https://orm.drizzle.team/docs/column-types/mysql/#decimal
    Decimal(field) {
      return createField({
        field,
        imports: [namedImport(["decimal"], coreModule)],
        func: `decimal('${getDbName(field)}', { precision: 65, scale: 30 })`
      });
    },
    // https://orm.drizzle.team/docs/column-types/mysql/#float
    Float(field) {
      return createField({
        field,
        imports: [namedImport(["float"], coreModule)],
        func: `float('${getDbName(field)}')`
      });
    },
    // https://orm.drizzle.team/docs/column-types/mysql#integer
    Int(field) {
      return createField({
        field,
        imports: [namedImport(["int"], coreModule)],
        func: `int('${getDbName(field)}')`,
        onDefault(field2) {
          if (field2.isId && isDefaultFunc(field2) && field2.default.name === "autoincrement") {
            return {
              code: ".autoincrement()"
            };
          }
        }
      });
    },
    // https://orm.drizzle.team/docs/column-types/mysql#json
    Json(field) {
      return createField({
        field,
        imports: [namedImport(["json"], coreModule)],
        func: `json('${getDbName(field)}')`,
        onDefault: (field2) => ({
          code: `.$defaultFn(() => (${field2.default}))`
        })
      });
    },
    // https://orm.drizzle.team/docs/column-types/mysql/#text
    String(field) {
      return createField({
        field,
        imports: [namedImport(["text"], coreModule)],
        func: `text('${getDbName(field)}')`
      });
    }
  },
  extraModules: [customBytesModule]
});

// src/lib/adapter/providers/postgres.ts
var import_lodash6 = require("lodash");
var coreModule2 = "drizzle-orm/pg-core";
var customBytesModule2 = createModule({
  name: "custom-bytes",
  declarations: [
    {
      imports: [namedImport(["customType"], coreModule2)],
      code: `export const customBytes = customType<{ data: Buffer }>({
	dataType() {
		return 'bytea';
	},
	fromDriver(value: unknown) {
		if (Buffer.isBuffer(value)) return value
		throw new Error('Expected Buffer')
	},
	toDriver(value: Buffer) {
		return value
	}
});`
    }
  ]
});
var postgresAdapter = createAdapter({
  name: "postgres",
  getDeclarationFunc: {
    enum(name, values) {
      return {
        imports: [namedImport(["pgEnum"], coreModule2)],
        func: `pgEnum('${name}', [${values.map((v) => `'${v}'`).join(", ")}])`
      };
    },
    table(name, fields) {
      return {
        imports: [namedImport(["pgTable"], coreModule2)],
        func: `pgTable('${name}', { ${fields.map(({ field, func }) => `${field.name}: ${func}`).join(", ")} })`
      };
    }
  },
  fields: {
    enum(field) {
      const func = `${(0, import_lodash6.camelCase)(field.type)}Enum`;
      return createField({
        field,
        imports: [namedImport([func], `./${(0, import_lodash6.kebabCase)(field.type)}-enum`)],
        func: `${func}('${getDbName(field)}')`
      });
    },
    // https://orm.drizzle.team/docs/column-types/pg/#bigint
    BigInt(field) {
      return createField({
        field,
        imports: [namedImport(["bigint"], coreModule2)],
        func: `bigint('${getDbName(field)}', { mode: 'bigint' })`
      });
    },
    // https://orm.drizzle.team/docs/column-types/pg/#boolean
    Boolean(field) {
      return createField({
        field,
        imports: [namedImport(["boolean"], coreModule2)],
        func: `boolean('${getDbName(field)}')`
      });
    },
    // Prisma: https://www.prisma.io/docs/orm/reference/prisma-schema-reference#bytes:~:text=Default%20mapping-,PostgreSQL,-bytea
    Bytes(field) {
      return createField({
        field,
        imports: [namedImport(["customBytes"], `./${customBytesModule2.name}`)],
        func: `customBytes('${getDbName(field)}')`
      });
    },
    // https://orm.drizzle.team/docs/column-types/pg/#timestamp
    DateTime(field) {
      return createField({
        field,
        imports: [namedImport(["timestamp"], coreModule2)],
        func: `timestamp('${getDbName(
          field
        )}', { mode: 'date', precision: 3 })`
      });
    },
    // https://orm.drizzle.team/docs/column-types/pg/#decimal
    Decimal(field) {
      return createField({
        field,
        imports: [namedImport(["decimal"], coreModule2)],
        func: `decimal('${getDbName(field)}', { precision: 65, scale: 30 })`
      });
    },
    // https://orm.drizzle.team/docs/column-types/pg/#double-precision
    Float(field) {
      return createField({
        field,
        imports: [namedImport(["doublePrecision"], coreModule2)],
        func: `doublePrecision('${getDbName(field)}')`
      });
    },
    // https://orm.drizzle.team/docs/column-types/pg/#integer
    Int(field) {
      const func = hasDefault(field) && isDefaultFunc(field) && field.default.name === "autoincrement" ? (
        // https://arc.net/l/quote/mpimqrfn
        "serial"
      ) : "integer";
      return createField({
        field,
        imports: [namedImport([func], coreModule2)],
        func: `${func}('${getDbName(field)}')`
      });
    },
    // https://orm.drizzle.team/docs/column-types/pg/#jsonb
    Json(field) {
      return createField({
        field,
        imports: [namedImport(["jsonb"], coreModule2)],
        func: `jsonb('${getDbName(field)}')`
      });
    },
    // https://orm.drizzle.team/docs/column-types/pg/#text
    String(field) {
      return createField({
        field,
        imports: [namedImport(["text"], coreModule2)],
        func: `text('${getDbName(field)}')`
      });
    }
  },
  extraModules: [customBytesModule2]
});

// src/lib/adapter/providers/sqlite.ts
var coreModule3 = "drizzle-orm/sqlite-core";
var customDecimalModule = createModule({
  name: "custom-decimal",
  declarations: [
    {
      imports: [namedImport(["customType"], coreModule3)],
      code: `export const customDecimal = customType<{ data: string }>(
  {
    dataType() {
      return 'DECIMAL';
    },
    fromDriver(value: unknown) {
      return String(value)
    },
    toDriver(value: string) {
      return Number(value)
    },
  },
);`
    }
  ]
});
var customBigIntModule = createModule({
  name: "custom-bigint",
  declarations: [
    {
      imports: [namedImport(["customType"], coreModule3)],
      code: `export const customBigInt = customType<{ data: bigint }>(
  {
    dataType() {
      return 'INTEGER';
    },
    fromDriver(value: unknown): bigint {
      if (typeof value !== 'number') {
        throw new Error('Expected number type for INTEGER')
      }
      return BigInt(value);
    },
    toDriver(value: bigint): number {
      return Number(value);
    }
  },
);`
    }
  ]
});
var sqliteAdapter = createAdapter({
  name: "sqlite",
  getDeclarationFunc: {
    enum(_, __) {
      throw new Error("Prisma does not support enums");
    },
    table(name, fields) {
      return {
        imports: [namedImport(["sqliteTable"], coreModule3)],
        func: `sqliteTable('${name}', { ${fields.map(({ field, func }) => `${field.name}: ${func}`).join(", ")} })`
      };
    }
  },
  fields: {
    // Prisma: https://arc.net/l/quote/omrfeqos
    // Drizzle: https://orm.drizzle.team/docs/column-types/sqlite#bigint
    BigInt(field) {
      return createField({
        field,
        imports: [
          namedImport(["customBigInt"], `./${customBigIntModule.name}`)
        ],
        func: `customBigInt('${getDbName(field)}')`
      });
    },
    // Prisma: https://arc.net/l/quote/jurqgcxd
    // Drizzle: https://arc.net/l/quote/pxcgbjxz
    Boolean(field) {
      return createField({
        field,
        imports: [namedImport(["integer"], coreModule3)],
        func: `integer('${getDbName(field)}', { mode: 'boolean' })`
      });
    },
    Bytes(field) {
      return createField({
        field,
        imports: [namedImport(["blob"], coreModule3)],
        func: `blob('${getDbName(field)}', { mode: 'buffer' })`
      });
    },
    // Prisma: https://arc.net/l/quote/grwnsumx
    // Drizzle: https://arc.net/l/quote/fpupjigo
    DateTime(field) {
      return createField({
        field,
        imports: [namedImport(["integer"], coreModule3)],
        func: `integer('${getDbName(field)}', { mode: 'timestamp' })`
      });
    },
    // Prisma: https://arc.net/l/quote/sgkjrpxh
    // Drizzle: ..customized below using drizzle's `customType`..
    Decimal(field) {
      return createField({
        field,
        imports: [
          namedImport(["customDecimal"], `./${customDecimalModule.name}`)
        ],
        func: `customDecimal('${getDbName(field)}')`
      });
    },
    // Prisma: https://arc.net/l/quote/ozmbgwfq
    // Drizzle: https://orm.drizzle.team/docs/column-types/sqlite#real
    Float(field) {
      return createField({
        field,
        imports: [namedImport(["real"], coreModule3)],
        func: `real('${getDbName(field)}')`
      });
    },
    // Prisma: https://arc.net/l/quote/rwenryvc
    // Drizzle: https://orm.drizzle.team/docs/column-types/sqlite#integer
    Int(field) {
      return createField({
        field,
        imports: [namedImport(["integer"], coreModule3)],
        func: `integer('${getDbName(field)}', { mode: 'number' })`,
        onPrimaryKey(field2) {
          if (hasDefault(field2) && isDefaultFunc(field2) && field2.default.name === "autoincrement")
            return ".primaryKey({ autoIncrement: true })";
        }
      });
    },
    // Prisma: https://arc.net/l/quote/bddbqrja
    // Drizzle: https://orm.drizzle.team/docs/column-types/sqlite#text
    String(field) {
      return createField({
        field,
        imports: [namedImport(["text"], coreModule3)],
        func: `text('${getDbName(field)}')`
      });
    }
  },
  extraModules: [customDecimalModule, customBigIntModule]
});

// src/lib/config.ts
function isRelationalQueryEnabled(config) {
  const value = config["relationalQuery"];
  if (value === "false")
    return false;
  return true;
}

// src/lib/logger.ts
var import_sdk = require("@prisma/sdk");
var isVerbose = false;
function applyConfig(value) {
  var _a;
  isVerbose = ((_a = value.generator.config) == null ? void 0 : _a.verbose) === "true";
}
function log(message) {
  if (!isVerbose)
    return;
  import_sdk.logger.log(`${GENERATOR_NAME}: ${message}`);
}
function createTask() {
  if (!isVerbose)
    return { end: (_) => void 0 };
  const timeStarted = Date.now();
  return {
    end(message) {
      return log(`${message} in ${Date.now() - timeStarted}ms`);
    }
  };
}
var logger = {
  applyConfig,
  log,
  createTask
};

// src/generator.ts
var { version } = require_package();
(0, import_generator_helper.generatorHandler)({
  onManifest() {
    return {
      version,
      defaultOutput: "./drizzle",
      prettyName: GENERATOR_NAME
    };
  },
  onGenerate: async (options) => {
    var _a, _b;
    logger.applyConfig(options);
    logger.log("Generating drizzle schema...");
    if (options.datasources.length === 0)
      throw new Error("No datasource specified");
    if (options.datasources.length > 1)
      throw new Error("Only one datasource is supported");
    const adapter = getAdapter(options);
    const ctx = {
      adapter,
      config: options.generator.config,
      datamodel: options.dmmf.datamodel
    };
    const basePath = (_a = options.generator.output) == null ? void 0 : _a.value;
    if (!basePath)
      throw new Error("No output path specified");
    import_fs.default.existsSync(basePath) && import_fs.default.rmSync(basePath, { recursive: true });
    import_fs.default.mkdirSync(basePath, { recursive: true });
    (_b = adapter.extraModules) == null ? void 0 : _b.forEach((module2) => {
      const moduleCreation = logger.createTask();
      writeModule(basePath, module2);
      moduleCreation.end(`\u25DF ${module2.name}.ts`);
    });
    options.dmmf.datamodel.enums.forEach((prismaEnum) => {
      const enumCreation = logger.createTask();
      const enumModule = createModule({
        name: getEnumModuleName(prismaEnum),
        declarations: [generateEnumDeclaration(adapter, prismaEnum)]
      });
      writeModule(basePath, enumModule);
      enumCreation.end(`\u25DF ${enumModule.name}.ts`);
      return enumModule;
    });
    const modelModules = options.dmmf.datamodel.models.map((model) => {
      const modelCreation = logger.createTask();
      const modelModule = createModelModule({ model, ctx });
      writeModule(basePath, modelModule);
      modelCreation.end(`\u25DF ${modelModule.name}.ts`);
      return modelModule;
    });
    if (isRelationalQueryEnabled(options.generator.config)) {
      const relationalModules = modelModules.flatMap((modelModule) => {
        const creation = logger.createTask();
        const relationalModule = createRelationalModule({ ctx, modelModule });
        if (relationalModule == null)
          return [];
        writeModule(basePath, relationalModule);
        creation.end(`\u25DF ${relationalModule.name}.ts`);
        return relationalModule;
      });
      const implicitModelModules = relationalModules.flatMap((module2) => module2.implicit).reduce(deduplicateModels, []).map((model) => {
        const modelCreation = logger.createTask();
        const modelModule = createModelModule({ model, ctx });
        writeModule(basePath, modelModule);
        modelCreation.end(`\u25DF ${modelModule.name}.ts`);
        return modelModule;
      });
      const implicitRelationalModules = implicitModelModules.flatMap(
        (modelModule) => {
          const creation = logger.createTask();
          const relationalModule = createRelationalModule({ ctx, modelModule });
          if (relationalModule == null)
            return [];
          writeModule(basePath, relationalModule);
          creation.end(`\u25DF ${relationalModule.name}.ts`);
          return relationalModule;
        }
      );
      const schemaModule = createModule({
        name: "schema",
        declarations: [
          generateSchemaDeclaration([
            ...modelModules,
            ...relationalModules,
            ...implicitModelModules,
            ...implicitRelationalModules
          ])
        ]
      });
      writeModule(basePath, schemaModule);
    }
    const formatter = options.generator.config["formatter"];
    if (formatter === "prettier") {
      (0, import_child_process.execSync)(`prettier --write ${basePath}`, { stdio: "inherit" });
    }
  }
});
function reduceImports(imports) {
  const plan = (0, import_function4.pipe)(
    imports,
    (0, import_Array3.reduce)({ toReduce: [], skipped: [] }, (plan2, command) => {
      if (command.type === "namedImport") {
        plan2.toReduce.push(command);
      } else {
        plan2.skipped.push(command);
      }
      return plan2;
    })
  );
  return [
    ...plan.skipped,
    ...(0, import_function4.pipe)(
      plan.toReduce,
      (0, import_Array3.reduce)(/* @__PURE__ */ new Map(), (accum, command) => {
        if (command.type !== "namedImport")
          return accum;
        const imports2 = new Set(accum.get(command.module));
        command.names.forEach((name) => imports2.add(name));
        return accum.set(command.module, imports2);
      }),
      (map3) => Array.from(map3),
      (0, import_Array3.map)(([path2, names]) => namedImport(Array.from(names), path2))
    )
  ];
}
function writeModule(basePath, module2) {
  const writeLocation = import_path.default.join(basePath, `${module2.name}.ts`);
  import_fs.default.writeFileSync(writeLocation, module2.code);
}
function getAdapter(options) {
  return (() => {
    switch (options.datasources[0].provider) {
      case "cockroachdb":
      case "postgres":
      case "postgresql":
        return postgresAdapter;
      case "mysql":
        return mysqlAdapter;
      case "sqlite":
        return sqliteAdapter;
      default:
        throw new Error(
          `Connector ${options.datasources[0].provider} is not supported`
        );
    }
  })();
}
function deduplicateModels(accum, model) {
  if (accum.some(({ name }) => name === model.name))
    return accum;
  return [...accum, model];
}
function createRelationalModule(input) {
  const { model } = input.modelModule;
  const relationalFields = model.fields.filter(isRelationField);
  if ((0, import_lodash7.isEmpty)(relationalFields))
    return void 0;
  const declaration = generateTableRelationsDeclaration({
    fields: relationalFields,
    modelModule: input.modelModule,
    datamodel: input.ctx.datamodel
  });
  return createModule({
    name: `${input.modelModule.name}-relations`,
    declarations: [declaration],
    implicit: declaration.implicit
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  reduceImports
});
