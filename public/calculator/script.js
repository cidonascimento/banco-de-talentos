/**
 * FinancialEngine (Frontend version)
 * Premium Accordion-based Interface with Grouped Metrics.
 */
const config = {
    INSS_CEILING: 8475.55,
    INSS_MAX_CONTRIBUTION: 988.09,
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
    SIMPLES_III: 0.06,
    SIMPLES_V: 0.155,
};

let state = {
    baseValue: 10000,
    baseRegime: 'CLT',
    bonusAnual: 10000,
    pjBonusAnual: 0,
    benefits: { meal: 1200, health: 500 },
    expenses: { accounting: 250 }
};

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function calculateCLT(gross, benefits, bonusAnual) {
    const totalBen = Object.values(benefits).reduce((a, b) => a + b, 0);
    const inss = Math.min(gross * 0.14, config.INSS_MAX_CONTRIBUTION);
    
    let irrf = 0;
    if (gross > config.IRRF_EXEMPTION_LIMIT) {
        if (gross <= config.IRRF_TRANSITION_CEILING) {
            irrf = Math.max(0, config.IRRF_REDUCER_FIXED - (config.IRRF_REDUCER_COEFF * gross));
        } else {
            irrf = (gross - inss) * 0.275 - 893.36;
        }
    }

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

function calculatePJ(gross, expenses, pjBonusAnual) {
    const totalExp = Object.values(expenses).reduce((a, b) => a + b, 0);
    const proLabore = gross * 0.28;
    const das = gross * config.SIMPLES_III;
    const plInss = Math.min(proLabore * 0.11, config.INSS_MAX_CONTRIBUTION);
    const plIrrf = proLabore > config.IRRF_EXEMPTION_LIMIT ? (proLabore * 0.075) : 0;
    
    const net = gross - das - plInss - plIrrf - totalExp;
    const pBonus = (pjBonusAnual || 0) / 12;
    const totalCash = net + pBonus;
    
    return { 
        gross, net, totalCash, das, plInss, plIrrf, totalExp, pBonus,
        costsSum: das + plInss + plIrrf + totalExp, employerCost: gross 
    };
}

function updateUI() {
    let clt, pj;

    if (state.baseRegime === 'CLT') {
        clt = calculateCLT(state.baseValue, state.benefits, state.bonusAnual);
        const target = clt.totalCash;
        
        let low = 0, high = target * 3, mid;
        for(let i = 0; i < 30; i++) {
            mid = (low + high) / 2;
            if (calculatePJ(mid, state.expenses, state.pjBonusAnual).totalCash < target) low = mid;
            else high = mid;
        }
        pj = calculatePJ(mid, state.expenses, state.pjBonusAnual);
        
        document.getElementById('clt-status').textContent = 'Base';
        document.getElementById('pj-status').textContent = 'Equivalente';
    } else {
        pj = calculatePJ(state.baseValue, state.expenses, state.pjBonusAnual);
        const target = pj.totalCash;
        
        let low = 0, high = target * 3, mid;
        for(let i = 0; i < 30; i++) {
            mid = (low + high) / 2;
            if (calculateCLT(mid, state.benefits, state.bonusAnual).totalCash < target) low = mid;
            else high = mid;
        }
        clt = calculateCLT(mid, state.benefits, state.bonusAnual);
        
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
    
    // Employer
    document.getElementById('clt-employer-sum').textContent = fmt.format(clt.employerCost);
    document.getElementById('clt-base-val').textContent = fmt.format(clt.gross);
    document.getElementById('clt-inss-pat').textContent = '+ ' + fmt.format(clt.inssP);
    document.getElementById('clt-rat-ter').textContent = '+ ' + fmt.format(clt.ratT);
    document.getElementById('clt-fgts-val').textContent = '+ ' + fmt.format(clt.fgtsFull);
    document.getElementById('clt-prov-full').textContent = '+ ' + fmt.format(clt.provFull);
    document.getElementById('clt-ben-full').textContent = '+ ' + fmt.format(clt.totalBen);

    // Populate PJ
    document.getElementById('pj-gross-val').textContent = fmt.format(pj.gross);
    document.getElementById('pj-net-val').textContent = fmt.format(pj.totalCash);
    
    // Impostos e Custos PJ
    document.getElementById('pj-costs-sum').textContent = '- ' + fmt.format(pj.costsSum);
    document.getElementById('pj-das').textContent = '- ' + fmt.format(pj.das);
    document.getElementById('pj-pl-taxes').textContent = '- ' + fmt.format(pj.plInss + pj.plIrrf);
    document.getElementById('pj-exp-val').textContent = '- ' + fmt.format(pj.totalExp);
    
    // Monthly Net PJ Row
    document.getElementById('pj-net-monthly-display').textContent = fmt.format(pj.net);

    // Rendimentos Provisionados PJ
    document.getElementById('pj-prov-sum').textContent = '+ ' + fmt.format(pj.pBonus);
    document.getElementById('pj-prov-bonus').textContent = '+ ' + fmt.format(pj.pBonus);
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
        header.parentElement.classList.toggle('active');
    });
});

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

document.getElementById('btn-candidate').addEventListener('click', () => {
    document.body.classList.remove('internal-mode');
    document.getElementById('btn-candidate').classList.add('active');
    document.getElementById('btn-internal').classList.remove('active');
});

document.getElementById('btn-internal').addEventListener('click', () => {
    document.body.classList.add('internal-mode');
    document.getElementById('btn-internal').classList.add('active');
    document.getElementById('btn-candidate').classList.remove('active');
});

updateUI();
