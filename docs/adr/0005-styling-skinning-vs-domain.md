# ADR 0005: Styling Skinning vs Domain Split

## Status

Accepted

## Context

The Foundry system has both global reskinning needs and component-specific layout needs. Mixing those concerns causes duplicated CSS, inconsistent typography, and fragile overrides.

## Decision

Keep skinning and domain styling separate.

Skinning files own global Foundry element styling, design tokens, heading scale, shared visual techniques, and rules that apply across contexts.

Domain files own layout and positioning that are specific to actors, items, injections, or a single sheet area.

## Consequences

Before adding a domain style, check whether it applies globally. If it does, add or update skinning instead.

Domain files should not redeclare heading font sizes, generic button colours, or other skinning-owned defaults.
