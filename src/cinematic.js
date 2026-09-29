import * as T from "three";

export class RitualSound {
  constructor() {
    this.enabled = false;
    this.context = null;
  }
  enable(value) {
    this.enabled = value;
    if (!this.context && value) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.connect(this.context.destination);
    }
    if (this.context) {
      this.context.resume();
      this.master.gain.setTargetAtTime(
        value ? 0.65 : 0,
        this.context.currentTime,
        0.12,
      );
    }
  }
  note(frequency, delay = 0, duration = 1, volume = 0.1, type = "sine") {
    if (!this.enabled) return;
    const c = this.context,
      t = c.currentTime + delay,
      o = c.createOscillator(),
      g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(frequency, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(volume, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + duration + 0.1);
  }
  noise(duration, filter, volume) {
    if (!this.enabled) return;
    const c = this.context,
      b = c.createBuffer(1, c.sampleRate * duration, c.sampleRate),
      d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++)
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    const s = c.createBufferSource(),
      f = c.createBiquadFilter(),
      g = c.createGain();
    s.buffer = b;
    f.type = "bandpass";
    f.frequency.value = filter;
    f.Q.value = 0.6;
    g.gain.value = volume;
    s.connect(f);
    f.connect(g);
    g.connect(this.master);
    s.start();
  }
  strike() {
    this.noise(0.24, 2800, 0.42);
    this.note(1400, 0.02, 0.08, 0.035);
    setTimeout(() => this.noise(0.9, 650, 0.1), 110);
  }
  sparkle() {
    this.note(
      [880, 1174.66, 1318.51, 1760][Math.floor(Math.random() * 4)],
      0,
      0.9,
      0.028,
    );
  }
  capture() {
    this.noise(0.6, 440, 0.24);
    [220, 440, 659.25, 880].forEach((n, i) =>
      this.note(n, i * 0.075, 2.6, 0.075),
    );
  }
  bloom() {
    [261.63, 392, 523.25, 659.25, 783.99, 1046.5].forEach((n, i) =>
      this.note(n, i * 0.19, 4, 0.055),
    );
  }
}

