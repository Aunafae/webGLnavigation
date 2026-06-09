class ModelGraphBuilder {
    constructor() {
        this.graph = null;
        this.buildingId = null;
    }

    async build(model, buildingId) {
        this.graph = new NavigationGraph();
        this.buildingId = buildingId;

        await this.loadFloorMapping();
        this.extractWaypoints(model);
        this.hideNonDoors();
        await this.loadConnections();
        await this.loadDoorInfo();
        await this.loadPointsTags();

        return this.graph;
    }

    extractWaypoints(model) {
        const waypointsCollection = this.findWaypointsCollection(model);
        if (!waypointsCollection) return;

        waypointsCollection.children.forEach(areaObject => {
            const area = this.createAreaFromObject(areaObject);
            if (!area) return;

            const points = area.extractPoints(areaObject);
            points.forEach(point => {
                this.graph.allPoints.set(point.id, point);
            });
        });
    }

    findWaypointsCollection(model) {
        let buildingCollection = null;
        model.traverse((object) => {
            if (object.name.toLowerCase() === 'building' && object.children.length > 0) {
                buildingCollection = object;
            }
        });

        if (!buildingCollection) return null;

        let waypointsCollection = null;
        buildingCollection.children.forEach(child => {
            if (child.name === 'WayPoints' && child.children.length > 0) {
                waypointsCollection = child;
            }
        });

        return waypointsCollection;
    }

    createAreaFromObject(areaObject) {
        const areaMatch = areaObject.name.match(/^Area(\d+)$/i);
        if (!areaMatch) return null;
        return new Area(parseInt(areaMatch[1]));
    }

    hideNonDoors() {
        this.graph.allPoints.forEach(point => {
            if (point.modelObject && !(point instanceof DoorPoint)) {
                point.modelObject.visible = false;
            }
        });
    }

    async loadFloorMapping() {
        const response = await fetch(`/models/${this.buildingId}/Floor_areas.txt`);
        if (!response.ok) return;

        const text = await response.text();

        text.split('\n').forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;

            const [floorStr, areasStr] = line.split(':').map(s => s.trim());
            if (!floorStr || !areasStr) return;

            this.graph.floorMapping[floorStr] = areasStr
                .split(',')
                .map(a => parseInt(a.trim()))
                .filter(a => !isNaN(a));
        });
    }

    async loadConnections() {
        const areaIndices = this.collectAreaIndices();

        const loadPromises = Array.from(areaIndices).map(areaIndex =>
            fetch(`/models/${this.buildingId}/Area${areaIndex}.txt`)
                .then(response => response.ok ? response.text() : null)
                .then(text => {
                    if (text) this.parseConnectionsFile(text);
                })
                .catch(() => {})
        );

        await Promise.all(loadPromises);
    }

    collectAreaIndices() {
        const indices = new Set();
        this.graph.allPoints.forEach(point => {
            if (point.parentArea) {
                indices.add(point.parentArea.index);
            }
        });
        return indices;
    }

    parseConnectionsFile(content) {
        content.split('\n').forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;

            const [sourceId, targetsStr] = line.split(':').map(s => s.trim());
            if (!sourceId || !targetsStr) return;

            const sourcePoint = this.graph.allPoints.get(sourceId);
            if (!sourcePoint) {
                console.log(`⚠️ Пропущена связь: исходная точка ${sourceId} не найдена`);
                return;
            }

            targetsStr.split(',').map(id => id.trim()).forEach(targetId => {
                const targetPoint = this.graph.allPoints.get(targetId);
                if (!targetPoint) {
                    console.log(`⚠️ Пропущена связь: целевая точка ${targetId} не найдена`);
                    return;
                }

                sourcePoint.addConnection(targetPoint);
                targetPoint.addConnection(sourcePoint);
            });
        });
    }

    async loadDoorInfo() {
        const response = await fetch(`/models/${this.buildingId}/Doors_metadata.json`);

        const doorsData = await response.json();

        for (const [doorId, info] of Object.entries(doorsData)) {
            const doorPoint = this.graph.allPoints.get(doorId);
            if (doorPoint && doorPoint instanceof DoorPoint) {
                doorPoint.setInfo(
                    info.number || '',
                    info.description_ru || '',
                    info.description_en || '',
                    this.graph.floorMapping
                );
            }
        }
    }

    async loadPointsTags() {
        const response = await fetch(`/models/${this.buildingId}/Points_tags.txt`);

        const text = await response.text();

        text.split('\n').forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;

            const [category, idsStr] = line.split(':').map(s => s.trim());
            if (!idsStr || idsStr === '') {
                if (category.toLowerCase() === 'street')
                    this.graph.hasStreetPoints = false;
                if (category.toLowerCase() === 'elevator')
                    this.graph.hasElevatorPoints = false;
                return;
            }

            const flagMap = {
                'street': 'isStreet',
                'elevator': 'isElevator',
                'hidden': 'isHidden'
            };

            const flagProperty = flagMap[category.toLowerCase()];
            if (!flagProperty) return;

            idsStr.split(',').map(id => id.trim()).forEach(pointId => {
                const point = this.graph.allPoints.get(pointId);
                if (point)
                    point[flagProperty] = true;
            });
        });
    }
}

window.ModelGraphBuilder = ModelGraphBuilder;