const FinancialEngine = require('../services/FinancialEngine');

const engine = new FinancialEngine();

console.log('--- TEST 1: CLT R$ 4.500 (Isento) ---');
const res1 = engine.calculateCLT(4500, { va: 500, vr: 500 });
console.log(JSON.stringify(res1, null, 2));

console.log('\n--- TEST 2: CLT R$ 6.000 (Faixa Transição) ---');
const res2 = engine.calculateCLT(6000, { va: 500, vr: 500 });
console.log(JSON.stringify(res2, null, 2));

console.log('\n--- TEST 3: PJ R$ 10.000 (Com Fator R) ---');
const res3 = engine.calculatePJ(10000, 2800, { accounting: 200 });
console.log(JSON.stringify(res3, null, 2));

console.log('\n--- TEST 4: PJ R$ 10.000 (Sem Fator R) ---');
const res4 = engine.calculatePJ(10000, 1000, { accounting: 200 });
console.log(JSON.stringify(res4, null, 2));
