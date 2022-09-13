var TokenSale = artifacts.require("TokenSale");
var DappToken = artifacts.require("DappToken");

contract("TokenSale", function(accounts){
	var tokenSaleInstance;
	var tokenInstance;
	var admin = accounts[0];
	var buyer = accounts[1];
	var tokenPrice = 1000000000000000; //in wei -> smallest unit of Ether -> 0,001 Ether - there no floats, like 1 € = 100 Cents
	var tokensAvailable = 750000;
	var numberOfTokens;

	it('initializes the contract with the correct values', function() {
	    return TokenSale.deployed().then(function(instance) {
	      tokenSaleInstance = instance;
	      return tokenSaleInstance.address
	    }).then(function(address) {
	      assert.notEqual(address, 0x0, 'has contract address');
	      return tokenSaleInstance.tokenContract();
	    }).then(function(address) {
	      assert.notEqual(address, 0x0, 'has token contract address');
	      return tokenSaleInstance.tokenPrice();
	    }).then(function(price) {
	      assert.equal(price, tokenPrice, 'token price is correct');
	    });
	});

	it("facilitates token buyin", function(){
		return DappToken.deployed().then(function(instance){
			// grab tokeninstance first
			tokenInstance = instance;
			return TokenSale.deployed();
		}).then(function(instance){
			// after that grab tokensale instance
			tokenSaleInstance = instance;
			// Provision 75 % of tokens to sale
			return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin})
		}).then(function(receipt){
			numberOfTokens = 10;
			return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice}) // value = amount of wei that is needed to pay
		}).then(function(receipt){
			 assert.equal(receipt.logs.length, 1, 'triggers one event');
			 assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
			 assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
			 assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
			return tokenSaleInstance.tokensSold();
		}).then(function (amount) {
			assert.equal(amount.toNumber(), numberOfTokens, "increments the number of tokens sold");
			return tokenInstance.balanceOf(buyer);
		}).then(function (balance) {
			assert.equal(balance.toNumber(), numberOfTokens);
			return tokenInstance.balanceOf(tokenSaleInstance.address);
		}).then(function (balance) {
			assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens, "balance has to equal tokens left");
			return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1}); //tries to buy Tokens on a way to low wei-value - catched by require(msg.value == multiply(_numberOfTokens, tokenPrice));
		}).then(assert.fail).catch(function(error){
			assert(error.message.toString().indexOf("revert") >=0, "msg.value must equal number of tokens * wei");
			return tokenSaleInstance.buyTokens(numberOfTokens+ 1, {from: buyer, value: numberOfTokens * tokenPrice}); // tries to buy more tokens than available - catched by require(tokenContract.transfer((msg.sender), _numberOfTokens));
		}).then(assert.fail).catch(function(error){
			assert(error.message.toString().indexOf("revert") >=0, "cannot purchase more tokens than available"); 
		});
	});

	it("ends token sale", function(){
		return DappToken.deployed().then(function(instance){
			// grab tokeninstance first
			tokenInstance = instance;
			return TokenSale.deployed();
		}).then(function(instance){
			// after that grab tokensale instance
			tokenSaleInstance = instance;
			//try end sale from accounts != admin
			return tokenSaleInstance.endSale({from: buyer});
		}).then(assert.fail).catch(function (error) {
			assert(error.message.toString().indexOf("revert") >=0, "must be admin to end sale");
			// end sale as admin
			return tokenSaleInstance.endSale({from: admin});
		}).then(function(receipt){
			return tokenInstance.balanceOf(admin);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 999990, "returns all unsold dapp token to admin"); // 10 tokens have been transfered, so 999990 have to go back
		})
	});
});


