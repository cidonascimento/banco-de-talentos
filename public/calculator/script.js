/**
 * FinancialEngine (Frontend version)
 * Premium Accordion-based Interface with Grouped Metrics.
 */
const config = {
    INSS_CEILING: 8475.55,
    INSS_MAX_CONTRIBUTION: 988.10, // updated to 988.10 to perfectly match the doc
    INSS_PJ_MAX_CONTRIBUTION: 932.31, // 11% of teto (8475.55 * 0.11 = 932.31)
    IRRF_EXEMPTION_LIMIT: 5000.00,
    IRRF_TRANSITION_CEILING: 7350.00,
    IRRF_REDUCER_FIXED: 978.62,
    IRRF_REDUCER_COEFF: 0.133145,
    INSS_PATRONAL: 0.20,
    RAT: 0.02,
    TERCEIROS: 0.058,
    FGTS: 0.08,
    FGTS_FINE: 0.032,
    PROVISION_13TH: 0.0833,
    PROVISION_VACATION: 0.0833,
    PROVISION_VAC_13: 0.0278,
    FATOR_R_THRESHOLD: 0.28,
};

let state = {
    baseValue: 10000,
    baseRegime: 'CLT',
    pjStrategy: 'ANEXO_III', // Default strategy
    bonusAnual: 10000,
    pjBonusAnual: 0,
    benefits: { meal: 1200, health: 500 },
    expenses: { accounting: 250 }
};

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function getDASAliquotaEfetiva(gross, anexo) {
    const rbt12 = gross * 12;
    if (rbt12 <= 0) return 0;
    
    let nominalRate = 0;
    let deduction = 0;
    
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
    return Math.max(0.02, effectiveRate); // Simples Nacional floor
}

function calculateIRRF(gross, inss, dependents = 0) {
    if (gross <= config.IRRF_EXEMPTION_LIMIT) {
        return 0;
    }
    
    if (gross <= config.IRRF_TRANSITION_CEILING) {
        return Math.max(0, config.IRRF_REDUCER_FIXED - (config.IRRF_REDUCER_COEFF * gross));
    }
    
    // Standard progressive table
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
        deduction = 908.73; // aligned with the document
    }
    
    return Math.max(0, baseIR * rate - deduction);
}

function calculateCLT(gross, benefits, bonusAnual) {
    const totalBen = Object.values(benefits).reduce((a, b) => a + b, 0);
    
    // Employee INSS progressive calculation
    const inss = Math.min(gross * 0.14, config.INSS_MAX_CONTRIBUTION);
    const irrf = calculateIRRF(gross, inss, 0); // 0 dependents assumed for standard baseline

    const net = gross - inss - irrf + totalBen;
    const p13 = gross * config.PROVISION_13TH;
    const pv13 = gross * config.PROVISION_VAC_13;
    const pBonus = bonusAnual / 12;
    const pfgts = gross * config.FGTS;
    const totalCash = net + p13 + pv13 + pBonus + pfgts;

    const inssP = gross * config.INSS_PATRONAL;
    const ratT = gross * (config.RAT + config.TERCEIROS);
    const fgtsFull = gross * (config.FGTS + config.FGTS_FINE);
    const pVac = gross * config.PROVISION_VACATION;
    const provFull = p13 + pVac + pv13;
    const chargesOnP = provFull * (config.INSS_PATRONAL + config.RAT + config.TERCEIROS + config.FGTS);
    const employerCost = gross + totalBen + inssP + ratT + fgtsFull + provFull + chargesOnP + pBonus;

    return { 
        gross, net, totalCash, inss, irrf, 
        encargosSum: inss + irrf,
        provisionsSum: p13 + pv13 + pBonus + pfgts,
        p13, pv13, pfgts, pBonus, inssP, ratT, fgtsFull, provFull, employerCost, totalBen 
    };
}

function calculatePJ(gross, expenses, pjBonusAnual, strategy) {
    const totalExp = (expenses.accounting || 0) + 19.70 + 30.00;
    
    let proLabore = 0;
    let das = 0;
    
    if (strategy === 'ANEXO_III') {
        proLabore = Math.max(1621.00, gross * 0.28);
        const dasRate = getDASAliquotaEfetiva(gross, 'III');
        das = gross * dasRate;
    } else {
        proLabore = 1621.00;
        const dasRate = getDASAliquotaEfetiva(gross, 'V');
        das = gross * dasRate;
    }
    
    const plInss = Math.min(proLabore * 0.11, config.INSS_PJ_MAX_CONTRIBUTION);
    const plIrrf = calculateIRRF(proLabore, plInss, 0);
    
    const net = gross - das - plInss - plIrrf - totalExp;
    const pBonus = (pjBonusAnual || 0) / 12;
    const totalCash = net + pBonus;
    
    return { 
        gross, net, totalCash, das, plInss, plIrrf, totalExp, pBonus, proLabore,
        costsSum: das + plInss + plIrrf + totalExp, employerCost: gross 
    };
}

