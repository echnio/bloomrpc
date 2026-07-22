# Apple Silicon Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a native Apple Silicon macOS DMG without the deprecated native `grpc` module.

**Architecture:** Replace runtime `grpc` imports with `@grpc/grpc-js`; translate protobufjs reflection services to grpc-js service definitions locally. A package script makes electron-builder target macOS arm64 only.

**Tech Stack:** Electron 7, electron-builder, TypeScript, Jest, protobufjs, @grpc/grpc-js.

---

### Task 1: Convert reflected protobuf services for grpc-js

**Files:**
- Create: `app/behaviour/grpcServiceDefinition.ts`
- Create: `app/behaviour/__tests__/grpcServiceDefinition.test.ts`
- Modify: `app/behaviour/importProtos.ts`

- [ ] Write tests that require a protobufjs service and verify unary/streaming flags and message serialization.
- [ ] Run the focused Jest test and observe failure because the converter is absent.
- [ ] Implement the smallest protobufjs-to-grpc-js definition converter.
- [ ] Run the focused test and verify it passes.

### Task 2: Remove the native gRPC runtime dependency

**Files:**
- Modify: `app/behaviour/sendRequest.ts`
- Modify: `app/behaviour/importProtos.ts`
- Modify: `app/package.json`
- Modify: `app/package-lock.json`
- Modify: `app/yarn.lock`
- Modify: `internals/scripts/ElectronRebuild.js`

- [ ] Replace all runtime `grpc` imports with grpc-js and connect reflection to the converter.
- [ ] Remove `grpc` from production dependencies and obsolete rebuild wiring.
- [ ] Install dependencies and verify no `grpc` package remains.

### Task 3: Add a native Apple Silicon packaging entry point

**Files:**
- Modify: `package.json`

- [ ] Add `package-mac-arm64` invoking electron-builder with `--mac --arm64`.
- [ ] Run TypeScript/Jest checks, then invoke the packaging command and inspect the generated DMG architecture.
