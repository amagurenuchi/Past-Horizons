import * as THREE from "three";

export class ThreeRenderer {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> | null = null;
  private enemyCube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> | null = null;
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

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x22c55e }),
    );
    cube.position.y = 1;
    scene.add(cube);

    const enemyCube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xef4444 }),
    );
    enemyCube.position.set(8, 1, 0);
    scene.add(enemyCube);

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
    this.cube = cube;
    this.enemyCube = enemyCube;
    this.menuPlayerBody = menuPlayerBody;
    this.menuHelmet = menuHelmet;
    this.menuVest = menuVest;
    this.menuWeapon = menuWeapon;

    window.addEventListener("resize", this.onResize);
  }

  render(elapsedSeconds: number): void {
    if (!this.renderer || !this.scene || !this.camera || !this.cube) {
      return;
    }

    this.cube.rotation.y = elapsedSeconds * 0.75;
    this.renderer.render(this.scene, this.camera);
  }

  updateTransforms(state: {
    player: { x: number; y: number };
    enemy: { x: number; y: number };
    viewAngles: { yaw: number; pitch: number };
    shotTraces: Array<{ id: string; from: { x: number; y: number; z: number }; to: { x: number; y: number; z: number } }>;
    extractionMarkers: Array<{ id: string; x: number; y: number; active: boolean }>;
    inMainMenu: boolean;
    equippedHelmetId: string | null;
    equippedVestId: string | null;
    equippedPrimaryWeaponName: string;
  }): void {
    if (
      !this.camera ||
      !this.cube ||
      !this.enemyCube ||
      !this.scene ||
      !this.menuPlayerBody ||
      !this.menuHelmet ||
      !this.menuVest ||
      !this.menuWeapon
    ) {
      return;
    }

    const camera = this.camera;

    this.cube.position.set(state.player.x, 1, state.player.y);
    this.enemyCube.position.set(state.enemy.x, 1, state.enemy.y);
    this.syncExtractionMarkers(state.extractionMarkers);
    this.syncShotTraces(state.shotTraces);
    this.cube.visible = !state.inMainMenu;
    this.enemyCube.visible = !state.inMainMenu;
    for (const marker of this.extractionMarkers.values()) {
      marker.visible = !state.inMainMenu;
    }

    this.menuPlayerBody.visible = state.inMainMenu;
    this.menuHelmet.visible = state.inMainMenu;
    this.menuVest.visible = state.inMainMenu;
    this.menuWeapon.visible = state.inMainMenu;

    // Hide the player proxy mesh in first-person to prevent clipping/body visibility.
    this.cube.visible = false;

    this.menuHelmet.material.color.setHex(this.colorFromGear(state.equippedHelmetId));
    this.menuVest.material.color.setHex(this.colorFromGear(state.equippedVestId));
    this.menuWeapon.scale.x = state.equippedPrimaryWeaponName.toLowerCase().includes("smg") ? 0.8 : 1.1;

    if (state.inMainMenu) {
      // Menu camera: frame the equipment mannequin.
      camera.position.set(0, 2.0, 2.8);
      camera.lookAt(0, 1.4, -2);
    } else {
      // First-person camera: head-height camera with mouse-driven yaw/pitch.
      camera.position.set(state.player.x, 1.65, state.player.y);
      const cosPitch = Math.cos(state.viewAngles.pitch);
      const dirX = Math.sin(state.viewAngles.yaw) * cosPitch;
      const dirY = Math.sin(state.viewAngles.pitch);
      const dirZ = -Math.cos(state.viewAngles.yaw) * cosPitch;
      camera.lookAt(state.player.x + dirX, 1.65 + dirY, state.player.y + dirZ);
    }
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
    this.cube = null;
    this.enemyCube = null;
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
    traces: Array<{ id: string; from: { x: number; y: number; z: number }; to: { x: number; y: number; z: number } }>,
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
        const material = new THREE.LineBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.85 });
        line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.shotTraceSegments.set(trace.id, line);
      }

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
}
