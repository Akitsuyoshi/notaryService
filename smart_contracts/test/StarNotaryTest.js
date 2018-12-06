const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => {

    let user1 = accounts[1];
    let user2 = accounts[2];
    let randomMaliciousUser = accounts[3];

    let name = 'awesome star!';
    let starStory = "this star was bought for my wife's birthday";
    let ra = "1";
    let dec = "1";
    let mag = "1";
    let tokenId = 1;

    beforeEach(async () => {
        this.owner = accounts[0];
        this.contract = await StarNotary.new({ from: this.owner });
    });
    
    describe('can create a star', () => { 

        it('can create a star and get its name', async () => { 
            
            await this.contract.createStar(name, starStory, ra, dec, mag, tokenId, {from: this.owner});
            let newName = await this.contract.tokenIdToStarInfo(tokenId).then(result => result[0]).catch(e => console.log(e));

            assert.equal(newName, name);
        });
    });

    describe('star uniqueness', () => {

        it('only unique stars can be minted', async () => { 
            // first we mint our first star
            await this.contract.createStar(name, starStory, ra, dec, mag, tokenId, {from: this.owner});

            expectThrow(this.contract.createStar(name, starStory, ra, dec, mag, tokenId, {from: this.owner}));
        });

        it('only stars unique stars can be minted even if their ID is different', async () => { 
            // first we mint our first star
            await this.contract.createStar(name, starStory, ra, dec, mag, tokenId, {from: this.owner});
            // then we try to mint the same star, and we expect an error
            let differentId = 2;
            expectThrow(this.contract.createStar(name, starStory, ra, dec, mag, differentId, {from: this.owner}));
        });

        it('minting unique stars does not fail', async () => { 
            for (let id = 0; id < 10; id ++) {
                let newRa = id.toString();
                let newDec = id.toString();
                let newMag = id.toString();

                await this.contract.createStar(name, starStory, newRa, newDec, newMag, id, { from: user1 });

                let starInfo = await this.contract.tokenIdToStarInfo(id);
                assert.equal(starInfo[0], name);
            }
        });
    });

    describe('buying and selling stars', () => { 
        
        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async () => { 
            await this.contract.createStar(name, starStory, ra, dec, mag, tokenId, {from: user1});
        });

        it('user1 can put up their star for sale', async () => { 
            assert.equal(await this.contract.ownerOf(tokenId), user1)
            await this.contract.putStarUpForSale(tokenId, starPrice, {from: user1})
            
            assert.equal(await this.contract.starsForSale(tokenId), starPrice)
        });

        it('user1 gets the funds after selling a star', async () => {
            let starPrice = web3.toWei(.05, 'ether');
            await this.contract.putStarUpForSale(tokenId, starPrice, { from: user1 });

            let balanceBeforeTransaction = web3.eth.getBalance(user1);
            await this.contract.buyStar(tokenId, { from: user2, value: starPrice });

            let balanceAfterTransaction = web3.eth.getBalance(user1);
            assert.equal(balanceBeforeTransaction.add(starPrice).toNumber(), balanceAfterTransaction.toNumber());
        });

        describe('user2 can buy a star that was put up for sale', () => { 
            beforeEach(async () => { 
                await this.contract.putStarUpForSale(tokenId, starPrice, {from: user1})
            });

            it('user2 is the owner of the star after they buy it', async () => { 
                await this.contract.buyStar(tokenId, {from: user2, value: starPrice, gasPrice: 0})
                assert.equal(await this.contract.ownerOf(tokenId), user2)
            });

            it('user2 ether balance changed correctly', async () => { 
                let overpaidAmount = web3.toWei(.05, 'ether')
                const balanceBeforeTransaction = web3.eth.getBalance(user2)
                await this.contract.buyStar(tokenId, {from: user2, value: overpaidAmount, gasPrice: 0})
                const balanceAfterTransaction = web3.eth.getBalance(user2)

                assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), starPrice)
            });
        });
    });

    describe('can check star existance', () => { 

        it('return true if star exits', async () => { 
            
            await this.contract.createStar(name, starStory, ra, dec, mag, tokenId, {from: this.owner});
            let result = await this.contract.checkIfStarExist(ra, dec, mag);

            assert.equal(result[0], true);
        });

        it('return false if not', async () => {
            
            await this.contract.createStar(name, starStory, ra, dec, mag, tokenId, {from: this.owner});
            let result = await this.contract.checkIfStarExist(ra, dec + "1", mag);

            assert.equal(result[0], false);
        });
    });
});

async function expectThrow(promise) { 
    try { 
        await promise;
    } catch (error) { 
        assert.exists(error);
        return;
    }
    assert.fail('expected an error, but none was found');
}