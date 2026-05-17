const FinancialEngine = require('../services/FinancialEngine');

/**
 * FinancialController - Handles API requests for calculations
 * Enforces RBAC filtering as per RN02 and User Requirements
 */
class FinancialController {
    constructor() {
        this.engine = new FinancialEngine();
    }

    /**
     * POST /api/v1/finance/calculate
     * req.body: { model, gross, benefits, expenses, proLabore }
     * req.user: { id, role }
     */
    async calculate(req, res) {
        try {
            const { model, gross, benefits, expenses, proLabore } = req.body;
            const userRole = req.user?.role || 'CANDIDATO'; // Default to restrictive role

            let result;
            if (model === 'CLT') {
                result = this.engine.calculateCLT(gross, benefits);
            } else if (model === 'PJ') {
                result = this.engine.calculatePJ(gross, proLabore, expenses);
            } else {
                return res.status(400).json({ error: 'Modelo inválido. Use CLT ou PJ.' });
            }

            // --- RBAC FILTERING (RN02) ---
            // If user is a Candidate, we MUST remove the employer cost details
            if (userRole === 'CANDIDATO') {
                delete result.employerCost;
                
                // Also mask internal notes if they exist in the result
                if (result.notes) result.notes = '[Oculto para Candidato]';
                
                // Keep detailed breakdown only up to 'netMonthly' (líquido)
                // The current engine already structure breakdown well, but we can be extra careful.
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error('Calculation Error:', error);
            return res.status(500).json({ error: 'Erro interno no motor de cálculo.' });
        }
    }
}

module.exports = FinancialController;
