import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DodecahedronGeometry,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  OctahedronGeometry,
  Points,
  ShaderMaterial,
  TetrahedronGeometry,
  Vector3,
} from "three";

// decor filling the space around the platforms, so that the camera moves can
// be seen: twinkling dust, and wireframe polyhedra drifting further away

const dustCount = 1800;
const dustRadius = 140;
const dustMinY = -130;
const dustMaxY = 180;

const shapeCount = 36;
const shapeMinRadius = 60;
const shapeMaxRadius = 130;

/** random number in [min, max[ */
const random = (min, max) => min + Math.random() * (max - min);

/** random point in a vertical cylinder centered on the y axis */
const randomInCylinder = (minRadius, maxRadius, minY, maxY) => {
  const angle = random(0, 2 * Math.PI);
  // sqrt keeps the density even across the disk
  const radius = Math.sqrt(random(minRadius ** 2, maxRadius ** 2));
  return new Vector3(
    radius * Math.cos(angle),
    random(minY, maxY),
    radius * Math.sin(angle)
  );
};

const dustVertexShader = /* glsl */ `
  uniform float time;
  uniform float pixelRatio;
  attribute float size;
  attribute float phase;
  attribute vec3 color;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float distance = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = pixelRatio * size * 1200.0 / max(distance, 1.0);

    float twinkle = 0.65 + 0.35 * sin(time * 0.0015 + phase);
    // hidden right in front of the camera, fading in the distance
    float near = smoothstep(3.0, 12.0, distance);
    float far = 1.0 - smoothstep(120.0, 220.0, distance);
    vAlpha = twinkle * near * far;
    vColor = color;
  }
`;

const dustFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // bright core in a soft halo
    float d = length(gl_PointCoord - 0.5);
    float core = 1.0 - smoothstep(0.0, 0.12, d);
    float halo = pow(1.0 - smoothstep(0.0, 0.5, d), 2.0);
    float alpha = vAlpha * (core + 0.6 * halo);
    gl_FragColor = vec4(mix(vColor, vec3(1.0), core), alpha);
  }
`;

const createDust = () => {
  const positions = new Float32Array(dustCount * 3);
  const colors = new Float32Array(dustCount * 3);
  const sizes = new Float32Array(dustCount);
  const phases = new Float32Array(dustCount);

  const white = new Color("white");
  const blue = new Color("rgb(90, 130, 255)");
  const gold = new Color("rgb(255, 210, 140)");
  const color = new Color();

  for (let i = 0; i < dustCount; i++) {
    randomInCylinder(0, dustRadius, dustMinY, dustMaxY).toArray(
      positions,
      i * 3
    );
    // mostly blue, some white and a few warm sparks
    const hue = Math.random();
    color.copy(white).lerp(hue < 0.85 ? blue : gold, random(0.3, 1));
    color.toArray(colors, i * 3);
    sizes[i] = random(0.4, 1.6);
    phases[i] = random(0, 2 * Math.PI);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  geometry.setAttribute("size", new BufferAttribute(sizes, 1));
  geometry.setAttribute("phase", new BufferAttribute(phases, 1));

  const material = new ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: dustVertexShader,
    fragmentShader: dustFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  return new Points(geometry, material);
};

const shapeGeometries = [
  (radius) => new IcosahedronGeometry(radius),
  (radius) => new OctahedronGeometry(radius),
  (radius) => new TetrahedronGeometry(radius),
  (radius) => new DodecahedronGeometry(radius),
];

const shapeColors = ["rgb(130, 170, 255)", "rgb(190, 140, 255)", "white"];

/**
 * @param {Vector3[]} cameraPositions the shapes keep away from these points
 */
const createShapes = (cameraPositions) => {
  const shapes = [];
  while (shapes.length < shapeCount) {
    const position = randomInCylinder(
      shapeMinRadius,
      shapeMaxRadius,
      dustMinY,
      dustMaxY
    );
    if (cameraPositions.some((p) => p.distanceTo(position) < 20)) continue;

    const radius = random(3, 10);
    const geometry =
      shapeGeometries[shapes.length % shapeGeometries.length](radius);
    const shape = new LineSegments(
      new EdgesGeometry(geometry),
      new LineBasicMaterial({
        color: shapeColors[shapes.length % shapeColors.length],
        transparent: true,
        opacity: random(0.3, 0.6),
      })
    );
    geometry.dispose();
    shape.position.copy(position);
    shape.rotation.set(random(0, Math.PI), random(0, Math.PI), 0);
    shape.userData = {
      spin: new Vector3(random(-1, 1), random(-1, 1), random(-1, 1))
        .normalize()
        .multiplyScalar(random(0.00005, 0.0002)),
      baseY: position.y,
      phase: random(0, 2 * Math.PI),
    };
    shapes.push(shape);
  }
  return shapes;
};

/**
 * @param {Vector3[]} cameraPositions points the decor must not hide
 * @returns {{object3D: Group, tick: (dt: number) => void}}
 */
export const createSpaceDecor = (cameraPositions) => {
  const object3D = new Group();
  const dust = createDust();
  const shapes = createShapes(cameraPositions);
  object3D.add(dust, ...shapes);

  let time = 0;
  const tick = (dt) => {
    time += dt;
    dust.material.uniforms.time.value = time;
    // the whole dust cloud turns very slowly around the scene
    dust.rotation.y += 0.000004 * dt;

    shapes.forEach((shape) => {
      const { spin, baseY, phase } = shape.userData;
      shape.rotation.x += spin.x * dt;
      shape.rotation.y += spin.y * dt;
      shape.rotation.z += spin.z * dt;
      shape.position.y = baseY + 1.5 * Math.sin(time * 0.0004 + phase);
    });
  };

  return { object3D, tick };
};
