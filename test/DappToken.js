var DappToken = artifacts.require("DappToken");



contract("DappToken", function(accounts){
	var tokenInstance;

	it("initializes the contract with the correct values", function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name){
			assert.equal(name, "Token", "has the correct name");
		return tokenInstance.symbol();
		}).then(function (symbol) {
			assert.equal(symbol, "FOM", "has the correct symbol");
			return tokenInstance.standard();
		}).then(function(standard){
			assert.equal(standard, "Dapp Token V1.0", "has the correct standard");
		});
	})


	it("sets the total supply upon deployment", function(){
		return DappToken.deployed().then(function (instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply){
			assert.equal(totalSupply.toNumber(), 1000000, "sets the total supply to 1,000,000");
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function (adminBalance) {
			assert.equal(adminBalance.toNumber(), 1000000, "it allocates the initial supply to the admin acc")
		});
	});


	it("transfers token ownership", function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.transfer.call(accounts[1], 999999999999); // call does not trigger transaction -> gets the return value
		}).then(assert.fail).catch(function(error){
			assert(error.message.toString().indexOf("revert") >=0, "error message must contain revert");
			return tokenInstance.transfer.call(accounts[1], 250000, {from: accounts[0]});
		}).then(function(success){
			assert.equal(success, true, "it returns true");
			return tokenInstance.transfer(accounts[1], 250000, {from: accounts[0]});
		}).then(function(receipt){
			 assert.equal(receipt.logs.length, 1, 'triggers one event');
			 assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
			 assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
			 assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
			 assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 250000, "adds the amount to the receiving accounts");
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 750000, "deducts the amount from the sending accounts");
		});
	});


	it("approves tokens for delegated transfer", function(){
		return DappToken.deployed().then(function (instance) {
			tokenInstance = instance;
			return tokenInstance.approve.call(accounts[1], 100); // Call triggers function without creating transaction on the blockchain
		}).then(function (success) {
			assert.equal(success, true, "it returns true");
			return tokenInstance.approve(accounts[1], 100, {from: accounts[0]}); // allow account[1] to spend 100 Tokens on our behalf (account[0])
		}).then(function(receipt){
			  assert.equal(receipt.logs.length, 1, 'triggers one event');
			  assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
			  assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
			  assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
			  assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
			  return tokenInstance.allowance(accounts[0], accounts[1]);
		}).then(function(allowance){
			assert.equal(allowance.toNumber(), 100, "Stores the allowance for delegated transfer");
		});
	});


	it("handels delegated transfer", function(){
		return DappToken.deployed().then(function (instance) {
			tokenInstance = instance;
			fromAccount = accounts[2];
			toAccount = accounts[3];
			spendingAccount = accounts[4];
			// transfer some tokens to [4] -> so he has a balance that he can delegated to transfer
			return tokenInstance.transfer(fromAccount, 100, {from: accounts[0]});
		}).then(function(receipt){
			return tokenInstance.approve(spendingAccount, 10, {from: fromAccount}); //approve spending account
		}).then(function(receipt){
			return tokenInstance.transferFrom(fromAccount, toAccount, 999, {from: spendingAccount}); // test if balance is <= transfer amount
		}).then(assert.fail).catch(function(error){
			assert(error.message.toString().indexOf("revert")>=0, "cannot transfer value lager than balance");
			return tokenInstance.transferFrom(fromAccount, toAccount, 20, {from: spendingAccount}); // test transferring > sum than approved amount
		}).then(assert.fail).catch(function(error){
			assert(error.message.toString().indexOf("revert")>=0, "cannot transfer value lager than approved amount");
			return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount}); // test return value - valid amount of tokens + call function
		}).then(function(success){
			assert.equal(success, true);
			return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount}); // test transfer event - unlike the other test, this one goes through and creates a transaction on the blockchain
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
			assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
			assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
			assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
			return tokenInstance.balanceOf(fromAccount);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 90, "deducts the amount from the sending account");
			return tokenInstance.balanceOf(toAccount);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 10, "adds the amount from the receiving account");
			return tokenInstance.allowance(fromAccount, spendingAccount);
		}).then(function(allowance){
			assert.equal(allowance.toNumber(), 0, "deducts the amount from the allowance");
		});
	});	
})
