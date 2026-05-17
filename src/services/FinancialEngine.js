/**
 * FinancialEngine - Nucleus of calculations for Banco de Talentos
 * Implements 2026 Brazilian tax rules (CLT/PJ) with full breakdown and equivalence logic.
 */
class FinancialEngine {
    constructor(config = {}) {
        this.config = {
            // INSS/IRRF 2026
            INSS_CEILING: 8475.55,
            INSS_MAX_CONTRIBUTION: 988.09,
            IRRF_EXEMPTION_LIMIT: 5000.00,
            IRRF_TRANSITION_CEILING: 7350.00,
            IRRF_REDUCER_FIXED: 978.62,
            IRRF_REDUCER_COEFF: 0.133145,

            // Granular Employer Rates (CLT)
            INSS_PATRONAL: 0.20,
            RAT: 0.02,
            TERCEIROS: 0.058,
            FGTS: 0.08,
            FGTS_FINE_PROVISION: 0.032,
            PROVISION_13TH: 0.0833,
            PROVISION_VACATION: 0.0833,
            PROVISION_VACATION_1_3: 0.0278,

            // PJ
            FATOR_R_THRESHOLD: 0.28,
            SIMPLES_ANEXO_III: 0.06,
            SIMPLES_ANEXO_V: 0.155,
            ...config
        };
    }

    /**
     * Detailed CLT calculation with granular employer costs
     */
    calculateCLT(grossSalary, benefits = {}) {
        const totalBenefits = Object.values(benefits).reduce((a, b) => a + b, 0);

        // 1. Employee Deductions
        let inss = Math.min(grossSalary * 0.14, this.config.INSS_MAX_CONTRIBUTION);
        let irrf = this._calculateIRRF2026(grossSalary, inss);

        const netMonthly = grossSalary - inss - irrf + totalBenefits;

        // 2. Provisions for Candidate (13th, 1/3 Vacation, and FGTS)
        const prov13th = grossSalary * this.config.PROVISION_13TH;
        const provVacation13 = grossSalary * this.config.PROVISION_VACATION_1_3;
        const fgts = grossSalary * this.config.FGTS;
        
        // Total Cash (CLT) = Net Monthly + 13th/12 + 1/3Vac/12 + FGTS
        const candidateProvisions = (prov13th + provVacation13 + fgts);
        const totalCash = netMonthly + candidateProvisions;

        // 3. Detailed Employer Costs
        const inssPatronal = grossSalary * this.config.INSS_PATRONAL;
        const rat = grossSalary * this.config.RAT;
        const terceiros = grossSalary * this.config.TERCEIROS;
        const fgts = grossSalary * this.config.FGTS;
        const fgtsFine = grossSalary * this.config.FGTS_FINE_PROVISION;
        
        // Charges on Provisions (Simplified)
        const chargesOnProv = (prov13th + provVacation + provVacation13) * (this.config.INSS_PATRONAL + this.config.RAT + this.config.TERCEIROS + this.config.FGTS);

        const employerCost = grossSalary + totalBenefits + inssPatronal + rat + terceiros + fgts + (grossSalary * this.config.FGTS_FINE_PROVISION) + prov13th + (grossSalary * this.config.PROVISION_VACATION) + provVacation13 + chargesOnProv;

        return {
            model: 'CLT',
            gross: grossSalary,
            netMonthly,
            totalCash,
            employerCost,
            breakdown: {
                employee: { inss, irrf, benefits: totalBenefits, net: netMonthly, fgts },
                provisions: { thirtheenth: prov13th, vacation13: provVacation13, fgts, total: candidateProvisions },
                employer: {
                    inssPatronal,
                    rat,
                    terceiros,
                    fgts,
                    fgtsFine,
                    vacationFull: provVacation,
                    thirtheenthFull: prov13th,
                    vacation13Full: provVacation13,
                    chargesOnProvisions: chargesOnProv,
                    benefits: totalBenefits
                }
            }
        };
    }

    /**
     * Detailed PJ calculation
     */
    calculatePJ(grossRevenue, proLabore, expenses = {}) {
        const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
        const isFatorR = (proLabore / grossRevenue) >= this.config.FATOR_R_THRESHOLD;
        const taxRate = isFatorR ? this.config.SIMPLES_ANEXO_III : this.config.SIMPLES_ANEXO_V;
        
        const das = grossRevenue * taxRate;
        const plInss = Math.min(proLabore * 0.11, this.config.INSS_MAX_CONTRIBUTION);
        const plIrrf = this._calculateIRRF2026(proLabore, plInss);

        const netMonthly = grossRevenue - das - plInss - plIrrf - totalExpenses;

        return {
            model: 'PJ',
            gross: grossRevenue,
            netMonthly,
            totalCash: netMonthly,
            employerCost: grossRevenue,
            isFatorR,
            breakdown: {
                das,
                plInss,
                plIrrf,
                expenses: totalExpenses
            }
        };
    }

    /**
     * Finds equivalent in the other regime
     */
    calculateEquivalent(value, sourceModel, benefits = {}, expenses = {}) {
        if (sourceModel === 'CLT') {
            const clt = this.calculateCLT(value, benefits);
            const targetNet = clt.totalCash; // User base: Total Cash
            
            // Find PJ Gross where PJ Net = clt.totalCash
            // We'll iterate slightly or use formula for Simples Nacional
            // Net = Gross * (1 - tax) - PLTaxes - Exp
            // Gross = (Net + PLTaxes + Exp) / (1 - tax)
            // But ProLabore usually is 28% of Gross to get Fator R
            const tax = this.config.SIMPLES_ANEXO_III;
            const proLaboreFactor = 0.28;
            
            // Heuristic for PL Taxes (approx 11% of PL)
            // Gross = (Target + (0.28 * Gross * 0.11) + Exp) / (1 - tax)
            // Gross * (1 - tax) = Target + 0.0308 * Gross + Exp
            // Gross * (1 - tax - 0.0308) = Target + Exp
            const pjGross = (targetNet + Object.values(expenses).reduce((a, b) => a + b, 0)) / (1 - tax - (proLaboreFactor * 0.11));
            
            return {
                source: clt,
                equivalent: this.calculatePJ(pjGross, pjGross * 0.28, expenses)
            };
        } else {
            const pj = this.calculatePJ(value, value * 0.28, expenses);
            const targetTotalCash = pj.netMonthly;

            // Find CLT Gross where clt.totalCash = pj.netMonthly
            // This is harder due to IRRF bands. We'll use a simple search or approximation.
            let low = 0, high = value * 2, mid;
            for(let i=0; i<20; i++) {
                mid = (low + high) / 2;
                if (this.calculateCLT(mid, benefits).totalCash < targetTotalCash) low = mid;
                else high = mid;
            }
            return {
                source: pj,
                equivalent: this.calculateCLT(mid, benefits)
            };
        }
    }

    _calculateIRRF2026(gross, inss) {
        if (gross <= this.config.IRRF_EXEMPTION_LIMIT) return 0;
        if (gross <= this.config.IRRF_TRANSITION_CEILING) {
            return Math.max(0, this.config.IRRF_REDUCER_FIXED - (this.config.IRRF_REDUCER_COEFF * gross));
        }
        return (gross - inss) * 0.275 - 893.36; // High band placeholder
    }
}

module.exports = FinancialEngine;
