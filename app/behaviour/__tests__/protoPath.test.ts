import { isReflectionTarget } from '../protoPath';

describe('isReflectionTarget', () => {
  it('does not treat local proto files as reflection targets', () => {
    expect(isReflectionTarget('/tmp/example/service.proto')).toBe(false);
  });

  it('accepts host and port reflection targets', () => {
    expect(isReflectionTarget('localhost:50051')).toBe(true);
  });
});
