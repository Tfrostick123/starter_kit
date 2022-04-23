const { assert } = require('chai');
const web3utils = require('web3-utils');
const Web3eth = require('web3-eth');
var web3eth = new Web3eth(Web3eth.givenProvider || 'HTTP://127.0.0.1:7545');


const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3utils.toWei(n, 'ether');
}

contract('EthSwap', ([deployed, investor]) => {
    let token, ethSwap

    //Setup everything
    before(async () => {
        token = await Token.new()
        ethSwap = await EthSwap.new(token.address)
        //Send the tokens to the contract
        await token.transfer(ethSwap.address, tokens('1000000'))
    })

    //Test that token was deployed successfully and has correct name
    describe('Token deployment', async () => {
        it('contract has a name', async () => {
            const name = await token.name()
            assert.equal(name, 'DApp Token')
        })
    })

    //Test that contract was deployed successfully and has the correct name
    describe('EthSwap deployment', async () => {
        it('contract has a name', async () => {
            const name = await ethSwap.name()
            assert.equal(name, 'EthSwap Instant Exchange')
        })

        //Test that contract has the correct amount of tokens
        it('contract has tokens', async () => {
            let balance = await token.balanceOf(ethSwap.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('buyTokens()', async () => {
        let result;

        before(async () => {
            result = await ethSwap.buyTokens({from: investor, value: web3utils.toWei('1', 'Ether')})
        })

        it('Allows user to instantly purchase tokens from ethSwap for a fixed price', async () => {
            //Check investor token balance after purchase
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('100'))

            // Check ethSwap balance after purchase
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('999900'))
            ethSwapBalance = await web3eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3utils.toWei('1', 'Ether'))

            // Check logs to ensure event was emitted with correct data
            const event = result.logs[0].args
            assert.equal(event.account, investor, 'investor account')
            assert.equal(event.token, token.address, 'token address')
            assert.equal(event.amount.toString(), tokens('100').toString(), 'amount')
            assert.equal(event.rate.toString(), '100', 'rate')
        })
    })

    describe('sellTokens()', async () => {
        let result;

        before(async () => {
            //Investor must approve
            await token.approve(ethSwap.address, tokens('100'), {from: investor});
            //Investor sells tokens
            result = await ethSwap.sellTokens(tokens('100'), {from:investor})
        })

        it('Allows user to instantly sell tokens to ethSwap for a fixed price', async () => {
            //Check investor token balance after sale
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('0'))

            // Check ethSwap balance after sale
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('1000000'))
            ethSwapBalance = await web3eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3utils.toWei('0', 'Ether'))

            // Check logs to ensure event was emitted with correct data
            const event = result.logs[0].args
            assert.equal(event.account, investor, 'investor account')
            assert.equal(event.token, token.address, 'token address')
            assert.equal(event.amount.toString(), tokens('100').toString(), 'amount')
            assert.equal(event.rate.toString(), '100', 'rate')

            //FAILURE test that the investor can't sell more than they have
            await ethSwap.sellTokens(tokens('500', {from: investor})).should.be.rejected;
        })
    })
})