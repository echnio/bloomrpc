import * as protobuf from 'protobufjs';
import { serviceDefinitionFromProtobuf } from '../grpcServiceDefinition';

describe('serviceDefinitionFromProtobuf', () => {
  it('creates grpc-js definitions that serialize protobuf messages', () => {
    const root = protobuf.Root.fromJSON({
      nested: {
        example: {
          nested: {
            Request: { fields: { message: { type: 'string', id: 1 } } },
            Response: { fields: { message: { type: 'string', id: 1 } } },
            Echo: {
              methods: {
                Unary: { requestType: 'Request', responseType: 'Response', comment: '' },
                Stream: {
                  requestType: 'Request',
                  responseType: 'Response',
                  requestStream: true,
                  responseStream: true,
                  comment: '',
                },
              },
            },
          },
        },
      },
    });
    root.resolveAll();

    const service = root.lookupService('example.Echo');
    const definition = serviceDefinitionFromProtobuf(service);
    const unary = definition.Unary;
    const stream = definition.Stream;

    expect(unary.requestStream).toBe(false);
    expect(unary.responseStream).toBe(false);
    expect(unary.requestDeserialize(unary.requestSerialize({ message: 'hello' }))).toEqual({ message: 'hello' });
    expect(stream.requestStream).toBe(true);
    expect(stream.responseStream).toBe(true);
  });
});
