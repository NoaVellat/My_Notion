"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function AnimatedBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. La scène, la caméra et le moteur de rendu
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 2. Les "uniforms" : les valeurs qu'on envoie au shader
    const uniforms = {
      u_time: { value: 0 },
      u_resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
    };

    // 3. Le fragment shader : le cœur de l'effet (langage GLSL)
   const fragmentShader = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      // Fonction de rotation 2D
      mat2 rot(float a) {
        float c = cos(a), s = sin(a);
        return mat2(c, -s, s, c);
      }

      void main() {
        // Coordonnées centrées, ratio d'écran corrigé
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        float t = u_time * 0.4;

        // On déforme l'espace en boucle pour créer des volutes
        float intensity = 0.0;
        vec2 p = uv;
        for (float i = 1.0; i < 5.0; i++) {
          p = rot(t * 0.3 + i) * p;
          p += 0.4 * sin(p.yx * (i + 1.0) + t) / i;
          intensity += 0.5 / i * abs(sin(p.x * 3.0 + t) + cos(p.y * 3.0 - t));
        }

        // Pulsation lumineuse qui respire
        float pulse = 0.5 + 0.5 * sin(t * 0.8 + length(uv) * 4.0);

        // Mélange de couleurs piloté par l'intensité
        vec3 deep = vec3(0.05, 0.04, 0.18);   // indigo profond
        vec3 mid  = vec3(0.35, 0.12, 0.60);   // violet
        vec3 glow = vec3(0.15, 0.45, 0.95);   // bleu électrique

        vec3 color = mix(deep, mid, intensity);
        color = mix(color, glow, pow(intensity, 2.0) * pulse * 0.7);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // 4. Un simple rectangle qui remplit l'écran, peint par le shader
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      fragmentShader,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 5. La boucle d'animation : on fait avancer le temps
    let frameId: number;
    const clock = new THREE.Clock();
    function animate() {
      uniforms.u_time.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    animate();

    // 6. S'adapter au redimensionnement
    function handleResize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", handleResize);

    // 7. Nettoyage
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