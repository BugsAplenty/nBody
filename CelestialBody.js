import * as THREE from 'three';

export default class CelestialBody {
    static G = 6.67430e-11; // Gravitational constant

    constructor(name, size, color, mass, initialVelocity, orbitRadius = 0) {
        this.name = name;
        this.size = size;
        this.color = color;
        this.mass = mass;
        this.velocity = initialVelocity; // THREE.Vector3
        this.orbitRadius = orbitRadius;
        this.angle = 0; // Starting angle for orbit, if applicable
        this.mesh = null;
        this.createMesh();

    }

    createMesh() {
        const geometry = new THREE.SphereGeometry(this.size, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(geometry, material);
        return this.mesh;
    }

    addToScene(scene) {
        scene.add(this.mesh);
    }

    updatePosition(bodies, deltaTime) {
        // Calculate gravitational force from other bodies
        let force = new THREE.Vector3();
        bodies.forEach(otherBody => {
            if (otherBody !== this) {
                let distance = this.mesh.position.distanceTo(otherBody.mesh.position);
                let strength = (CelestialBody.G * this.mass * otherBody.mass) / (distance * distance);
                let direction = otherBody.mesh.position.clone().sub(this.mesh.position).normalize();
                force.add(direction.multiplyScalar(strength));
            }
        });

        // Update velocity based on force
        let acceleration = force.divideScalar(this.mass);
        this.velocity.add(acceleration.multiplyScalar(deltaTime));

        // Update position based on velocity
        this.mesh.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    }
}
