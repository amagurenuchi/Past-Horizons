# 3D Extraction Shooter Implementation Plan (Phaser 4)

This plan details building a 3D extraction shooter using **Phaser 4** as the game framework, with Three.js + Ammo.js for 3D world simulation/rendering and Firebase for persistence. It keeps the same gameplay scope (6-tier ammo/armor, equipment, crafting, auction house), adds a special anti-flesh ammo (RIP) type, and updates architecture and sequencing to fit Phaser 4.

## Tech Stack

- **Game Framework**: Phaser 4.x (scene lifecycle, input, UI layer, timing/events)
- **3D Rendering**: Three.js (scene, camera, lighting, glTF models)
- **Physics**: Ammo.js (collision, rigid body simulation)
- **Persistence**: Firebase (Firestore, Auth)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Package Manager**: npm
- **Future**: Electron wrapper for desktop support

> Notes for Phaser 4 readiness:
> - Avoid Phaser 3-only APIs/pattern assumptions.
> - Isolate all framework calls behind adapters (`PhaserAppAdapter`, `InputAdapter`, `UiAdapter`) to reduce upgrade risk while Phaser 4 stabilizes.

## Project Structure

```text
/src
  /assets
    /models
    /textures
    /audio
  /core
    /app (Phaser 4 bootstrap + lifecycle adapters)
    /physics (Ammo.js wrapper)
    /rendering (Three.js integration)
    /game-state (session lifecycle)
  /systems
    /combat
    /inventory
    /crafting
    /auction
    /extraction
    /ai
  /ui
    /hud
    /menus
    /inventory
    /components (framework-agnostic UI model + Phaser 4 bindings)
  /data
    /tiers
    /items
    /recipes
  /firebase
    /auth
    /firestore
  main.ts
```

## Core Systems Architecture

### 1) Phaser 4 + Three.js Runtime Integration

**Approach**: Phaser 4 owns app lifecycle, input, overlays/UI, and state transitions. Three.js owns 3D scene rendering.

**Components**:
- `PhaserAppAdapter`: Initializes Phaser 4 and maps lifecycle hooks
- `ThreeRenderer`: Three.js scene/camera/renderer management
- `FrameOrchestrator`: Single frame tick coordinator (Phaser update -> gameplay sim -> Three render -> UI sync)
- `ModelLoader`: glTF loading and asset cache
- `CameraController`: FP/TP camera modes and transitions

**Implementation**:
- Initialize Phaser 4 app and mount UI layer first
- Create Three.js renderer and attach canvas under/over Phaser layer (based on desired UI composition)
- Use one authoritative game tick source to avoid drift
- Keep UI data flow one-way: systems -> view models -> Phaser UI bindings

### 2) Physics System (Ammo.js)

**Components**:
- `PhysicsWorld`: World setup and stepping
- `RigidBody`: Thin wrapper for body creation and syncing
- `CollisionHandler`: Contact filtering and events
- `CharacterController`: Movement, jump, slopes, grounding

**Implementation**:
- Load Ammo.js WASM during boot phase
- Fixed-step simulation (e.g., 60Hz) with accumulator
- Sync render transforms after physics update
- Separate collision layers (player, enemy, projectile, loot, environment)

### 3) Ammo/Armor Tier System (6 Tiers)

**Tier Definitions**:
- **Penetration is per ammo variant**, not per caliber. A caliber can have multiple penetration levels.
- **Bolt-action rifle ammo**: penetration Lv.2-Lv.6
- **Full-auto / semi-auto rifle ammo**: penetration Lv.1-Lv.5
- **SMG-only ammo**: penetration Lv.1-Lv.4, including **RIP ammo** (high flesh damage, no penetration, only minor armor chip)
- **Armor split by slot**: **helmet** and **vest**, each with tier + durability
- **Armor durability scaling**: higher tier = higher max durability
- **Broken armor behavior**: when helmet/vest durability reaches 0, that slot is treated as unarmored (tier 0)

