const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use((req, res, next) => {
    if (req.url.endsWith('.js')) {
        res.type('application/javascript');
    }
    next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/models', express.static(path.join(__dirname, 'models')));

app.get('/api/buildings', (req, res) => {
    const modelsPath = path.join(__dirname, 'models');
    const items = fs.readdirSync(modelsPath, { withFileTypes: true });
    const buildingFolders = items.filter(item => item.isDirectory() && item.name.startsWith('building_'));
    
    const buildings = [];
    
    for (const folder of buildingFolders) {
        const folderName = folder.name;
        const glbPath = path.join(modelsPath, folderName, `${folderName}.glb`);
        const number = folderName.replace(/\D/g, '');

        buildings.push({
            id: folderName,
            number: number,
            name: number ? `Корпус №${number}` : folderName,
            file: `${folderName}/${folderName}.glb`
        });
    }
    
    buildings.sort((a, b) => parseInt(a.number || 0) - parseInt(b.number || 0));
    res.json({ success: true, buildings });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`СЕРВЕР ЗАПУЩЕН Локально: http://localhost:${PORT}`);
});