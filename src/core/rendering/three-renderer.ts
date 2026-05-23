import * as THREE from "three";

export class ThreeRenderer {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private playerModelRoot: THREE.Group | null = null;
  private playerHelmetMesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial> | null = null;
  private playerVestMesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> | null = null;
  private enemyModelRoot: THREE.Group | null = null;
  private enemyHelmetMesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial> | null = null;
  private enemyVestMesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> | null = null;
  private enemyHolsterWeaponMesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> | null = null;
  private firstPersonWeaponRoot: THREE.Group | null = null;
  private firstPersonWeaponBodyMesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> | null = null;
  private firstPersonWeaponBarrelMesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> | null = null;
  private menuPlayerBody: THREE.Mesh<THREE.CapsuleGeometry, THREE.MeshStandardMaterial> | null = null;
  private menuHelmet: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial> | null = null;
  private menuVest: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> | null = null;
  private menuWeapon: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> | null = null;
  private extractionMarkers = new Map<string, THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial>>();
  private shotTraceSegments = new Map<string, THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>>();
  private mountNode: HTMLElement | null = null;

  initialize(container: HTMLElement): void {
    this.mountNode = container;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101827);

    const camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 4);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    container.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xb4d4ff, 0x1a1207, 1.0);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(4, 8, 2);
    scene.add(dir);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95, metalness: 0.05 }),
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const playerModel = this.createHumanoid(0x9ca3af, 0x64748b, 0x475569);
    playerModel.root.position.set(0, 0, 0);
    scene.add(playerModel.root);

    const enemyModel = this.createHumanoid(0x7f1d1d, 0xb91c1c, 0x450a0a);
    enemyModel.root.position.set(8, 0, 0);
    scene.add(enemyModel.root);
    enemyModel.holsterWeapon.position.set(0.22, 1.28, -0.16);
    enemyModel.holsterWeapon.rotation.set(0, 0, 0.1);

    const firstPersonWeaponRoot = new THREE.Group();
    const firstPersonWeaponBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.16, 0.46),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65, metalness: 0.2 }),
    );
    const firstPersonWeaponBarrel = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 0.48),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.25 }),
    );
    firstPersonWeaponBody.position.set(0.04, -0.04, -0.38);
    firstPersonWeaponBarrel.position.set(0.04, -0.01, -0.72);
    firstPersonWeaponRoot.add(firstPersonWeaponBody, firstPersonWeaponBarrel);
    camera.add(firstPersonWeaponRoot);

    const menuPlayerBody = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.45, 1.2, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8 }),
    );
    menuPlayerBody.position.set(0, 1.2, -2);
    scene.add(menuPlayerBody);

    const menuHelmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x64748b }),
    );
    menuHelmet.position.set(0, 2.05, -2);
    scene.add(menuHelmet);

    const menuVest = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.9, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x334155 }),
    );
    menuVest.position.set(0, 1.25, -2);
    scene.add(menuVest);

    const menuWeapon = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.16, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b }),
    );
    menuWeapon.position.set(0.75, 1.2, -2);
    menuWeapon.rotation.z = -0.2;
    scene.add(menuWeapon);

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.playerModelRoot = playerModel.root;
    this.playerHelmetMesh = playerModel.helmet;
    this.playerVestMesh = playerModel.vest;
    this.enemyModelRoot = enemyModel.root;
    this.enemyHelmetMesh = enemyModel.helmet;
    this.enemyVestMesh = enemyModel.vest;
    this.enemyHolsterWeaponMesh = enemyModel.holsterWeapon;
    this.firstPersonWeaponRoot = firstPersonWeaponRoot;
    this.firstPersonWeaponBodyMesh = firstPersonWeaponBody;
    this.firstPersonWeaponBarrelMesh = firstPersonWeaponBarrel;
    this.menuPlayerBody = menuPlayerBody;
    this.menuHelmet = menuHelmet;
    this.menuVest = menuVest;
    this.menuWeapon = menuWeapon;

    window.addEventListener("resize", this.onResize);
  }

  render(elapsedSeconds: number): void {
    if (!this.renderer || !this.scene || !this.camera) {
      return;
    }

    if (this.enemyModelRoot) {
      this.enemyModelRoot.position.y = Math.sin(elapsedSeconds * 2.8) * 0.03;
    }
    this.renderer.render(this.scene, this.camera);
  }

  updateTransforms(state: {
    player: { x: number; y: number; jumpOffset: number };
    enemy: { x: number; y: number };
    enemyDeathAnimation: { active: boolean; progress: number };
    viewAngles: { yaw: number; pitch: number };
    shotTraces: Array<{ id: string; from: { x: number; y: number; z: number }; to: { x: number; y: number; z: number }; colorHex: number }>;
    extractionMarkers: Array<{ id: string; x: number; y: number; active: boolean }>;
    inMainMenu: boolean;
    raidEndSceneActive: boolean;
    equippedHelmetId: string | null;
    equippedVestId: string | null;
    equippedPrimaryWeaponName: string;
    adsBlend: number;
    deathAnimationActive: boolean;
    deathAnimationProgress: number;
    deathBlackout: number;
  }): void {
    if (
      !this.camera ||
      !this.playerModelRoot ||
      !this.enemyModelRoot ||
      !this.playerHelmetMesh ||
      !this.playerVestMesh ||
      !this.enemyHelmetMesh ||
      !this.enemyVestMesh ||
      !this.enemyHolsterWeaponMesh ||
      !this.firstPersonWeaponRoot ||
      !this.firstPersonWeaponBodyMesh ||
      !this.firstPersonWeaponBarrelMesh ||
      !this.scene ||
      !this.menuPlayerBody ||
      !this.menuHelmet ||
      !this.menuVest ||
      !this.menuWeapon
    ) {
      return;
    }

    const camera = this.camera;

    this.playerModelRoot.position.set(state.player.x, state.player.jumpOffset, state.player.y);
    this.enemyModelRoot.position.set(state.enemy.x, 0, state.enemy.y);
    if (state.enemyDeathAnimation.active) {
      const fall = Math.min(1, state.enemyDeathAnimation.progress);
      this.enemyModelRoot.rotation.z = -Math.PI * 0.5 * fall;
      this.enemyModelRoot.position.y = -0.08 * fall;
    } else {
      const toPlayerX = state.player.x - state.enemy.x;
      const toPlayerZ = state.player.y - state.enemy.y;
      const yawToPlayer = Math.atan2(toPlayerX, -toPlayerZ);
      this.enemyModelRoot.rotation.y = yawToPlayer;
      this.enemyModelRoot.rotation.z = 0;
      this.enemyModelRoot.position.y = 0;
      const horizontalDistance = Math.max(0.001, Math.hypot(toPlayerX, toPlayerZ));
      const enemyMuzzleHeight = 1.3;
      const playerAimHeight = 1.45 + state.player.jumpOffset;
      const pitchToPlayer = Math.atan2(playerAimHeight - enemyMuzzleHeight, horizontalDistance);
      this.enemyHolsterWeaponMesh.position.set(0.22, 1.28, -0.16);
      this.enemyHolsterWeaponMesh.rotation.set(-pitchToPlayer, 0, 0.1);
    }
    this.syncExtractionMarkers(state.extractionMarkers);
    this.syncShotTraces(state.shotTraces);
    this.playerModelRoot.visible = !state.inMainMenu && state.deathAnimationActive;
    this.enemyModelRoot.visible = !state.inMainMenu && !state.raidEndSceneActive;
    for (const marker of this.extractionMarkers.values()) {
      marker.visible = !state.inMainMenu && !state.raidEndSceneActive;
    }

    this.menuPlayerBody.visible = state.inMainMenu;
    this.menuHelmet.visible = state.inMainMenu;
    this.menuVest.visible = state.inMainMenu;
    this.menuWeapon.visible = state.inMainMenu;

    this.menuHelmet.material.color.setHex(this.colorFromGear(state.equippedHelmetId));
    this.menuVest.material.color.setHex(this.colorFromGear(state.equippedVestId));
    this.menuWeapon.scale.x = state.equippedPrimaryWeaponName.toLowerCase().includes("smg") ? 0.8 : 1.1;
    const isSmg = state.equippedPrimaryWeaponName.toLowerCase().includes("smg");
    const firstPersonScale = isSmg ? 0.86 : 1.08;
    this.firstPersonWeaponBodyMesh.scale.z = firstPersonScale;
    this.firstPersonWeaponBarrelMesh.scale.z = isSmg ? 0.86 : 1.1;
    this.enemyHolsterWeaponMesh.scale.z = firstPersonScale;
    this.playerHelmetMesh.material.color.setHex(this.colorFromGear(state.equippedHelmetId));
    this.playerVestMesh.material.color.setHex(this.colorFromGear(state.equippedVestId));
    this.enemyHelmetMesh.material.color.setHex(this.colorFromGear("helmet-t3"));
    this.enemyVestMesh.material.color.setHex(this.colorFromGear("vest-t3"));

    if (state.inMainMenu) {
      // Menu camera: frame the equipment mannequin.
      camera.position.set(0, 2.0, 2.8);
      camera.lookAt(0, 1.4, -2);
    } else if (state.deathAnimationActive) {
      const fall = Math.min(1, state.deathAnimationProgress);
      this.playerModelRoot.rotation.x = -Math.PI * 0.5 * fall;
      this.playerModelRoot.position.y = Math.max(-0.15, state.player.jumpOffset - fall * 0.15);
      camera.position.set(state.player.x, 1.65 + (1 - fall) * 0.5, state.player.y + 2.8 - fall * 1.4);
      camera.lookAt(state.player.x, 1.4 - fall * 0.35, state.player.y);
    } else {
      this.playerModelRoot.rotation.x = 0;
      // First-person camera: head-height camera with mouse-driven yaw/pitch.
      const cameraHeight = 1.65 + state.player.jumpOffset;
      camera.position.set(state.player.x, cameraHeight, state.player.y);
      const cosPitch = Math.cos(state.viewAngles.pitch);
      const dirX = Math.sin(state.viewAngles.yaw) * cosPitch;
      const dirY = Math.sin(state.viewAngles.pitch);
      const dirZ = -Math.cos(state.viewAngles.yaw) * cosPitch;
      camera.lookAt(state.player.x + dirX, cameraHeight + dirY, state.player.y + dirZ);
    }
    const weaponVisible = !state.inMainMenu && !state.deathAnimationActive && !state.raidEndSceneActive;
    this.firstPersonWeaponRoot.visible = weaponVisible;
    const adsOffset = state.adsBlend;
    this.firstPersonWeaponRoot.position.set(
      0.34 - adsOffset * 0.33,
      -0.29 + adsOffset * 0.11,
      -0.48 - adsOffset * 0.24,
    );
    this.firstPersonWeaponRoot.rotation.set(
      0.03 - adsOffset * 0.025,
      -0.06 + adsOffset * 0.06,
      -0.04 + adsOffset * 0.04,
    );
  }

  dispose(): void {
    window.removeEventListener("resize", this.onResize);
    const scene = this.scene;
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
    for (const line of this.shotTraceSegments.values()) {
      scene?.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    }
    this.shotTraceSegments.clear();
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.playerModelRoot = null;
    this.playerHelmetMesh = null;
    this.playerVestMesh = null;
    this.enemyModelRoot = null;
    this.enemyHelmetMesh = null;
    this.enemyVestMesh = null;
    this.enemyHolsterWeaponMesh = null;
    this.firstPersonWeaponRoot = null;
    this.firstPersonWeaponBodyMesh = null;
    this.firstPersonWeaponBarrelMesh = null;
    this.menuPlayerBody = null;
    this.menuHelmet = null;
    this.menuVest = null;
    this.menuWeapon = null;
    this.extractionMarkers.clear();
    this.mountNode = null;
  }

  private readonly onResize = (): void => {
    if (!this.mountNode || !this.camera || !this.renderer) {
      return;
    }

    const { clientWidth, clientHeight } = this.mountNode;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
  };

  private syncExtractionMarkers(markers: Array<{ id: string; x: number; y: number; active: boolean }>): void {
    if (!this.scene) {
      return;
    }

    for (const marker of markers) {
      let mesh = this.extractionMarkers.get(marker.id);
      if (!mesh) {
        mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(1.5, 1.5, 0.15, 20),
          new THREE.MeshStandardMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.45 }),
        );
        mesh.rotation.x = -Math.PI / 2;
        this.scene.add(mesh);
        this.extractionMarkers.set(marker.id, mesh);
      }

      mesh.position.set(marker.x, 0.08, marker.y);
      mesh.material.color.setHex(marker.active ? 0x22c55e : 0x22d3ee);
      mesh.material.opacity = marker.active ? 0.65 : 0.35;
    }
  }

  private syncShotTraces(
    traces: Array<{ id: string; from: { x: number; y: number; z: number }; to: { x: number; y: number; z: number }; colorHex: number }>,
  ): void {
    if (!this.scene) {
      return;
    }

    const activeIds = new Set(traces.map((trace) => trace.id));
    for (const [id, line] of this.shotTraceSegments.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(line);
        line.geometry.dispose();
        line.material.dispose();
        this.shotTraceSegments.delete(id);
      }
    }

    for (const trace of traces) {
      let line = this.shotTraceSegments.get(trace.id);
      if (!line) {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({ color: trace.colorHex, transparent: true, opacity: 0.85 });
        line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.shotTraceSegments.set(trace.id, line);
      }
      line.material.color.setHex(trace.colorHex);

      line.geometry.setFromPoints([
        new THREE.Vector3(trace.from.x, trace.from.y, trace.from.z),
        new THREE.Vector3(trace.to.x, trace.to.y, trace.to.z),
      ]);
    }
  }

  private colorFromGear(gearId: string | null): number {
    if (!gearId) {
      return 0x475569;
    }

    if (gearId.includes("t6")) return 0xdc2626;
    if (gearId.includes("t5")) return 0xd97706;
    if (gearId.includes("t4")) return 0x7c3aed;
    if (gearId.includes("t3")) return 0x2563eb;
    if (gearId.includes("t2")) return 0x16a34a;
    return 0xf8fafc;
  }

  private createHumanoid(
    bodyColor: number,
    helmetColor: number,
    vestColor: number,
  ): {
    root: THREE.Group;
    helmet: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
    vest: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
    holsterWeapon: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  } {
    const root = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.25, 0.75, 8, 10),
      new THREE.MeshStandardMaterial({ color: bodyColor }),
    );
    body.position.y = 1.1;
    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 14, 14),
      new THREE.MeshStandardMaterial({ color: helmetColor }),
    );
    helmet.position.y = 1.72;
    const vest = new THREE.Mesh(
      new THREE.BoxGeometry(0.54, 0.48, 0.34),
      new THREE.MeshStandardMaterial({ color: vestColor }),
    );
    vest.position.y = 1.15;
    const armL = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.08, 0.46, 5, 8),
      new THREE.MeshStandardMaterial({ color: bodyColor }),
    );
    armL.position.set(-0.31, 1.2, 0);
    armL.rotation.z = 0.18;
    const armR = armL.clone();
    armR.position.x = 0.31;
    armR.rotation.z = -0.18;
    const legL = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.1, 0.52, 5, 8),
      new THREE.MeshStandardMaterial({ color: bodyColor }),
    );
    legL.position.set(-0.14, 0.45, 0);
    const legR = legL.clone();
    legR.position.x = 0.14;
    const holsterWeapon = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.14, 0.46),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7, metalness: 0.15 }),
    );
    root.add(body, helmet, vest, armL, armR, legL, legR, holsterWeapon);
    return { root, helmet, vest, holsterWeapon };
  }
}
