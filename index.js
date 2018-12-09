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

const wrapper = (cba) => {
    return new Promise((resolve) => resolve(cba));
}

async function lookupButtonClicked() {
    const form = document.forms[1];
    const id = form.elements.id.value;
    starNotary.tokenIdToStarInfo.call(id, (err, hash) => {
        if (err) console.log(err);
        document.getElementById("star-info").textContent = hash;
    });

    starNotary.ownerOf.call(id, (err, hash) => {
        if (err) console.log(err);
        document.getElementById("star-owner").textContent = hash;
    });
}

async function createButtonClicked() {
    const form = document.forms[0];
    try {
        const account = web3.eth.defaultAccount;
        // TODO: we need to pass the args later into createStar and putStarUpForSale
        const { name, starStory, dec, mag, cent, id } = form.elements;
        const createStar = await starNotary.createStar.sendTransaction(name.value, starStory.value, cent.value, dec.value, mag.value, id.value, function(err, hash) {
            if (err) console.log(err);
            console.log(hash);
        });
        console.log(createStar);
    } catch (error) {
        console.log(error);
    }
}

document.forms[0].addEventListener('submit', (e) => {
    e.preventDefault();
    createButtonClicked();
});

document.forms[1].addEventListener('submit', (e) => {
    e.preventDefault();
    lookupButtonClicked();
});