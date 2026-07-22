import * as fs from 'fs';
import * as path from 'path';
import * as protobuf from 'protobufjs';
import { v4 as uuidv4 } from 'uuid';
import { grpcObjectFromProtobuf } from './grpcServiceDefinition';

export interface Proto {
  fileName: string;
  filePath: string;
  protoText: string;
  ast: object;
  root: protobuf.Root;
}

export interface ServiceMethodsPayload {
  [methodName: string]: () => { plain: object; message: object };
}

export async function fromFileName(protoPath: string, includeDirs: string[] = []): Promise<Proto> {
  const root = new protobuf.Root();
  const includePaths = [...includeDirs, path.dirname(path.resolve(protoPath))];
  const resolvePath = root.resolvePath;

  root.resolvePath = (origin, target) => {
    if (path.isAbsolute(target)) return target;

    const resolved = includePaths
      .map(includePath => path.join(includePath, target))
      .find(candidate => fs.existsSync(candidate));

    return resolved || resolvePath(origin, target);
  };

  await root.load(protoPath, { keepCase: true });
  root.resolveAll();

  return {
    fileName: path.basename(protoPath),
    filePath: protoPath,
    protoText: await readFile(protoPath),
    ast: grpcObjectFromProtobuf(root),
    root,
  };
}

export function walkServices(proto: Proto, onService: (service: protobuf.Service, definition: any, serviceName: string) => void): void {
  const visit = (nested: protobuf.ReflectionObject) => {
    if (nested instanceof protobuf.Service) {
      const serviceName = nested.fullName.replace(/^\./, '');
      onService(nested, getNested(proto.ast, serviceName), serviceName);
      return;
    }

    if (nested instanceof protobuf.Namespace) nested.nestedArray.forEach(visit);
  };

  proto.root.nestedArray.forEach(visit);
}

export function mockRequestMethods(service: protobuf.Service): ServiceMethodsPayload {
  return Object.keys(service.methods).reduce((methods: ServiceMethodsPayload, methodName: string) => {
    const method = service.methods[methodName];
    const requestType = method.resolvedRequestType as protobuf.Type;

    methods[methodName] = () => {
      const plain = mockTypeFields(requestType);
      return { plain, message: requestType.fromObject(plain) };
    };

    return methods;
  }, {});
}

function getNested(value: any, pathName: string): any {
  return pathName.split('.').reduce((current, key) => current && current[key], value);
}

function readFile(fileName: string): Promise<string> {
  return new Promise((resolve, reject) => fs.readFile(fileName, 'utf8', (error, content) => error ? reject(error) : resolve(content)));
}

function mockTypeFields(type: protobuf.Type, stackDepth: { [name: string]: number } = {}): any {
  if ((stackDepth[type.fullName] || 0) >= 3) return {};
  const nextStackDepth = { ...stackDepth, [type.fullName]: (stackDepth[type.fullName] || 0) + 1 };

  return type.fieldsArray.reduce((data: any, field: protobuf.Field) => {
    const value = mockField(field, nextStackDepth);
    if (value !== undefined) data[field.name] = field.repeated ? [value] : value;
    return data;
  }, {});
}

function mockField(field: protobuf.Field, stackDepth: { [name: string]: number }): any {
  field.resolve();
  if (field.resolvedType instanceof protobuf.Type) return mockTypeFields(field.resolvedType, stackDepth);
  if (field.resolvedType instanceof protobuf.Enum) return field.resolvedType.values[Object.keys(field.resolvedType.values)[0]];

  switch (field.type) {
    case 'string': return /(^id|id$)/i.test(field.name) ? uuidv4() : 'Hello';
    case 'bool': return true;
    case 'double': return 1.4;
    case 'float': return 1.1;
    case 'bytes': return Buffer.from('Hello');
    case 'int32': case 'int64': case 'uint32': case 'uint64':
    case 'sint32': case 'sint64': case 'fixed32': case 'fixed64':
    case 'sfixed32': case 'sfixed64': return 1;
    default: return undefined;
  }
}
