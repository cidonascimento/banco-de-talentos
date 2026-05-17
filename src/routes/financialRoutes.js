const express = require('express');
const router = express.Router();
const FinancialController = require('../controllers/FinancialController');

const controller = new FinancialController();

// POST /api/v1/finance/calculate
router.post('/calculate', (req, res) => controller.calculate(req, res));

module.exports = router;
