class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this.animationId = null;
        
        // Этажи
        this.floors = new Map();
        this.currentFloor = null;
        this.floorMaterials = new Map();
        this.transparentMode = true;
        
        // Путь
        this.pathLine = null;
        this.pathGlowLine = null;
        this.pathMarkers = [];
        
        this.init();
    }

    async init() {
        const THREE = window.THREE;
        const OrbitControls = window.OrbitControls;
        
        this.THREE = THREE;
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111122);
        
        this.camera = new THREE.PerspectiveCamera(
            45, 
            this.canvas.clientWidth / this.canvas.clientHeight, 
            0.1, 
            1000);
        this.camera.position.set(15, 15, 25);
        this.camera.lookAt(0, 0, 0);
        
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias: true, alpha: false});
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        this.controls.enableRotate = true;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: null
        };
        
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            this.controls.rotateSpeed = 0.3;
            this.controls.zoomSpeed = 1.0;
            this.controls.panSpeed = 1.5;
        } else {
            this.controls.rotateSpeed = 0.2;
            this.controls.zoomSpeed = 1.0;
            this.controls.panSpeed = 0.5;
        }
        
        // плавность камеры
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 200;
        
        this.setupLights();
    }

    setupLights() {
        const THREE = this.THREE;
        
        // окружающий свет
        const ambientLight = new THREE.AmbientLight(0x404060);
        this.scene.add(ambientLight);
        
        // направленный свет
        const dirLight = new THREE.DirectionalLight(0xfff5e6, 0.7);
        dirLight.position.set(4, 7, 3);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        this.scene.add(dirLight);
    }

    setModel(glb) {
        if (this.model) {
            this.scene.remove(this.model);
            this.floors.clear();
            this.floorMaterials.clear();
        }
        
        this.model = glb.scene;

        this.model.traverse((object) => {
            if (object.isMesh && object.name?.match(/^D\d+_\d+$/)) {
                if (Array.isArray(object.material)) {
                    object.material = object.material.map(m => m.clone());
                } else if (object.material) {
                    object.material = object.material.clone();
                }
            }
        });
        
        this.scene.add(this.model);
        
        this.analyzeFloors();
        
        if (this.floors.has('1') || this.floors.has(1)) 
            this.showFloor(1);
        else 
            this.showAllFloors();
    }

    analyzeFloors() {
        this.floors.clear();
        this.floorMaterials.clear();
                
        let buildingCollection = null;
        
        this.model.traverse((object) => {
            if (object.name.toLowerCase() === 'building' && object.children.length > 0) {
                buildingCollection = object;
            }
        });
        
        if (buildingCollection) 
            this.findFloorsInCollection(buildingCollection);
        
        const sortedFloors = this.getFloorList();
    }

    findFloorsInCollection(collection) {
        const floorRegex = /^floor(-?\d+)$/i;
        
        collection.children.forEach(child => {
            if (child.children && child.children.length > 0) {
                const match = child.name.match(floorRegex);
                
                if (match) {
                    const floorNumber = match[1];
                    const meshes = [];
                    
                    child.traverse((mesh) => {
                        if (mesh.isMesh) {
                            if (Array.isArray(mesh.material))
                                mesh.material = mesh.material.map(m => m.clone());
                            else if (mesh.material)
                                mesh.material = mesh.material.clone();
                            
                            meshes.push(mesh);
                        }
                    });
                    
                    if (meshes.length > 0)
                        this.floors.set(floorNumber, meshes);
                }
            }
        });
    }

    getFloorList() {
        return Array.from(this.floors.keys())
            .map(num => parseInt(num))
            .sort((a, b) => a - b);
    }

    showAllFloors() {
        this.floors.forEach((objects) => {
            objects.forEach(object => {
                object.visible = true;
                this.setObjectOpacity(object, 1.0);
            });
        });

        if (window.navGraph) {
            window.navGraph.getAllPoints().forEach(point => {
                if (point.modelObject && point instanceof DoorPoint) {
                    point.modelObject.visible = true;
                    this.setObjectOpacity(point.modelObject, 1.0);
                }
            });
        }

        this.currentFloor = null;        
    }

    setTransparentMode(enabled) {
        this.transparentMode = enabled;
        
        if (this.currentFloor) {
            this.showFloor(parseInt(this.currentFloor));
        }
    }

    getTransparentMode() {
        return this.transparentMode;
    }

    showFloor(floorNumber) {
        const targetFloor = floorNumber.toString();

        this.floors.forEach((objects, floorKey) => {
            objects.forEach(object => {

                if (floorKey === targetFloor) {
                    object.visible = true;
                    this.setObjectOpacity(object, 1.0);
                } else {
                    if (this.transparentMode) {
                        object.visible = true;
                        this.setObjectOpacity(object, 0.1);
                    } else {
                        object.visible = false;
                    }
                }
            });
        });

        if (window.navGraph) {
            const areasOnFloor = window.navGraph.getAreasForFloor(floorNumber);
            
            window.navGraph.getAllPoints().forEach(point => {
                if (!point.modelObject || !(point instanceof DoorPoint)) return;
                
                const areaIndex = point.parentArea?.index;
                const isOnCurrentFloor = areasOnFloor.includes(areaIndex);
                
                if (isOnCurrentFloor) {
                    point.modelObject.visible = true;
                    this.setObjectOpacity(point.modelObject, 1.0);
                } else {
                    if (this.transparentMode) {
                        point.modelObject.visible = true;
                        this.setObjectOpacity(point.modelObject, 0.1);
                    } else {
                        point.modelObject.visible = false;
                    }
                }
            });
        }

        this.currentFloor = targetFloor;
    }

    setObjectOpacity(object, opacity) {
        if (Array.isArray(object.material)) {
            object.material.forEach((material, index) => {
                if (material) {
                    material.transparent = opacity < 1.0;
                    material.opacity = opacity;
                    material.needsUpdate = true;
                }
            });
        } else if (object.material) {
            object.material.transparent = opacity < 1.0;
            object.material.opacity = opacity;
            object.material.needsUpdate = true;
        }
    }

    resetView() {
        this.camera.position.set(15, 15, 25);
        this.camera.lookAt(0, 0, 0);
        
        this.controls.target.set(0, 0, 0);
        this.controls.update();        
    }

    render() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    dispose() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.renderer) this.renderer.dispose();
    }

    focusOnPoint(point, distance = 40, verticalOffset = 5) {
        const targetPos = point.position.clone();
        const direction = this.camera.position.clone().sub(this.controls.target).normalize();
        const idealDir = new THREE.Vector3(1, 0.5, 1).normalize();
        const finalDir = direction.length() > 0.1 ? direction : idealDir;
        
        const newCameraPos = targetPos.clone().add(finalDir.multiplyScalar(distance));
        newCameraPos.y += verticalOffset;
        
        this.camera.position.copy(newCameraPos);
        this.controls.target.copy(targetPos);
        this.controls.update();
    }

    visualizePath(path) {
        if (!path || path.length < 2 || !window.navGraph || !this.model) return;
        
        this.clearPath();
        
        const THREE = this.THREE;
        const points = [];
        const markers = [];
        
        for (let i = 0; i < path.length; i++) {
            const pointId = path[i];
            const point = window.navGraph.getPoint(pointId);
            
            if (point && point.modelObject) {
                const worldPos = point.modelObject.getWorldPosition(new THREE.Vector3());
                points.push(worldPos.clone());
                                
                if (i === 0 || i === path.length - 1) {
                    const sphereMat = new THREE.MeshStandardMaterial({
                        color: i === 0 ? 0x44aaff : 0xffaa44,
                        emissive: i === 0 ? 0x2266aa : 0xaa6622,
                        emissiveIntensity: 0.75
                    });
                    const sphereGeo = new THREE.SphereGeometry(0.1, 16, 16);
                    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
                    sphere.position.copy(worldPos);
                    this.scene.add(sphere);
                    markers.push(sphere);
                }
            }
        }
        
        if (points.length < 2) return;
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x4a90e2 });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        
        const glowMaterial = new THREE.LineBasicMaterial({ 
            color: 0x88aaff,
            transparent: true,
            opacity: 1
        });
        const glowLine = new THREE.LineSegments(lineGeometry, glowMaterial);
        
        this.scene.add(glowLine);
        this.scene.add(line);
        
        this.pathLine = line;
        this.pathGlowLine = glowLine;
        this.pathMarkers = markers;
    }

    clearPath() {
        if (this.pathLine) {
            this.scene.remove(this.pathLine);
            this.pathLine = null;
        }
        
        if (this.pathGlowLine) {
            this.scene.remove(this.pathGlowLine);
            this.pathGlowLine = null;
        }
        
        if (this.pathMarkers) {
            this.pathMarkers.forEach(marker => {this.scene.remove(marker);});
            this.pathMarkers = [];
        }
    }
}

window.SceneManager = SceneManager;