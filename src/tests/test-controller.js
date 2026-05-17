const FinancialController = require('../controllers/FinancialController');

const controller = new FinancialController();

async function runTests() {
    console.log('--- TEST 1: Requisição como RECURSOS_HUMANOS ---');
    const reqRH = {
        body: { model: 'CLT', gross: 10000, benefits: { vr: 1000 } },
        user: { role: 'RECURSOS_HUMANOS' }
    };
    const resRH = {
        status: (code) => ({ json: (data) => console.log(`Code: ${code}`, JSON.stringify(data, null, 2)) })
    };
    await controller.calculate(reqRH, resRH);

    console.log('\n--- TEST 2: Requisição como CANDIDATO ---');
    const reqCand = {
        body: { model: 'CLT', gross: 10000, benefits: { vr: 1000 } },
        user: { role: 'CANDIDATO' }
    };
    const resCand = {
        status: (code) => ({ json: (data) => console.log(`Code: ${code}`, JSON.stringify(data, null, 2)) })
    };
    await controller.calculate(reqCand, resCand);
}

runTests();