let activeRequestController = null;

async function updateUI() {
    if (activeRequestController) {
        activeRequestController.abort();
    }
    activeRequestController = new AbortController();
    const { signal } = activeRequestController;

    const cards = document.querySelectorAll('.result-card');
    cards.forEach(card => card.classList.add('loading-pulse'));

    const userRole = document.body.classList.contains('internal-mode') ? 'RECURSOS_HUMANOS' : 'CANDIDATO';

    try {
        const response = await fetch('/api/v1/finance/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-role': userRole
            },
            body: JSON.stringify({
                baseRegime: state.baseRegime,
                baseValue: state.baseValue,
                benefits: state.benefits,
                expenses: state.expenses,
                bonusAnual: state.bonusAnual,
                pjBonusAnual: state.pjBonusAnual,
                pjStrategy: state.pjStrategy
            }),
            signal
        });

        if (!response.ok) {
            throw new Error('Network error executing calculation');
        }

        const result = await response.json();
        renderCalculationResult(result);
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Calculation API failed:', err);
        }
    } finally {
        cards.forEach(card => card.classList.remove('loading-pulse'));
    }
}

function renderCalculationResult(result) {
    const clt = result.clt;
    const pj = result.pj;

    if (result.baseRegime === 'CLT') {
        document.getElementById('clt-status').textContent = 'Base';
        document.getElementById('pj-status').textContent = 'Equivalente';
    } else {
        document.getElementById('pj-status').textContent = 'Base';
        document.getElementById('clt-status').textContent = 'Equivalente';
    }

    // Populate CLT
    document.getElementById('clt-gross-val').textContent = fmt.format(clt.gross);
    document.getElementById('clt-net-val').textContent = fmt.format(clt.totalCash);
    
    // Encargos
    document.getElementById('clt-encargos-sum').textContent = '- ' + fmt.format(clt.encargosSum);
    document.getElementById('clt-inss').textContent = '- ' + fmt.format(clt.inss);
    document.getElementById('clt-irrf').textContent = '- ' + fmt.format(clt.irrf);
    
    // Monthly Net Row
    document.getElementById('clt-net-monthly-display').textContent = fmt.format(clt.net);

    // Provisions
    document.getElementById('clt-prov-sum').textContent = '+ ' + fmt.format(clt.provisionsSum);
    document.getElementById('clt-fgts-cand').textContent = '+ ' + fmt.format(clt.pfgts);
    document.getElementById('clt-prov-13').textContent = '+ ' + fmt.format(clt.p13);
    document.getElementById('clt-prov-vac').textContent = '+ ' + fmt.format(clt.pv13);
    document.getElementById('clt-prov-bonus').textContent = '+ ' + fmt.format(clt.pBonus);
    
    // Employer CLT
    if (clt.employerCost !== undefined) {
        document.getElementById('clt-employer-sum').textContent = fmt.format(clt.employerCost);
        document.getElementById('clt-base-val').textContent = fmt.format(clt.gross);
        document.getElementById('clt-inss-pat').textContent = '+ ' + fmt.format(clt.inssP);
        document.getElementById('clt-rat-ter').textContent = '+ ' + fmt.format(clt.ratT);
        document.getElementById('clt-fgts-val').textContent = '+ ' + fmt.format(clt.fgtsFull);
        document.getElementById('clt-prov-full').textContent = '+ ' + fmt.format(clt.provFull);
        document.getElementById('clt-ben-full').textContent = '+ ' + fmt.format(clt.totalBen);
    } else {
        document.getElementById('clt-employer-sum').textContent = '---';
    }

    // Populate PJ
    document.getElementById('pj-gross-val').textContent = fmt.format(pj.gross);
    document.getElementById('pj-net-val').textContent = fmt.format(pj.totalCash);
    
    // Impostos e Custos PJ
    document.getElementById('pj-costs-sum').textContent = '- ' + fmt.format(pj.costsSum);
    document.getElementById('pj-das').textContent = '- ' + fmt.format(pj.das);
    
    // DAS Breakdown
    let dasCPP = 0, dasISS = 0, dasCOFINS = 0, dasIRPJ = 0, dasCSLL = 0, dasPIS = 0;
    if (state.pjStrategy === 'ANEXO_III') {
        dasCPP = pj.das * 0.4340;
        dasISS = pj.das * 0.3360;
        dasCOFINS = pj.das * 0.1274;
        dasIRPJ = pj.das * 0.0400;
        dasCSLL = pj.das * 0.0350;
        dasPIS = pj.das * 0.0276;
    } else {
        dasCPP = pj.das * 0.2950;
        dasISS = pj.das * 0.1400;
        dasCOFINS = pj.das * 0.1628;
        dasIRPJ = pj.das * 0.2500;
        dasCSLL = pj.das * 0.1186;
        dasPIS = pj.das * 0.0336;
    }
    
    document.getElementById('pj-das-cpp').textContent = '- ' + fmt.format(dasCPP);
    document.getElementById('pj-das-iss').textContent = '- ' + fmt.format(dasISS);
    document.getElementById('pj-das-cofins').textContent = '- ' + fmt.format(dasCOFINS);
    document.getElementById('pj-das-irpj').textContent = '- ' + fmt.format(dasIRPJ);
    document.getElementById('pj-das-csll').textContent = '- ' + fmt.format(dasCSLL);
    document.getElementById('pj-das-pis').textContent = '- ' + fmt.format(dasPIS);
    
    // Pró-labore Taxes
    document.getElementById('pj-pl-taxes').textContent = '- ' + fmt.format(pj.plInss + pj.plIrrf);
    document.getElementById('pj-pl-inss').textContent = '- ' + fmt.format(pj.plInss);
    document.getElementById('pj-pl-irrf').textContent = '- ' + fmt.format(pj.plIrrf);
    
    const expAccounting = state.expenses.accounting || 0;
    const expTFE = 19.70;
    const expCert = 30.00;
    const expTotal = expAccounting + expTFE + expCert;
    
    document.getElementById('pj-exp-val').textContent = '- ' + fmt.format(expTotal);
    document.getElementById('pj-exp-accounting').textContent = '- ' + fmt.format(expAccounting);
    document.getElementById('pj-exp-tfe').textContent = '- ' + fmt.format(expTFE);
    document.getElementById('pj-exp-cert').textContent = '- ' + fmt.format(expCert);
    
    // Dynamic Labels in Accordion
    if (pj.gross > 0) {
        document.querySelector('#pj-das').previousElementSibling.textContent = 'DAS (Simples Nac. ' + (pj.das / pj.gross * 100).toFixed(2) + '%)';
        document.querySelector('#pj-pl-taxes').previousElementSibling.textContent = 'Encargos s/ Pró-labore (PL: ' + fmt.format(pj.proLabore) + ')';
    } else {
        document.querySelector('#pj-das').previousElementSibling.textContent = 'DAS (Simples Nacional)';
        document.querySelector('#pj-pl-taxes').previousElementSibling.textContent = 'Encargos s/ Pró-labore';
    }

    // Monthly Net PJ Row
    document.getElementById('pj-net-monthly-display').textContent = fmt.format(pj.net);

    // Rendimentos Provisionados PJ
    document.getElementById('pj-prov-sum').textContent = '+ ' + fmt.format(pj.pBonus);
    document.getElementById('pj-prov-bonus').textContent = '+ ' + fmt.format(pj.pBonus);

    // Employer PJ values
    if (pj.employerCost !== undefined) {
        document.getElementById('pj-employer-sum').textContent = fmt.format(pj.employerCost);
        document.getElementById('pj-gross-company-val').textContent = fmt.format(pj.gross);
    } else {
        document.getElementById('pj-employer-sum').textContent = '---';
    }

    // Company Cost comparison percentages
    if (clt.employerCost !== undefined && pj.employerCost !== undefined) {
        updateCompanyCostComparison(clt.employerCost, pj.employerCost);
    } else {
        const cltDiffEl = document.getElementById('clt-company-diff-pct');
        const pjDiffEl = document.getElementById('pj-company-diff-pct');
        if (cltDiffEl) setComparisonText(cltDiffEl, 'Visão Restrita RH', 'neutral');
        if (pjDiffEl) setComparisonText(pjDiffEl, 'Visão Restrita RH', 'neutral');
    }
    
    // Sync heights
    setTimeout(syncRowHeights, 50);
}

