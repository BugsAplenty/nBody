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
        this.createTail();
    }

    createMesh() {
        const geometry = new THREE.SphereGeometry(this.size, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(geometry, material);
        return this.mesh;
    }

    addToScene(scene) {
        scene.add(this.mesh);
        scene.add(this.tail); // Add the tail to the scene
    }

    createTail() {
        const tailLength = 1000; // Number of particles in the tail
        const positions = new Float32Array(tailLength * 3); // each particle is a vertex (x, y, z)

        for (let i = 0; i < tailLength; i++) {
            positions[i * 3] = this.mesh.position.x;
            positions[i * 3 + 1] = this.mesh.position.y;
            positions[i * 3 + 2] = this.mesh.position.z;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: this.color, // Tail color
            size: 0.05,       // Particle size
            transparent: true
        });

        this.tail = new THREE.Points(geometry, material);
    }

    updateTail() {
        if (!this.tail) return;
    
        const positions = this.tail.geometry.attributes.position.array;
    
        // Shift positions for the tail particles
        for (let i = positions.length - 3; i >= 3; i -= 3) {
            positions[i] = positions[i - 3];
            positions[i + 1] = positions[i - 2];
            positions[i + 2] = positions[i - 1];
        }
    
        // Set the first particle to the position of the body
        positions[0] = this.mesh.position.x;
        positions[1] = this.mesh.position.y;
        positions[2] = this.mesh.position.z;
    
        this.tail.geometry.attributes.position.needsUpdate = true;
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
        this.updateTail();
    }
}
