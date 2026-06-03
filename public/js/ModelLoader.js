class ModelLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.GLTFLoader = null;
        this.initPromise = this.initLoader();
    }

    async initLoader() {
        const module = await import('/libs/GLTFLoader.js');
        this.GLTFLoader = module.GLTFLoader;
    }

    async loadModel(buildingId) {
        await this.initPromise;

        if (this.cache.has(buildingId)) {
            return this.cache.get(buildingId);
        }

        if (this.loadingPromises.has(buildingId)) {
            return this.loadingPromises.get(buildingId);
        }

        const loadPromise = this.fetchModel(buildingId);
        this.loadingPromises.set(buildingId, loadPromise);

        try {
            const model = await loadPromise;
            this.cache.set(buildingId, model);
            this.loadingPromises.delete(buildingId);
            return model;
        } catch (error) {
            this.loadingPromises.delete(buildingId);
            throw error;
        }
    }

    async fetchModel(buildingId) {
        const loader = new this.GLTFLoader();
        
        return new Promise((resolve, reject) => {
            loader.load(`/models/${buildingId}/${buildingId}.glb`, (gltf) => {resolve(gltf);}, null, reject);
        });
    }
}

window.ModelLoader = ModelLoader;