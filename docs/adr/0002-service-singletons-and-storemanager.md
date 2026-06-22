# ADR 0002: Service Singletons and StoreManager Data Access

## Status

Accepted

## Context

Foundry systems are long-lived browser applications with global framework state. The project needs consistent access to workflow services and shared document stores without duplicate hook registration or component-owned persistence logic.

## Decision

Use singleton services with static `Instance` getters for domain workflows and utility services.

Use IStoreManager for continuous sheet data access. StoreManager provides read/write stores, read-only stores, flag stores, shallow stores, and derived simple-stat stores. It owns lifecycle and cleanup for Foundry hooks.

## Consequences

Services should be the first place to put business rules, validation, and multi-document workflows.

Svelte components should subscribe to stores and call service methods; they should not construct ad-hoc Foundry update logic.

StoreManager API additions should be general enough to remove real duplication, such as `GetSimpleStatROStore(document, dataPath)` replacing repeated local value-plus-modifier helpers.
