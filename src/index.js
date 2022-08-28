
const ethers = require("ethers");
require("dotenv").config();
const abi = require("./chz.json");
const address = "0x3506424f91fd33084466f402d5d97f05f8e3b4af";

const provider = new ethers.providers.WebSocketProvider(`wss://mainnet.infura.io/ws/v3/${process.env.INFURA_KEY}`);


// event Transfer(
//     address indexed from,
//     address indexed to,
//     uint256 value
//   );


// lo importante el el acumulador. cada vez que se haga get,
// este endpoint arrojara el total de CHZ en un objeto
// revisar el formatUnits y las unidades del token.
async function main() {

    // The Contract object
    const contract = new ethers.Contract(address, abi, provider);

    let accumulated = ethers.constants.Zero;
    contract.on('Transfer', (from, to, value, event) => {
        // native method from BigNumber
        const sum = accumulated.add(value);
        console.log(`${from} -> ${to} ${ethers.utils.formatUnits(value, 'ether')} ${ethers.utils.formatUnits(sum, 'ether')}`);
        // console.log(from, to, ethers.utils.formatUnits(value, 'ether'));
        accumulated = sum;
    });

}

async function main2() {
    // The Contract object
    // const contract = new ethers.Contract(address, abi, provider);
    const iface = new ethers.utils.Interface(abi);
    
    let chztx = "0xfa83f01b292bcd3d407e04ad438aed5df405f05183e59f62e079f435d77faa79";
    let otra = "0x55ff648e48418f1391d812d66ad92f93efdea87bf71c36b5e7f9a03615d8278c";

    // let usdttx = "";

    provider.getTransaction(otra).then((tx) => {
        let decodedData = iface.parseTransaction({ data: tx.data, value: tx.value });
        //let decodedData = iface.decodeFunctionData("Transfer", tx.data);
        console.log(JSON.stringify(decodedData, null, 2));
    });

}


main2().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});