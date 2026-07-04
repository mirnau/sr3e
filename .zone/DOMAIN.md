## Domain Terms

**Vehicles/Drones (SR3 p.130-138, p.256, p.307)**

Core ratings:
- **Handling** — base TN for Driving Tests. Ground vehicles split into Road / Off-Road values (p.130).
- **Speed** — max safe speed (m/turn, p.132).
- **Acceleration** — speed gained per turn (p.132).
- **Body** — mass/structural integrity; also gates how many weapon mounts fit (p.132).
- **Armor** — hardened composite; ignores damage from weapons with modified Power ≤ rating (p.132).
- **Signature** — TN for sensors/missiles to detect the vehicle (p.133).
- **Autonav** — navigation/collision-avoidance rating (p.133).
- **Pilot** — autonomous decision-making rating, primarily relevant to drones (p.133).
- **Sensor** — detection/identification rating (p.133).
- **Cargo Factor (CF)** — available internal space (p.133).
- **Load** — max cargo weight in kg (p.133).
- **Seating** / **Entry Points** — passenger capacity/arrangement and door/hatch count (p.133).
- **Flux** — raw electrical power for remote decks/sensors (p.133).
- **ECM / ECCM** — electronic warfare ratings (p.133, p.138).

## Invariants

- Vehicles have no Stun track — only a single 10-box Physical condition monitor (p.145):
  - Light: +1 TN.
  - Moderate: +2 TN, -2 Initiative (Driver), -25% Speed.
  - Serious: +3 TN, -3 Initiative (Driver), -50% Speed; Rigger resists 6M damage.
  - Destroyed: vehicle crashes; Rigger resists 6S damage.
- Weapon mounts cost Body: **Hardpoint = 2 Body**, **Firmpoint = 1 Body** (p.307). Total mount Body cost must not exceed the vehicle's Body rating.

## Workflows

- **Maneuver Score** (p.138) = Vehicle Points + Terrain Points + Speed Points + Driver Points. Computed per turn during vehicle combat/chases.
- **Control Pool** (p.256) — available to Riggers; equals Reaction, modified by VCR (vehicle control rig).
- **Sensor Range** (p.136) is determined by the vehicle's Flux rating.

## External Systems
## Risks