**Damage Rules**:
```ts
function calculateDamage(
  penetrationLevel: number,
  armorTier: number,
  baseDamage: number,
  ammoProfile: 'standard' | 'rip' = 'standard'
) {
  if (ammoProfile === 'rip') {
    if (armorTier > 0) {
      return { healthDamage: 0, armorDamage: baseDamage * 0.15, penetrated: false };
    }

    return { healthDamage: baseDamage * 1.35, armorDamage: 0, penetrated: false };
  }

  if (armorTier > penetrationLevel) {
    return { healthDamage: 0, armorDamage: baseDamage * 0.5, penetrated: false };
  }

  if (armorTier === penetrationLevel) {
    return { healthDamage: baseDamage * 0.5, armorDamage: baseDamage * 0.5, penetrated: false };
  }

  if (armorTier < penetrationLevel - 1) {
    return { healthDamage: baseDamage, armorDamage: baseDamage * 0.25, penetrated: true };
  }

  return { healthDamage: baseDamage * 0.75, armorDamage: baseDamage * 0.5, penetrated: false };
}
```

### 4) Equipment & Inventory System

**Components**:
- `InventoryManager`: Grid storage + stacking rules
- `EquipmentManager`: Loadout slots and constraints
- `ItemDatabase`: Item definitions and stat lookup

**Inventory Rules**:
- Grid-based stash (target: 10x20)
- Stackable (ammo, meds), non-stackable (weapons, armor)
- Weight and ergonomics modifiers impact movement/aim

**Equipment Slots**:
- Primary weapon
- Secondary weapon
- Head, body, leg armor
- Quick meds
- Quick ammo

**Phaser 4 UI Strategy**:
- Prefer framework-agnostic UI view models
- Phaser 4 bindings render slot grids/text/icons
- Drag/drop through input adapter abstraction

### 5) Crafting System

**Components**:
- `CraftingManager`
- `RecipeDatabase`
- `MaterialManager`

**Recipe Model**:
```ts
interface Recipe {
  id: string;
  resultItem: string;
  resultQuantity: number;
  materials: { materialId: string; quantity: number }[];
  requiredTier: number;
  craftTime: number;
}
```

**Material Rarity**:
- Scrap metal (common)
- Electronics (uncommon)
- Chemicals (rare)
- Components (epic)
- Tech parts (legendary)

**Ammo Crafting Additions**:
- Add recipes for `rip` variants of SMG calibers
- RIP ammo costs fewer penetrator materials but more soft-core materials
- Restrict RIP rounds from armor penetration via ammo profile flags
- Add caliber-specific multi-level ammo recipes (same caliber, different penetration Lv)

### 6) Auction House System

**Components**:
- `AuctionManager`
- `MarketplaceUI`
- `TransactionHandler`

**Firestore Model**:
```ts
// /auctions/{auctionId}
{
  sellerId: string,
  itemId: string,
  itemData: object,
  price: number,
  listedAt: Timestamp,
  expiresAt: Timestamp,
  status: 'active' | 'sold' | 'expired'
}
```

**Rules**:
- 24-hour listing duration
- 5% transaction fee
- Seller cancellation allowed before sale

### 7) Extraction System

**Components**:
- `ExtractionZone`
- `ExtractionManager`
- `ExtractionUI`

**Logic**:
- 10-second in-zone countdown
- Reset on zone exit
- Multi-point extraction per map
- Success triggers raid finalization and loot commit

### 8) Map System

**Components**:
- `TerrainGenerator`
- `BuildingManager`
- `NavigationMesh`

**Map Features**:
- 2km x 2km target world size
- Heightmap terrain
- Interior-enabled buildings
- Edge and risk-based extraction points

### 9) AI Enemy System

**Components**:
- `AIController`
- `Pathfinding`
- `CombatAI`

**States**:
- Patrol
- Investigate
- Combat
- Search

**Enemy Bands**:
- Scavengers (T1-T2)
- Soldiers (T3-T4)
- Operators (T5-T6)

### 10) Session Management

**Components**:
- `SessionManager`
- `LootManager`
- `ProgressionManager`

**Session Flow**:
1. Choose loadout
2. Deploy
3. 20-minute raid timer
4. Loot/combat/survive
5. Extract or die
6. Persist outcomes

### 11) Firebase Integration

**Components**:
- `FirebaseAuth`
- `FirestoreService`
- `RealtimeManager`

**Collections**:
- `users/{userId}`: inventory, equipment, currency, stats, unlocks
- `auctions/{auctionId}`: listing lifecycle + pricing

