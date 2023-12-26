import fs from 'fs'
import {
  DMMF,
  generatorHandler,
  GeneratorOptions,
} from '@prisma/generator-helper'
import { logger } from './lib/logger'
import path from 'path'
import { GENERATOR_NAME } from './constants'
import { writeFileSafely } from './utils/writeFileSafely'
import pluralize from 'pluralize'
import { camelCase, isEmpty, kebabCase } from 'lodash'
import { v } from './lib/value'
import { createValue, IValue } from './lib/value/createValue'
import { pipe } from 'fp-ts/lib/function'
import { render } from './lib/value/utils'
import { Adapter, mysqlAdapter, pgAdapter } from './lib/adapter/adapter'
import { or } from 'fp-ts/lib/Refinement'
import { defineBigint } from './lib/adapter/columns/defineBigint'
import { IColumnValue } from './lib/adapter/base/defineColumn'
import { defineBoolean } from './lib/adapter/columns/defineBoolean'
import { defineDatetime } from './lib/adapter/columns/defineDatetime'
import { defineDecimal } from './lib/adapter/columns/defineDecimal'
import { defineFloat } from './lib/adapter/columns/defineFloat'
import { defineInt } from './lib/adapter/columns/defineInt'
import { defineJson } from './lib/adapter/columns/defineJson'
import { defineString } from './lib/adapter/columns/defineString'
import { defineEnum } from './lib/adapter/columns/defineEnum'
import { flatMap, map, reduce } from 'fp-ts/lib/Array'
import { ImportValue, NamedImport } from './lib/value/types/import'

const { version } = require('../package.json')

generatorHandler({
  onManifest() {
    logger.log('Generating drizzle schema...')
    return {
      version,
      defaultOutput: './drizzle',
      prettyName: GENERATOR_NAME,
    }
  },
  onGenerate: async (options: GeneratorOptions) => {
    if (options.datasources.length === 0)
      throw new Error('No datasource specified')
    if (options.datasources.length > 1)
      throw new Error('Only one datasource is supported')

    const adapter = getAdapter(options)

    const basePath = options.generator.output?.value
    if (!basePath) throw new Error('No output path specified')

    fs.existsSync(basePath) && fs.rmSync(basePath, { recursive: true })

    for await (const prismaEnum of options.dmmf.datamodel.enums) {
      const enumCreation = logger.createTask()

      const enumModule = defineModule({
        name: getEnumModuleName(prismaEnum),
        declarations: [defineEnumVar(adapter, prismaEnum)],
      })
      await writeModule(basePath, enumModule)

      enumCreation.end(`◟ ${enumModule.name}.ts`)
    }

    const models: ModelModule[] = []
    for await (const model of options.dmmf.datamodel.models) {
      const modelCreation = logger.createTask()

      const modelModule = defineModelModule({ adapter, model })
      await writeModule(basePath, modelModule)

      models.push(modelModule)

      modelCreation.end(`◟ ${modelModule.name}.ts`)
    }

    const schemaModule = defineModule({
      name: 'schema',
      declarations: [defineSchemaVar(models)],
    })
    await writeModule(basePath, schemaModule)
  },
})

function defineSchemaVar(models: ModelModule[]) {
  const aliasFor = (m: ModelModule) => camelCase(m.name)

  return createValue({
    imports: models.map((m) => v.wilcardImport(aliasFor(m), `./${m.name}`)),
    render: v.defineVar(
      'schema', // Aggregated schemas
      v.object(models.map((m) => v.useVar(aliasFor(m)))),
      { export: true }
    ).render,
  })
}

function defineEnumVar(adapter: Adapter, prismaEnum: DMMF.DatamodelEnum) {
  const varName = getEnumVarName(prismaEnum)

  const enumDef = createValue({
    imports: [v.namedImport([adapter.functions.enum], adapter.module)],
    render: v.defineVar(
      varName,
      adapter.definition.enum.declare(
        prismaEnum.dbName ?? prismaEnum.name,
        prismaEnum.values.map((value) => value.dbName ?? value.name)
      ),
      { export: true }
    ).render,
  })
  return enumDef
}

function reduceImports(imports: ImportValue[]) {
  type Plan = { toReduce: NamedImport[]; skipped: ImportValue[] }

  const plan = pipe(
    imports,
    reduce({ toReduce: [], skipped: [] } as Plan, (plan, command) => {
      if (command.type === 'namedImport') {
        plan.toReduce.push(command)
      } else {
        plan.skipped.push(command)
      }
      return plan
    })
  )

  return [
    ...plan.skipped,
    ...pipe(
      plan.toReduce,
      reduce(new Map<string, Set<string>>(), (accum, command) => {
        if (command.type !== 'namedImport') return accum

        const imports = new Set(accum.get(command.module))
        command.names.forEach((name) => imports.add(name))

        return accum.set(command.module, imports)
      }),
      (map) => Array.from(map),
      map(([path, names]) => v.namedImport(Array.from(names), path))
    ),
  ]
}

function defineTableVar(adapter: Adapter, model: DMMF.Model) {
  const fields = model.fields
    .filter(pipe(isKind('scalar'), or(isKind('enum'))))
    .map(getField(adapter))
  const name = getModelVarName(model)

  return createValue({
    name,
    imports: [
      v.namedImport([adapter.functions.table], adapter.module),
      ...fields.flatMap((field) => field.imports),
    ],
    render: v.defineVar(
      name,
      adapter.table(
        model.name,
        fields.map((field) => [field.field, field])
      ),
      { export: true }
    ).render,
  })
}