function updateCompanyCostComparison(cltCost, pjCost) {
    const cltDiffEl = document.getElementById('clt-company-diff-pct');
    const pjDiffEl = document.getElementById('pj-company-diff-pct');
    
    if (!cltDiffEl || !pjDiffEl) return;
    
    if (Math.abs(cltCost - pjCost) < 0.01) {
        setComparisonText(cltDiffEl, 'Custos equivalentes', 'positive');
        setComparisonText(pjDiffEl, 'Custos equivalentes', 'positive');
        return;
    }
    
    if (cltCost < pjCost) {
        const cltSavingPct = ((pjCost - cltCost) / pjCost) * 100;
        const pjExtraPct = ((pjCost - cltCost) / cltCost) * 100;
        
        setComparisonText(cltDiffEl, `Economia de ${cltSavingPct.toFixed(2)}% vs PJ`, 'positive');
        setComparisonText(pjDiffEl, `+${pjExtraPct.toFixed(2)}% (Mais caro)`, 'negative');
    } else {
        const cltExtraPct = ((cltCost - pjCost) / pjCost) * 100;
        const pjSavingPct = ((cltCost - pjCost) / cltCost) * 100;
        
        setComparisonText(cltDiffEl, `+${cltExtraPct.toFixed(2)}% (Mais caro)`, 'negative');
        setComparisonText(pjDiffEl, `Economia de ${pjSavingPct.toFixed(2)}% vs CLT`, 'positive');
    }
}

