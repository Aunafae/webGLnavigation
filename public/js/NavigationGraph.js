class Point {
    constructor(id, modelObject, parentArea) {
        this.id = id;
        this.modelObject = modelObject;
        this.parentArea = parentArea;
        this.connections = [];
        this.position = modelObject ? modelObject.position.clone() : null;
        this.isStreet = false;
        this.isElevator = false;
        this.isHidden = false;
    }

    addConnection(targetPoint) {
        if (!this.connections.includes(targetPoint))
            this.connections.push(targetPoint);
    }

    getAllConnections() {
        return this.connections;
    }

    getEuclideanDistance(targetPoint) {
        const dx = this.position.x - targetPoint.position.x;
        const dy = this.position.y - targetPoint.position.y;
        const dz = this.position.z - targetPoint.position.z;
        
        return Math.sqrt(dx*dx + dy*dy + dz*dz);
    }
}

class PrimaryPoint extends Point {
    constructor(id, modelObject, parentArea) {
        super(id, modelObject, parentArea);
        this.type = 'primary';
    }
}

class SecondaryPoint extends Point {
    constructor(id, modelObject, parentArea) {
        super(id, modelObject, parentArea);
        this.type = 'secondary';
    }
}

class DoorPoint extends Point {
    constructor(id, modelObject, parentArea) {
        super(id, modelObject, parentArea);
        this.type = 'door';
        this.number = '';
        this.descriptionRu = '';
        this.descriptionEn = '';
        this.floor = null;
    }

    setInfo(number = '', descriptionRu = '', descriptionEn = '', floorMapping = null) {
        this.number = number;
        this.descriptionRu = descriptionRu;
        this.descriptionEn = descriptionEn;
        
        // определение этажа из родительской Area
        for (const [floor, areas] of Object.entries(floorMapping)) {
            if (areas.includes(this.parentArea.index)) {
                this.floor = parseInt(floor);
                break;
            }
        }
    }

    getDescription(lang) {
        const description = lang === 'en' ? this.descriptionEn : this.descriptionRu;
        return description;
    }

    getInfo(lang) {
        return {
            id: this.id,
            number: this.number,
            description: this.getDescription(lang),
            floor: this.floor,
            position: this.position,
            area: this.parentArea.index
        };
    }
}

class Area {
    constructor(index) {
        this.index = index;
    }

    extractPoints(areaObject) {
        const points = [];

        areaObject.children.forEach(collection => {
            const PointClass = this.getPointClass(collection.name);

            collection.children.forEach(pointObject => {
                const point = this.createPoint(pointObject, PointClass);
                if (point) points.push(point);
            });
        });

        return points;
    }

    getPointClass(collectionName) {
        if (collectionName === `Primary${this.index}`) return PrimaryPoint;
        if (collectionName === `Secondary${this.index}`) return SecondaryPoint;
        if (collectionName === `Doors${this.index}`) return DoorPoint;
        return null;
    }

    createPoint(pointObject, PointClass) {
        const pointId = pointObject.name;

        if (!/^[PSD]\d+_\d+$/.test(pointId)) return null;

        const areaMatch = pointId.match(/[PSD](\d+)_/);

        return new PointClass(pointId, pointObject, this);
    }
}

class NavigationGraph {
    constructor() {
        this.allPoints = new Map(); // ID точки - ссылка на объект
        this.floorMapping = {}; // номер этажа - массив индексов Area
        this.hasStreetPoints = undefined;
        this.hasElevatorPoints = undefined;
    }

    navigateAStar(startDoorID, endDoorID, options = {}) {
        const { allowStreet = true, allowElevator = true } = options;

        const startDoor = this.getPoint(startDoorID);
        const endDoor = this.getPoint(endDoorID);
        
        const openSet = new Set();
        const closedSet = new Set();

        const gScore = new Map();
        const fScore = new Map();

        const path = new Map();

        gScore.set(startDoorID, 0);
        fScore.set(startDoorID, startDoor.getEuclideanDistance(endDoor));
        openSet.add(startDoor);

        while (openSet.size > 0) {
            let current = null;
            let lowestScore = Infinity;

            for (const point of openSet) {
                const fs = fScore.get(point.id);

                if (fs !== undefined && fs < lowestScore) {
                    lowestScore = fs;
                    current = point;
                }
            }

            if (current.id === endDoorID) 
                return this.reconstructPath(path, current);

            openSet.delete(current);
            closedSet.add(current);

            const connections = current.getAllConnections();
            
            for (const connection of connections) {
                if (!allowStreet && connection.isStreet) 
                    continue;
                if (!allowElevator && connection.isElevator) 
                    continue;
                if (closedSet.has(connection)) 
                    continue;
            
                const distance = current.getEuclideanDistance(connection);
                const estimatedScore = (gScore.get(current.id) !== undefined ? gScore.get(current.id) : 0) + distance;
                
                if (!openSet.has(connection)) 
                    openSet.add(connection);
                else if (gScore.get(connection.id) !== undefined && estimatedScore >= gScore.get(connection.id))
                    continue;

                path.set(connection.id, current);
                gScore.set(connection.id, estimatedScore);
                fScore.set(connection.id, estimatedScore + connection.getEuclideanDistance(endDoor));
            }
        }
        return null;
    }

    reconstructPath(path, current) {
        const totalPath = [current.id];

        while (path.has(current.id)) {
            current = path.get(current.id);
            totalPath.unshift(current.id);
        }

        if (this.getPoint(totalPath[0])?.isHidden)
            totalPath.shift();
        if (this.getPoint(totalPath[totalPath.length - 1])?.isHidden)
            totalPath.pop();

        return totalPath;
    }

    getPoint(id) {
        return this.allPoints.get(id);
    }

    getAllPoints() {
        return Array.from(this.allPoints.values());
    }

    getAllDoors() {
        return Array.from(this.allPoints.values()).filter(p => p instanceof DoorPoint);
    }

    getAreasForFloor(floorNumber) {
        return this.floorMapping[floorNumber.toString()] || [];
    }

    isAreaOnFloor(areaIndex, floorNumber) {
        return this.getAreasForFloor(floorNumber).includes(areaIndex);
    }
}

window.NavigationGraph = NavigationGraph;
window.Point = Point;
window.PrimaryPoint = PrimaryPoint;
window.SecondaryPoint = SecondaryPoint;
window.DoorPoint = DoorPoint;
window.Area = Area;