/**
 * FinancialEngine - Nucleus of calculations for Banco de Talentos
 * Implements 2026 Brazilian tax rules (CLT/PJ) with full breakdown,
 * progressive bands, Simples Nacional (Anexo III/V) progressive tables, and equivalence logic.
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
    calculateCLT(grossSalary, benefits = {}, bonusAnual = 0) {
        const totalBenefits = Object.values(benefits).reduce((a, b) => a + b, 0);

        // 1. Employee Deductions
        const inss = Math.min(grossSalary * 0.14, this.config.INSS_MAX_CONTRIBUTION);
        const irrf = this._calculateIRRF2026(grossSalary, inss);

        const net = grossSalary - inss - irrf + totalBenefits;

        // 2. Provisions for Candidate (13th, 1/3 Vacation, annual bonus, and FGTS)
        const p13 = grossSalary * this.config.PROVISION_13TH;
        const provVacation = grossSalary * this.config.PROVISION_VACATION;
        const pv13 = grossSalary * this.config.PROVISION_VACATION_1_3;
        const pfgts = grossSalary * this.config.FGTS;
        const pBonus = (bonusAnual || 0) / 12;
        
        // Total Cash (CLT) = Net Monthly + 13th + 1/3Vac + FGTS + Bonus/12
        const provisionsSum = p13 + pv13 + pBonus + pfgts;
        const totalCash = net + provisionsSum;

        // 3. Detailed Employer Costs
        const inssP = grossSalary * this.config.INSS_PATRONAL;
        const ratT = grossSalary * (this.config.RAT + this.config.TERCEIROS);
        const fgtsFull = grossSalary * (this.config.FGTS + this.config.FGTS_FINE_PROVISION);
        
        // Charges on Provisions
        const provFull = p13 + provVacation + pv13;
        const chargesOnProv = provFull * (this.config.INSS_PATRONAL + this.config.RAT + this.config.TERCEIROS + this.config.FGTS);

        const employerCost = grossSalary + totalBenefits + inssP + ratT + fgtsFull + provFull + chargesOnProv + pBonus;

        return {
            model: 'CLT',
            gross: grossSalary,
            netMonthly: net,
            net: net,
            totalCash,
            employerCost,
            encargosSum: inss + irrf,
            provisionsSum,
            inss,
            irrf,
            p13,
            pv13,
            pfgts,
            pBonus,
            inssP,
            ratT,
            fgtsFull,
            provFull,
            totalBen: totalBenefits,
            breakdown: {
                employee: { inss, irrf, benefits: totalBenefits, net, fgts: pfgts },
                provisions: { thirtheenth: p13, vacation13: pv13, fgts: pfgts, bonus: pBonus, total: provisionsSum },
                employer: {
                    inssPatronal: inssP,
                    rat: grossSalary * this.config.RAT,
                    terceiros: grossSalary * this.config.TERCEIROS,
                    fgts: pfgts,
                    fgtsFine: grossSalary * this.config.FGTS_FINE_PROVISION,
                    vacationFull: provVacation,
                    thirtheenthFull: p13,
                    vacation13Full: pv13,
                    chargesOnProvisions: chargesOnProv,
                    benefits: totalBenefits
                }
            }
        };
    }

    /**
     * Detailed PJ calculation supporting Simples Nacional progressive bands and overloaded signatures
     */
    calculatePJ(grossRevenue, proLaboreOrExpenses = {}, expensesOrBonus = 0, bonusOrStrategy = 'ANEXO_III') {
        let proLabore = 0;
        let expenses = {};
        let pjBonusAnual = 0;
        let strategy = 'ANEXO_III';

        if (typeof proLaboreOrExpenses === 'number') {
            // Old signature: calculatePJ(grossRevenue, proLabore, expenses = {})
            proLabore = proLaboreOrExpenses;
            expenses = expensesOrBonus || {};
            pjBonusAnual = 0;
            // Determine strategy based on whether proLabore satisfies Fator R threshold
            strategy = (proLabore >= grossRevenue * 0.28 - 0.01) ? 'ANEXO_III' : 'ANEXO_V';
        } else {
            // New signature: calculatePJ(grossRevenue, expenses = {}, pjBonusAnual = 0, strategy = 'ANEXO_III')
            expenses = proLaboreOrExpenses || {};
            pjBonusAnual = expensesOrBonus || 0;
            strategy = bonusOrStrategy || 'ANEXO_III';
            
            if (strategy === 'ANEXO_III') {
                proLabore = Math.max(1621.00, grossRevenue * 0.28);
            } else {
                proLabore = 1621.00;
            }
        }

        const totalExpenses = (expenses.accounting || 0) + 19.70 + 30.00;
        let das = 0;
        
        if (strategy === 'ANEXO_III') {
            const dasRate = this._getDASAliquotaEfetiva(grossRevenue, 'ANEXO_III');
            das = grossRevenue * dasRate;
        } else {
            const dasRate = this._getDASAliquotaEfetiva(grossRevenue, 'ANEXO_V');
            das = grossRevenue * dasRate;
        }
        
        const plInss = Math.min(proLabore * 0.11, this.config.INSS_CEILING * 0.11);
        const plIrrf = this._calculateIRRF2026(proLabore, plInss);
        
        const net = grossRevenue - das - plInss - plIrrf - totalExpenses;
        const pBonus = (pjBonusAnual || 0) / 12;
        const totalCash = net + pBonus;
        const costsSum = das + plInss + plIrrf + totalExpenses;

        return {
            model: 'PJ',
            gross: grossRevenue,
            netMonthly: net,
            net: net,
            totalCash,
            employerCost: grossRevenue,
            das,
            plInss,
            plIrrf,
            totalExp: totalExpenses,
            pBonus,
            proLabore,
            costsSum,
            isFatorR: strategy === 'ANEXO_III',
            breakdown: {
                das,
                plInss,
                plIrrf,
                expenses: totalExpenses,
                proLabore
            }
        };
    }

    /**
     * Finds equivalent in the other regime using highly precise double binary search
     */
    calculateEquivalent(value, sourceModel, benefits = {}, expenses = {}, strategy = 'ANEXO_III', bonusAnual = 0, pjBonusAnual = 0) {
        if (sourceModel === 'CLT') {
            const clt = this.calculateCLT(value, benefits, bonusAnual);
            const targetTotalCash = clt.totalCash;

            // Find PJ Gross where PJ totalCash = clt.totalCash
            let low = 0, high = targetTotalCash * 3, mid;
            for (let i = 0; i < 30; i++) {
                mid = (low + high) / 2;
                if (this.calculatePJ(mid, expenses, pjBonusAnual, strategy).totalCash < targetTotalCash) {
                    low = mid;
                } else {
                    high = mid;
                }
            }
            const pj = this.calculatePJ(mid, expenses, pjBonusAnual, strategy);
            return {
                clt,
                pj,
                baseRegime: 'CLT',
                cltStatus: 'Base',
                pjStatus: 'Equivalente'
            };
        } else {
            const pj = this.calculatePJ(value, expenses, pjBonusAnual, strategy);
            const targetTotalCash = pj.totalCash;

            // Find CLT Gross where CLT totalCash = pj.totalCash
            let low = 0, high = targetTotalCash * 3, mid;
            for (let i = 0; i < 30; i++) {
                mid = (low + high) / 2;
                if (this.calculateCLT(mid, benefits, bonusAnual).totalCash < targetTotalCash) {
                    low = mid;
                } else {
                    high = mid;
                }
            }
            const clt = this.calculateCLT(mid, benefits, bonusAnual);
            return {
                clt,
                pj,
                baseRegime: 'PJ',
                cltStatus: 'Equivalente',
                pjStatus: 'Base'
            };
        }
    }

    /**
     * Progressive IRRF Progressive bands calculation
     */
    _calculateIRRF2026(gross, inss, dependents = 0) {
        if (gross <= this.config.IRRF_EXEMPTION_LIMIT) {
            return 0;
        }
        
        if (gross <= this.config.IRRF_TRANSITION_CEILING) {
            return Math.max(0, this.config.IRRF_REDUCER_FIXED - (this.config.IRRF_REDUCER_COEFF * gross));
        }
        
        const baseIR = Math.max(0, gross - inss - (dependents * 189.59));
        let rate = 0;
        let deduction = 0;
        
        if (baseIR <= 2259.20) {
            rate = 0;
            deduction = 0;
        } else if (baseIR <= 2826.65) {
            rate = 0.075;
            deduction = 169.44;
        } else if (baseIR <= 3751.05) {
            rate = 0.15;
            deduction = 381.44;
        } else if (baseIR <= 4664.68) {
            rate = 0.225;
            deduction = 662.77;
        } else {
            rate = 0.275;
            deduction = 908.73;
        }
        
        return Math.max(0, baseIR * rate - deduction);
    }

    /**
     * Progressive Simples Nacional calculations (Anexo III & V)
     */
    _getDASAliquotaEfetiva(gross, strategy) {
        const rbt12 = gross * 12;
        if (rbt12 <= 0) return 0;
        
        let nominalRate = 0;
        let deduction = 0;
        const anexo = strategy === 'ANEXO_V' ? 'V' : 'III';
        
        if (anexo === 'III') {
            if (rbt12 <= 180000.00) {
                nominalRate = 0.06;
                deduction = 0;
            } else if (rbt12 <= 360000.00) {
                nominalRate = 0.1120;
                deduction = 9360.00;
            } else if (rbt12 <= 720000.00) {
                nominalRate = 0.1350;
                deduction = 17640.00;
            } else if (rbt12 <= 1800000.00) {
                nominalRate = 0.1600;
                deduction = 35640.00;
            } else if (rbt12 <= 3600000.00) {
                nominalRate = 0.1470;
                deduction = 85500.00;
            } else {
                nominalRate = 0.3000;
                deduction = 720000.00;
            }
        } else { // Anexo V
            if (rbt12 <= 180000.00) {
                nominalRate = 0.1550;
                deduction = 0;
            } else if (rbt12 <= 360000.00) {
                nominalRate = 0.1800;
                deduction = 4500.00;
            } else if (rbt12 <= 720000.00) {
                nominalRate = 0.1950;
                deduction = 9900.00;
            } else if (rbt12 <= 1800000.00) {
                nominalRate = 0.2200;
                deduction = 27900.00;
            } else if (rbt12 <= 3600000.00) {
                nominalRate = 0.2300;
                deduction = 64800.00;
            } else {
                nominalRate = 0.3050;
                deduction = 540000.00;
            }
        }
        
        const effectiveRate = (rbt12 * nominalRate - deduction) / rbt12;
        return Math.max(0.02, effectiveRate);
    }
}

module.exports = FinancialEngine;
