const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const financialRoutes = require('./routes/financialRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON Parsing
app.use(cors());
app.use(express.json());

// Mock Auth Middleware for testing RBAC (RN02)
// Reads x-user-role header and sets req.user.role
app.use((req, res, next) => {
    const role = req.headers['x-user-role'] || 'CANDIDATO';
    req.user = { role };
    next();
});

// Mounting APIs
app.use('/api/v1/finance', financialRoutes);

// Serving Static Files (Calculator UI)
// Serves static calculator at http://localhost:3000/
app.use(express.static(path.join(__dirname, '../public/calculator')));
// Serves static calculator at http://localhost:3000/calculator
app.use('/calculator', express.static(path.join(__dirname, '../public/calculator')));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Banco de Talentos Backend Server is running!`);
    console.log(`📶 Port: ${PORT}`);
    console.log(`🌐 Calculator Web UI: http://localhost:${PORT}`);
    console.log(`==================================================`);
});

module.exports = app;