## Phaser 4-Specific Delivery Strategy

### A) Framework Isolation Layer (Required)

Create adapters so gameplay systems do not directly depend on Phaser internals:
- `IInputService`
- `ITimerService`
- `IUiRenderer`
- `ISceneLifecycle`

This allows easier Phaser 4 API updates without rewriting combat/inventory/crafting logic.

### B) Rendering Ownership Rules

- Gameplay state never reads directly from render objects
- Renderers are subscribers to authoritative simulation state
- Keep conversion boundaries explicit (`WorldTransform -> RenderTransform`)

### C) Migration Guardrails

- No direct reuse of Phaser 3 plugins without compatibility check
- Ban hardcoded Phaser 3 scene/UI assumptions in new code
- Add smoke tests around boot, input, scene transition, and HUD updates

## Implementation Phases

### Phase 1: Phaser 4 Foundation
- Boot Phaser 4 + Vite + TypeScript
- Build adapter interfaces (input, lifecycle, timers, UI)
- Bring up Three.js scene and Ammo.js world
- Implement deterministic frame orchestration

### Phase 2: Core Movement + Combat
- Character controller
- Weapon firing + hit detection
- Ammo penetration-level vs armor-tier calculation
- Add RIP ammo profile behavior (high flesh damage, no penetration, low armor chip)
- Split armor into helmet and vest durability systems
- Base HUD (health/ammo)
- Basic enemy patrol/combat

### Phase 3: World + Loot Loop
- Terrain + building pass
- Loot containers and pickup
- Inventory/stash data model
- Inventory UI bindings (Phaser 4)

### Phase 4: Extraction + Session Outcomes
- Extraction zones + countdown
- Raid timer + fail/success conditions
- Loot commit/loss rules
- Raid summary screen

### Phase 5: Progression Systems
- Equipment slots/loadouts
- Crafting recipes and execution
- Expanded item database and balancing pass

### Phase 6: Backend Persistence
- Firebase auth
- Save/load inventory/equipment/currency
- Conflict-safe writes and basic anti-duplication checks

### Phase 7: Auction House
- Listings lifecycle
- Buy/sell flow
- Real-time updates
- Transaction history and fees

### Phase 8: AI + Polish
- Advanced AI behaviors (cover/flank)
- Audio/VFX
- Optimization and bug fixing
- Onboarding/tutorial flow

## Acceptance Criteria

### Milestone 1: Playable Core
- [ ] Player movement and camera are stable
- [ ] Shooting and penetration-level damage logic function correctly
- [ ] RIP ammo deals increased unarmored health damage and cannot penetrate armor
- [ ] Helmet and vest durability break independently and become unarmored at 0 durability
- [ ] Enemies engage player
- [ ] HUD updates from live state

### Milestone 2: Extraction Loop
- [ ] Deploy -> loot -> extract/death loop works end-to-end
- [ ] Extraction timer logic is reliable
- [ ] Loot persistence/loss rules are enforced

### Milestone 3: Economy + Progression
- [ ] Inventory + equipment + crafting are functional
- [ ] Auction house buy/sell completes correctly
- [ ] Firebase persistence is reliable

### Milestone 4: Phaser 4 Stability
- [ ] No blockers from Phaser 4 API changes in core loop
- [ ] Scene transitions and input remain stable
- [ ] 60 FPS target met in representative combat scenario

## Technical Constraints

- **Performance**: 60 FPS target on mid-range hardware
- **Browser Support**: Latest Chrome/Firefox/Edge
- **Bundle Budget**: Initial load under 50MB (stream heavy assets)
- **Memory Budget**: < 2GB RAM target
- **Networking**: Operate within Firebase free-tier constraints initially

## Dependencies

```json
{
  "phaser": "^4.0.0",
  "three": "^0.160.0",
  "ammo.js": "^0.0.10",
  "firebase": "^10.7.0",
  "typescript": "^5.3.0",
  "vite": "^5.0.0"
}
```

> If Phaser 4 is consumed via pre-release tag in your registry, pin to that tag and lockfile it for deterministic CI.

## Future Considerations

- Multiplayer with authoritative server model
- Electron packaging for desktop
- Voice chat integration
- Server-side anti-cheat validations
- Expanded procedural map generation
- Skill tree + faction reputation