export class Cinematic {
  constructor(scene, camera, cream) {
    this.camera = camera;
    this.sound = new RitualSound();
    this.captureAt = -1;
    this.lastSpark = 0;
    this.struck = false;
    this.finalSound = false;
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const cx = c.getContext("2d"),
      g = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "white");
    g.addColorStop(0.12, "#fff4d5");
    g.addColorStop(0.3, "#f3cb8580");
    g.addColorStop(1, "#e8ba6500");
    cx.fillStyle = g;
    cx.fillRect(0, 0, 64, 64);
    this.glow = new T.CanvasTexture(c);
    this.match = new T.Group();
    scene.add(this.match);
    const stick = new T.Mesh(
      new T.CylinderGeometry(0.018, 0.018, 0.65, 16),
      new T.MeshStandardMaterial({ color: "#c9a474", roughness: 0.9 }),
    );
    stick.position.y = -0.325;
    this.match.add(stick);
    const head = new T.Mesh(
      new T.SphereGeometry(0.035, 16, 12),
      new T.MeshStandardMaterial({ color: "#8a3a2e" }),
    );
    this.match.add(head);
    this.match.rotation.z = 0.65;
    this.matchFire = new T.Sprite(
      new T.SpriteMaterial({
        map: this.glow,
        color: "#ffb75a",
        transparent: true,
        depthWrite: false,
        blending: T.AdditiveBlending,
      }),
    );
    this.matchFire.scale.set(0.16, 0.3, 1);
    this.match.add(this.matchFire);
    this.matchLight = new T.PointLight("#ffb45d", 0, 3);
    this.match.add(this.matchLight);
    this.match.visible = false;
    // Delicate concentric cream grooves catch side light in the close-up.
    for (let i = 0; i < 17; i++) {
      const ring = new T.Mesh(new T.TorusGeometry(0.589, 0.003, 5, 96), cream);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(1, 2.07 + i * 0.021, 0.3);
      scene.add(ring);
    }
    const noise = document.createElement("canvas");
    noise.width = noise.height = 128;
    const nc = noise.getContext("2d"),
      pixels = nc.createImageData(128, 128);
    for (let i = 0; i < pixels.data.length; i += 4) {
      let n = 120 + Math.random() * 35;
      pixels.data.set([n, n, n, 255], i);
    }
    nc.putImageData(pixels, 0, 0);
    cream.bumpMap = new T.CanvasTexture(noise);
    cream.bumpScale = 0.008;
    cream.needsUpdate = true;
    this.group = new T.Group();
    camera.add(this.group);
    scene.add(camera);
    this.count = 2600;
    this.positions = new Float32Array(this.count * 3);
    this.seeds = new Float32Array(this.count * 3);
    const colors = [];
    for (let i = 0; i < this.count; i++) {
      this.seeds.set(
        [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random()],
        i * 3,
      );
      colors.push(
        ...new T.Color()
          .setHSL(
            0.1 + Math.random() * 0.07,
            0.25 + Math.random() * 0.3,
            0.65 + Math.random() * 0.25,
          )
          .toArray(),
      );
    }
    this.geometry = new T.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new T.BufferAttribute(this.positions, 3),
    );
    this.geometry.setAttribute(
      "color",
      new T.Float32BufferAttribute(colors, 3),
    );
    this.material = new T.PointsMaterial({
      map: this.glow,
      size: 0.043,
      transparent: true,
      opacity: 0,
      vertexColors: true,
      depthTest: false,
      depthWrite: false,
      blending: T.AdditiveBlending,
    });
    this.points = new T.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 10;
    this.group.add(this.points);
    this.orb = new T.Sprite(
      new T.SpriteMaterial({
        map: this.glow,
        color: "#ffe5b1",
        transparent: true,
        opacity: 0,
        depthTest: false,
        blending: T.AdditiveBlending,
      }),
    );
    this.group.add(this.orb);
    this.ring = new T.Mesh(
      new T.RingGeometry(0.97, 1, 128),
      new T.MeshBasicMaterial({
        color: "#ffe5b3",
        transparent: true,
        opacity: 0,
        side: T.DoubleSide,
        depthTest: false,
        depthWrite: false,
      }),
    );
    this.group.add(this.ring);
    const text = document.createElement("canvas");
    text.width = 1400;
    text.height = 420;
    const tx = text.getContext("2d");
    tx.fillStyle = "white";
    tx.textAlign = "center";
    tx.font = "112px Georgia";
    tx.fillText("Happy Birthday", 700, 170);
    tx.font = "italic 120px Georgia";
    tx.fillText("to me.", 700, 325);
    const data = tx.getImageData(0, 0, 1400, 420).data;
    this.targets = [];
    for (let y = 0; y < 420; y += 5)
      for (let x = 0; x < 1400; x += 5)
        if (data[(y * 1400 + x) * 4 + 3] > 100)
          this.targets.push([(x / 1400 - 0.5) * 2, 0.5 - y / 420]);
    this.focus = new T.Vector3(0, 0, -4);
    this.from = new T.Vector3();
  }
  capture(time, palm) {
    this.captureAt = time;
    this.camera.updateMatrixWorld();
    this.focus.copy(palm).applyMatrix4(this.camera.matrixWorldInverse);
    this.focus.multiplyScalar(4/Math.max(.1,-this.focus.z));
    this.focus.z = -4;
    this.sound.capture();
  }
  update({ time, dt, state, age, gathered, palm, handExpansion = .3 }) {
    const lighting = state === "lighting";
    this.match.visible = lighting && age > 2 && age < 6.1;
    if (lighting) {
      if (age > 2.15 && !this.struck) {
        this.struck = true;
        this.sound.strike();
      }
      const approach = T.MathUtils.smoothstep(age, 2.5, 4.15),
        leave = T.MathUtils.smoothstep(age, 4.8, 6.1);
      this.match.position.lerpVectors(
        new T.Vector3(1.95, 2.85, 1.1),
        new T.Vector3(1.045, 2.995, 0.31),
        approach,
      );
      this.match.position.x += leave * 1.4;
      this.match.position.y -= leave * 0.4;
      this.matchFire.material.opacity = age > 2.15 ? 1 - leave : 0;
      this.matchLight.intensity = (age > 2.15 ? 1 : 0) * (1 - leave) * 1.4;
    }
    const wishing = ["ready", "loading", "hands", "fallback"].includes(state),
      elapsed = this.captureAt < 0 ? -1 : time - this.captureAt,
      final = elapsed > 5.5;
    this.material.opacity = T.MathUtils.damp(
      this.material.opacity,
      wishing || elapsed >= 0 ? 1 : 0,
      1.5,
      dt,
    );
    if (wishing && time - this.lastSpark > (gathered > 0.2 ? 0.42 : 1.2)) {
      this.sound.sparkle();
      this.lastSpark = time;
    }
    if (final && !this.finalSound) {
      this.sound.bloom();
      this.finalSound = true;
    }
    const height = 2 * Math.tan(T.MathUtils.degToRad(this.camera.fov / 2)) * 4,
      width = height * this.camera.aspect;
    const localPalm = palm.clone().applyMatrix4(this.camera.matrixWorldInverse);
    localPalm.multiplyScalar(4/Math.max(.1,-localPalm.z));
    localPalm.z = -4;
    const pull = state === "fallback" ? 0.62 : gathered;
    const formation = T.MathUtils.smoothstep(elapsed, 5.5, 9.5),
      burst = T.MathUtils.smoothstep(elapsed, 0.6, 3.8);
    for (let i = 0; i < this.count; i++) {
      const a = this.seeds[i * 3],
        b = this.seeds[i * 3 + 1],
        s = this.seeds[i * 3 + 2],
        angle = i * 2.399 + time * (0.08 + s * 0.08);
      let x = a * width * 0.62 + Math.sin(time * 0.16 + i) * 0.04,
        y = b * height * 0.65 + Math.sin(time * 0.12 + i) * 0.06,
        z = -4 - s * 2;
      if (wishing && pull > 0) {
        const controlled = state === 'hands';
        const radius = controlled
          ? .04 + Math.sqrt(s) * T.MathUtils.lerp(.16, Math.min(width, height) * .8, handExpansion)
          : .1 + s * .72;
        const p = Math.min(.985, pull * (controlled ? 1.15 : .9));
        x = T.MathUtils.lerp(x, localPalm.x + Math.cos(angle) * radius, p);
        y = T.MathUtils.lerp(y, localPalm.y + Math.sin(angle) * radius, p);
        z = T.MathUtils.lerp(z, -4, p);
      }
      if (elapsed >= 0) {
        const collapse = 1 - T.MathUtils.smoothstep(elapsed, 0, 0.65);
        const radius =
          collapse * (0.2 + s * 0.8) + burst * (0.3 + s * width * 0.8);
        x = this.focus.x + Math.cos(angle) * radius;
        y = this.focus.y + Math.sin(angle) * radius * 0.65;
        z = -4 + s * burst;
        const target = this.targets[i % this.targets.length];
        x = T.MathUtils.lerp(x, target[0] * width * 0.46, formation);
        y = T.MathUtils.lerp(
          y,
          target[1] * width * 0.29 + height * 0.1,
          formation,
        );
        z = T.MathUtils.lerp(z, -4, formation);
      }
      this.positions.set([x, y, z], i * 3);
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.material.size = final ? 0.033 : 0.044;
    this.orb.position.copy(elapsed >= 0 ? this.focus : localPalm);
    this.orb.material.opacity =
      elapsed >= 0 ? Math.max(0, 1 - elapsed / 4) : pull * (state === 'hands' ? T.MathUtils.lerp(.85,.25,handExpansion) : .65);
    const size =
      elapsed >= 0
        ? 0.3 + Math.sin(Math.min(elapsed / 0.7, 1) * Math.PI) * 0.9
        : 0.18 + pull * 0.25;
    this.orb.scale.set(size, size, 1);
    this.ring.position.copy(this.focus);
    const ripple = T.MathUtils.smoothstep(elapsed, 0.65, 2.8);
    this.ring.scale.setScalar(0.08 + ripple * 4);
    this.ring.material.opacity =
      elapsed > 0.65 && elapsed < 2.8 ? (1 - ripple) * 0.42 : 0;
    return {
      gold: T.MathUtils.smoothstep(elapsed, 0.65, 9),
      surge: elapsed >= 0 ? 1 + Math.exp(-Math.pow((elapsed - 0.8) * 2, 2)) : 0,
      final,
    };
  }
}
