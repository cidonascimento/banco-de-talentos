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
     * Supports both unified equivalent calculations (baseRegime, baseValue)
     * and single calculations (model, gross) for backward compatibility.
     * Enforces RBAC filters on employer costs.
     */
    async calculate(req, res) {
        try {
            const { 
                model, gross, benefits, expenses, proLabore,
                baseRegime, baseValue, bonusAnual, pjBonusAnual, pjStrategy 
            } = req.body;
            
            const userRole = req.user?.role || 'CANDIDATO'; // Default to restrictive role

            if (baseRegime && baseValue !== undefined) {
                // Unified dual calculation mode (with equivalence matching)
                const result = this.engine.calculateEquivalent(
                    baseValue, 
                    baseRegime, 
                    benefits, 
                    expenses, 
                    pjStrategy, 
                    bonusAnual, 
                    pjBonusAnual
                );

                // --- RBAC FILTERING FOR CANDIDATES (RN02) ---
                if (userRole === 'CANDIDATO') {
                    if (result.clt) {
                        delete result.clt.employerCost;
                        if (result.clt.breakdown) {
                            delete result.clt.breakdown.employer;
                        }
                    }
                    if (result.pj) {
                        delete result.pj.employerCost;
                        if (result.pj.breakdown) {
                            delete result.pj.breakdown.employer;
                        }
                    }
                }

                return res.status(200).json(result);
            } else if (model && gross !== undefined) {
                // Backward-compatible single calculation mode
                let result;
                if (model === 'CLT') {
                    result = this.engine.calculateCLT(gross, benefits);
                } else if (model === 'PJ') {
                    result = this.engine.calculatePJ(gross, proLabore, expenses);
                } else {
                    return res.status(400).json({ error: 'Modelo inválido. Use CLT ou PJ.' });
                }

                // --- RBAC FILTERING (RN02) ---
                if (userRole === 'CANDIDATO') {
                    delete result.employerCost;
                    if (result.notes) result.notes = '[Oculto para Candidato]';
                    if (result.breakdown) {
                        delete result.breakdown.employer;
                    }
                }

                return res.status(200).json(result);
            } else {
                return res.status(400).json({ 
                    error: 'Parâmetros insuficientes. Envie baseRegime/baseValue ou model/gross.' 
                });
            }
        } catch (error) {
            console.error('Calculation Error:', error);
            return res.status(500).json({ error: 'Erro interno no motor de cálculo.' });
        }
    }
}

module.exports = FinancialController;
