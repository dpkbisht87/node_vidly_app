const bcrypt = require('bcrypt');
const { runInContext } = require('lodash');

async function run(){
    const result = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('1234', result);
    console.log(result);
    console.log(hashed);
}
run();
