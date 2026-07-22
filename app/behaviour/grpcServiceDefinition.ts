import * as grpc from '@grpc/grpc-js';
import * as protobuf from 'protobufjs';

function serialize(type: protobuf.Type, value: object): Buffer {
  return Buffer.from(type.encode(value).finish());
}

function deserialize(type: protobuf.Type, value: Buffer): object {
  return type.decode(value);
}

export function serviceDefinitionFromProtobuf(service: protobuf.Service): grpc.ServiceDefinition {
  const definition: { [methodName: string]: grpc.MethodDefinition<any, any> } = {};

  Object.keys(service.methods).forEach((methodName: string) => {
    const method = service.methods[methodName];
    const requestType = method.resolvedRequestType as protobuf.Type;
    const responseType = method.resolvedResponseType as protobuf.Type;

    definition[methodName] = {
      path: `/${service.fullName.replace(/^\./, '')}/${methodName}`,
      requestStream: !!method.requestStream,
      responseStream: !!method.responseStream,
      requestSerialize: (value: object) => serialize(requestType, value),
      requestDeserialize: (value: Buffer) => deserialize(requestType, value),
      responseSerialize: (value: object) => serialize(responseType, value),
      responseDeserialize: (value: Buffer) => deserialize(responseType, value),
    };

  });

  return definition as grpc.ServiceDefinition;
}

export function grpcObjectFromProtobuf(root: protobuf.Root): object {
  const result: { [key: string]: any } = {};

  root.nestedArray.forEach(nested => addNestedObject(result, nested));

  return result;
}

function addNestedObject(target: { [key: string]: any }, nested: protobuf.ReflectionObject): void {
  if (nested instanceof protobuf.Service) {
    target[nested.name] = grpc.makeGenericClientConstructor(
      serviceDefinitionFromProtobuf(nested),
      nested.fullName.replace(/^\./, '')
    );
    return;
  }

  if (nested instanceof protobuf.Namespace) {
    const namespace: { [key: string]: any } = {};
    target[nested.name] = namespace;
    nested.nestedArray.forEach(child => addNestedObject(namespace, child));
  }
}
