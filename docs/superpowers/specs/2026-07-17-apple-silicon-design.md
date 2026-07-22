# Apple Silicon Support Design

## Goal

Build a macOS arm64 DMG that runs natively on Apple Silicon Macs.

## Design

The app will stop depending on the deprecated native `grpc` module. Runtime
gRPC calls will use the existing pure-JavaScript `@grpc/grpc-js` dependency.
The reflection path will convert its protobufjs services into grpc-js service
definitions so reflected services remain callable.

Packaging will expose a dedicated `package-mac-arm64` script that builds only
the macOS arm64 DMG. Legacy cross-platform scripts are retained.

## Verification

Tests will cover conversion of unary and streaming protobuf service methods to
grpc-js definitions. Dependency installation, TypeScript compilation, and the
arm64 packaging command will be run locally.
