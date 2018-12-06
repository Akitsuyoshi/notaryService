if (typeof web3 != 'undefined') {
    // what Metamask injected
    web3 = new Web3(web3.currentProvider);
} else {
    // Instantiate and set Ganache as your provider
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}
console.log(web3);

web3.eth.defaultAccount = web3.eth.accounts[0];

// The interface definition for your smart contract (the ABI) 
const StarNotary = web3.eth.contract(contractInterface);
const starNotary = StarNotary.at('0x5E079D3Aa3833F0393B5A1dE473F2435eCe03548');
const params = { from: web3.eth.defaultAccount, gas: 250000 };

async function claimButtonClicked() {
    try {
        console.log(web3);
        const starClaimedEvent = await starNotary.buyStar(1, 0.1, params);
        // I just call watch event without await, but maybe later we need to add it?
        starClaimedEvent.watch().then(() => location.reload()).catch(() => console.log('watching for star claimed event is failing'));
    } catch (error) {
        console.log(error);
    }
}

async function createButtonClicked(e) {
    e.preventDefault();
    const form = e.target;
    console.log("create is invoked");
    try {
        const account = web3.eth.defaultAccount;
        // TODO: we need to pass the args later into createStar and putStarUpForSale
        const { name, starStory, dec, mag, cent } = form;
        const createStar = await starNotary.createStar(name, starStory, cent, dec, mag, 1, params);
        const starPutSaleEvent = await starNotary.putStarUpForSale(1, 0.1, params);
        // I just call watch event without await, but maybe later we need to add it?
        starPutSaleEvent.watch().then(() => location.reload()).catch(() => console.log('watching for star create event is failing'));
    } catch (error) {
        console.log(error);
    }
}

document.getElementById('create').addEventListener('submit', (e) => {
    createButtonClicked(e);
})