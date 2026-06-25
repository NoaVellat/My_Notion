"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";
import { getThemeForPath } from "./themes";

export default function AnimatedBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Cible visée (palette + style), lue par la boucle d'animation.
  const initial = getThemeForPath(pathname);
  const targetRef = useRef({
    deep: new THREE.Color(...initial.shader.deep),
    mid: new THREE.Color(...initial.shader.mid),
    glow: new THREE.Color(...initial.shader.glow),
    style: initial.bgStyle,
  });

  // À chaque changement de page : on met à jour la cible (la transition de
  // couleur se fait en douceur dans la boucle ; le style change instantanément).
  useEffect(() => {
    const t = getThemeForPath(pathname);
    targetRef.current = {
      deep: new THREE.Color(...t.shader.deep),
      mid: new THREE.Color(...t.shader.mid),
      glow: new THREE.Color(...t.shader.glow),
      style: t.bgStyle,
    };
  }, [pathname]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const start = targetRef.current;
    const uniforms = {
      u_time: { value: 0 },
      u_resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      u_deep: { value: start.deep.clone() },
      u_mid: { value: start.mid.clone() },
      u_glow: { value: start.glow.clone() },
      u_style: { value: start.style },
    };

    // Un seul shader qui sait dessiner plusieurs styles de fond selon u_style.
    const fragmentShader = `
      precision highp float;
      uniform float u_time;
      uniform float u_style;
      uniform vec2 u_resolution;
      uniform vec3 u_deep;
      uniform vec3 u_mid;
      uniform vec3 u_glow;

      mat2 rot(float a) {
        float c = cos(a), s = sin(a);
        return mat2(c, -s, s, c);
      }
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        float t = u_time * 0.4;
        float pulse = 0.5 + 0.5 * sin(t * 0.8 + length(uv) * 4.0);
        float intensity = 0.0;

        if (u_style < 0.5) {
          // 0 — Volutes (swirl)
          vec2 p = uv;
          for (float i = 1.0; i < 5.0; i++) {
            p = rot(t * 0.3 + i) * p;
            p += 0.4 * sin(p.yx * (i + 1.0) + t) / i;
            intensity += 0.5 / i * abs(sin(p.x * 3.0 + t) + cos(p.y * 3.0 - t));
          }
        } else if (u_style < 1.5) {
          // 1 — Taches fluides (mesh gradient)
          vec2 b1 = vec2(sin(t * 0.6), cos(t * 0.5)) * 0.55;
          vec2 b2 = vec2(cos(t * 0.4), sin(t * 0.7)) * 0.55;
          vec2 b3 = vec2(sin(t * 0.8 + 1.0), cos(t * 0.35 + 2.0)) * 0.55;
          intensity += 0.18 / length(uv - b1);
          intensity += 0.18 / length(uv - b2);
          intensity += 0.18 / length(uv - b3);
          intensity = clamp(intensity * 0.6, 0.0, 1.5);
        } else if (u_style < 2.5) {
          // 2 — Ondes
          for (float i = 1.0; i < 4.0; i++) {
            intensity += 0.45 / i * sin(uv.x * 3.0 * i + t * 1.5 + sin(uv.y * 2.5 + t) * 2.0);
          }
          intensity = 0.5 + 0.5 * intensity;
        } else if (u_style < 3.5) {
          // 3 — Grille technique
          vec2 gv = uv * 5.0 + vec2(t * 0.3, t * 0.15);
          vec2 gr = abs(fract(gv) - 0.5);
          float line = smoothstep(0.47, 0.5, max(gr.x, gr.y));
          intensity = line * 1.1 + 0.15 + 0.2 * pulse;
        } else {
          // 4 — Champ d'étoiles
          vec2 sc = uv * 18.0;
          vec2 id = floor(sc);
          float n = hash(id);
          float tw = 0.5 + 0.5 * sin(t * 3.0 + n * 30.0);
          vec2 f = fract(sc) - 0.5;
          float star = smoothstep(0.4, 0.0, length(f)) * step(0.92, n) * tw;
          intensity = star * 1.6 + 0.08 + 0.15 * length(uv);
        }

        float k = clamp(intensity, 0.0, 1.0);
        vec3 color = mix(u_deep, u_mid, k);
        color = mix(color, u_glow, pow(k, 2.0) * pulse * 0.7);
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({ uniforms, fragmentShader });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId: number;
    const startTime = performance.now();
    function animate() {
      uniforms.u_time.value = (performance.now() - startTime) / 1000;

      const target = targetRef.current;
      const lerpK = 0.03; // vitesse du fondu de couleur entre deux pages
      uniforms.u_deep.value.lerp(target.deep, lerpK);
      uniforms.u_mid.value.lerp(target.mid, lerpK);
      uniforms.u_glow.value.lerp(target.glow, lerpK);
      uniforms.u_style.value = target.style;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    animate();

    function handleResize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-10" />;
}