function defineTableRelationsVar(
  tableVarName: string,
  fields: DMMFRelationField[]
) {
  const _fields = fields.map(getRelationField(tableVarName))

  const relationVar = v.defineVar(
    `${tableVarName}Relations`,
    v.func('relations', [
      v.useVar(tableVarName),
      v.lambda(
        v.useVar('helpers'),
        v.object(_fields.map((field) => [field.name, field]))
      ),
    ]),
    { export: true }
  )

  return createValue({
    imports: [
      v.namedImport(['relations'], 'drizzle-orm'),
      ..._fields.flatMap((field) => field.imports),
    ],
    render: relationVar.render,
  })
}

async function writeModule(basePath: string, module: Module) {
  const writeLocation = path.join(basePath, `${module.name}.ts`)
  await writeFileSafely(writeLocation, module.render())
}

function getAdapter(options: GeneratorOptions) {
  return (() => {
    switch (options.datasources[0].provider) {
      case 'postgres':
      case 'postgresql':
        return pgAdapter
      case 'mysql':
        return mysqlAdapter
      default:
        throw new Error(
          `Connector ${options.datasources[0].provider} is not supported`
        )
    }
  })()
}

function getField(adapter: Adapter) {
  return function (field: DMMF.Field): IColumnValue {
    if (field.kind === 'enum') {
      return defineEnum(adapter, field)
    }

    switch (field.type) {
      case 'BigInt': {
        return defineBigint(adapter, field)
      }
      case 'Boolean': {
        return defineBoolean(adapter, field)
      }
      case 'DateTime': {
        return defineDatetime(adapter, field)
      }
      case 'Decimal': {
        return defineDecimal(adapter, field)
      }
      case 'Float': {
        return defineFloat(adapter, field)
      }
      case 'Int': {
        return defineInt(adapter, field)
      }
      case 'Json': {
        return defineJson(adapter, field)
      }
      case 'String': {
        return defineString(adapter, field)
      }
      default:
        throw new Error(`Type ${field.type} is not supported`)
    }
  }
}

function getRelationField(tableVarName: string) {
  return function (field: DMMFRelationField) {
    const relationVarName = getModelVarName(field.type)

    const args = [v.useVar(relationVarName)]
    if (hasReference(field)) {
      args.push(
        v.object([
          [
            'fields',
            pipe(
              field.relationFromFields,
              map((f) => v.useVar(`${tableVarName}.${camelCase(f)}`)),
              v.array
            ),
          ],
          [
            'references',
            pipe(
              field.relationToFields,
              map((f) => v.useVar(`${relationVarName}.${camelCase(f)}`)),
              v.array
            ),
          ],
        ])
      )
    }

    const func = v.func(field.isList ? 'helpers.many' : 'helpers.one', args)

    return createValue({
      name: field.name,
      imports: [
        v.namedImport([relationVarName], `./${getModelModuleName(field.type)}`),
      ],
      render: func.render,
    })
  }
}

// #region Enum
function getEnumVarName(prismaEnum: DMMF.DatamodelEnum) {
  return `${camelCase(prismaEnum.name)}Enum`
}

function getEnumModuleName(prismaEnum: DMMF.DatamodelEnum) {
  return kebabCase(getEnumVarName(prismaEnum))
}
// #endregion

function isKind(kind: DMMF.FieldKind) {
  return (field: DMMF.Field): field is DMMF.Field => field.kind === kind
}

function getModelVarName(model: DMMF.Model | string) {
  return camelCase(pluralize(typeof model === 'string' ? model : model.name))
}

function getModelModuleName(model: DMMF.Model | string) {
  return kebabCase(pluralize(typeof model === 'string' ? model : model.name))
}

type DMMFRelationField = DMMF.Field &
  Required<Pick<DMMF.Field, 'relationFromFields' | 'relationToFields'>>

function isRelationField(field: DMMF.Field): field is DMMFRelationField {
  return (
    field.kind === 'object' &&
    field.relationFromFields != null &&
    field.relationToFields != null
  )
}

function insertIf<T>(value: T | null | undefined): T[] {
  if (value == null) return []
  return [value]
}

/**
 * Not a derived relation in which the model holds the reference
 */
function hasReference(field: DMMFRelationField) {
  return (
    field.relationFromFields.length > 0 && field.relationToFields.length > 0
  )
}

function defineModule(input: {
  declarations: (IValue & { imports: ImportValue[] })[]
  name: string
}) {
  return createValue({
    name: input.name,
    render() {
      const imports = pipe(
        input.declarations,
        flatMap((d) => d.imports),
        reduceImports
      )

      return [
        imports.map(render).join('\n'),
        ...input.declarations.map(render),
      ].join('\n\n')
    },
  })
}
type Module = ReturnType<typeof defineModule>

function defineModelModule(input: { model: DMMF.Model; adapter: Adapter }) {
  const tableVar = defineTableVar(input.adapter, input.model)

  const relationalFields = input.model.fields.filter(isRelationField)
  const relationsVar = isEmpty(relationalFields)
    ? null
    : defineTableRelationsVar(tableVar.name, relationalFields)

  return defineModule({
    name: getModelModuleName(input.model),
    declarations: [tableVar, ...insertIf(relationsVar)],
  })
}
type ModelModule = ReturnType<typeof defineModelModule>