function setComparisonText(element, text, className) {
    element.textContent = text;
    element.className = className;
}

// BRL Live Currency Mask
function applyBRLMask(input, defaultValue, onUpdate) {
    const initialFloat = parseFloat(defaultValue) || 0;
    input.value = initialFloat.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value === '') {
            e.target.value = '0,00';
            onUpdate(0);
            return;
        }
        let floatVal = parseFloat(value) / 100;
        e.target.value = floatVal.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        onUpdate(floatVal);
    });
}

// Accordion Toggles
document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
        toggleAccordionPair(header.parentElement);
        
        // Wait for CSS transitions
        setTimeout(syncRowHeights, 310);
        syncRowHeights();
    });
});

function toggleAccordionPair(accordion) {
    const otherAccordion = findSymmetricalAccordion(accordion);
    
    if (otherAccordion) {
        const willBeActive = !accordion.classList.contains('active');
        toggleAccordionState(accordion, willBeActive);
        toggleAccordionState(otherAccordion, willBeActive);
    } else {
        accordion.classList.toggle('active');
    }
}

function findSymmetricalAccordion(accordion) {
    const breakdown = accordion.parentElement;
    const card = breakdown.parentElement;
    const isClt = card.classList.contains('clt');
    
    const children = Array.from(breakdown.children);
    const index = children.indexOf(accordion);
    
    const otherCardSelector = isClt ? '.result-card.pj' : '.result-card.clt';
    const otherBreakdown = document.querySelector(otherCardSelector + ' .breakdown');
    
    if (!otherBreakdown) return null;
    
    const otherItem = otherBreakdown.children[index];
    if (otherItem && otherItem.classList.contains('accordion')) {
        return otherItem;
    }
    return null;
}

function toggleAccordionState(accordion, active) {
    if (active) {
        accordion.classList.add('active');
    } else {
        accordion.classList.remove('active');
    }
}

// Tab Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// Initialize Masks and Event Bindings
applyBRLMask(document.getElementById('salary-input'), 10000, (val) => {
    state.baseValue = val;
    updateUI();
});

applyBRLMask(document.getElementById('bonus-input'), 10000, (val) => {
    state.bonusAnual = val;
    updateUI();
});

applyBRLMask(document.getElementById('pj-bonus-input'), 0, (val) => {
    state.pjBonusAnual = val;
    updateUI();
});

document.querySelectorAll('.benefit-input').forEach(input => {
    const key = input.dataset.key;
    const initialVal = state.benefits[key] || 0;
    applyBRLMask(input, initialVal, (val) => {
        state.benefits[key] = val;
        updateUI();
    });
});

document.querySelectorAll('.expense-input').forEach(input => {
    const key = input.dataset.key;
    const initialVal = state.expenses[key] || 0;
    applyBRLMask(input, initialVal, (val) => {
        state.expenses[key] = val;
        updateUI();
    });
});

