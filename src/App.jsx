import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function App() {
  const mountRef = useRef(null);
  const selectedRef = useRef(null);

  useEffect(() => {
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#222");

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 10);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);

    // Ground Plane
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Objects
    const objects = [];
    const geometries = [
      new THREE.BoxGeometry(),
      new THREE.SphereGeometry(0.75, 32, 32),
      new THREE.ConeGeometry(0.5, 1, 32),
      new THREE.TorusGeometry(0.5, 0.2, 16, 100),
      new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
    ];

    geometries.forEach((geo, i) => {
      const material = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // Red
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set((i - 2) * 2.5, 0.5, 0);
      scene.add(mesh);
      objects.push(mesh);
    });

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event) {
      // Get mouse coordinates within canvas
      const rect = renderer.domElement.getBoundingClientRect();

      // Normalized mouse coordinates ([-1, 1] range)
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Set ray from camera to mouse position
      raycaster.setFromCamera(mouse, camera);

      // Check for intersections with objects
      const intersects = raycaster.intersectObjects(objects);

      if (intersects.length > 0) {
        const clicked = intersects[0].object;

        // If a new object is clicked, reset the previous selected object to red
        if (selectedRef.current && selectedRef.current !== clicked) {
          selectedRef.current.material.color.set(0xff0000); // Red
        }

        // Highlight clicked object in yellow
        clicked.material.color.set(0xffff00); // Yellow
        selectedRef.current = clicked; // Store selected object
      } else {
        // If no object is clicked, reset previous selection
        if (selectedRef.current) {
          selectedRef.current.material.color.set(0xff0000); // Red
          selectedRef.current = null;
        }
      }
    }

    window.addEventListener("click", onMouseClick);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      window.removeEventListener("click", onMouseClick);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
}

export default App;