document.getElementById('base-clt').addEventListener('click', () => {
    state.baseRegime = 'CLT';
    document.getElementById('base-clt').classList.add('active');
    document.getElementById('base-pj').classList.remove('active');
    updateUI();
});

document.getElementById('base-pj').addEventListener('click', () => {
    state.baseRegime = 'PJ';
    document.getElementById('base-pj').classList.add('active');
    document.getElementById('base-clt').classList.remove('active');
    updateUI();
});

// PJ Strategy Toggle Bindings
document.getElementById('strat-anexo-iii').addEventListener('click', () => {
    state.pjStrategy = 'ANEXO_III';
    document.getElementById('strat-anexo-iii').classList.add('active');
    document.getElementById('strat-anexo-v').classList.remove('active');
    updateUI();
});

document.getElementById('strat-anexo-v').addEventListener('click', () => {
    state.pjStrategy = 'ANEXO_V';
    document.getElementById('strat-anexo-v').classList.add('active');
    document.getElementById('strat-anexo-iii').classList.remove('active');
    updateUI();
});

document.getElementById('btn-candidate').addEventListener('click', () => {
    document.body.classList.remove('internal-mode');
    document.getElementById('btn-candidate').classList.add('active');
    document.getElementById('btn-internal').classList.remove('active');
    updateUI();
});

document.getElementById('btn-internal').addEventListener('click', () => {
    document.body.classList.add('internal-mode');
    document.getElementById('btn-internal').classList.add('active');
    document.getElementById('btn-candidate').classList.remove('active');
    updateUI();
});

// Row height synchronization
function syncRowHeights() {
    const cltBreakdown = document.querySelector('.result-card.clt .breakdown');
    const pjBreakdown = document.querySelector('.result-card.pj .breakdown');
    if (!cltBreakdown || !pjBreakdown) return;
    
    const cltChildren = Array.from(cltBreakdown.children);
    const pjChildren = Array.from(pjBreakdown.children);
    const count = Math.min(cltChildren.length, pjChildren.length);
    
    for (let i = 0; i < count; i++) {
        const cltItem = cltChildren[i];
        const pjItem = pjChildren[i];
        
        if (isAccordionPair(cltItem, pjItem)) {
            syncAccordionHeights(cltItem, pjItem);
        } else {
            syncSimpleRowHeights(cltItem, pjItem);
        }
    }
}

function isAccordionPair(itemA, itemB) {
    return itemA.classList.contains('accordion') && itemB.classList.contains('accordion');
}

function syncAccordionHeights(cltAccordion, pjAccordion) {
    const cltHeader = cltAccordion.querySelector('.accordion-header');
    const pjHeader = pjAccordion.querySelector('.accordion-header');
    const cltContent = cltAccordion.querySelector('.accordion-content');
    const pjContent = pjAccordion.querySelector('.accordion-content');
    
    resetAccordionHeights(cltHeader, pjHeader, cltContent, pjContent);
    
    if (cltHeader && pjHeader) {
        syncHeaderHeights(cltHeader, pjHeader);
    }
    
    if (cltAccordion.classList.contains('active') && cltContent && pjContent) {
        syncActiveContentHeights(cltContent, pjContent);
    }
}

function resetAccordionHeights(cltHeader, pjHeader, cltContent, pjContent) {
    if (cltHeader) cltHeader.style.height = '';
    if (pjHeader) pjHeader.style.height = '';
    if (cltContent) cltContent.style.height = '';
    if (pjContent) pjContent.style.height = '';
}

function syncHeaderHeights(headerA, headerB) {
    const maxHeight = Math.max(headerA.offsetHeight, headerB.offsetHeight);
    headerA.style.height = maxHeight + 'px';
    headerB.style.height = maxHeight + 'px';
}

function syncActiveContentHeights(contentA, contentB) {
    contentA.style.maxHeight = 'none';
    contentB.style.maxHeight = 'none';
    
    const maxHeight = Math.max(contentA.scrollHeight, contentB.scrollHeight);
    contentA.style.height = maxHeight + 'px';
    contentB.style.height = maxHeight + 'px';
    
    contentA.style.maxHeight = '';
    contentB.style.maxHeight = '';
}

function syncSimpleRowHeights(itemA, itemB) {
    itemA.style.height = '';
    itemB.style.height = '';
    const maxHeight = Math.max(itemA.offsetHeight, itemB.offsetHeight);
    itemA.style.height = maxHeight + 'px';
    itemB.style.height = maxHeight + 'px';
}

// Window resize sync
window.addEventListener('resize', syncRowHeights);

updateUI();

