pragma solidity ^0.5.0;

import "./Token.sol";

contract EthSwap {
    string public name = "EthSwap Instant Exchange";
    Token public token;
    //Redemption rate = # of token they recieve for 1 ether
    uint public rate = 100;

    event TokensPurchased(
        address account,
        address token,
        uint amount,
        uint rate,
        uint ethAmount
    );

    event TokensSold(
        address account,
        address token,
        uint amount,
        uint rate,
        uint ethAmount
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        //Calculate the number of tokens to buy
        uint tokenAmount = rate * msg.value;
        // Require that EthSwap has enough tokens
        require(token.balanceOf(address(this)) >= tokenAmount);
        token.transfer(msg.sender, tokenAmount);
        // Emit an event
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate, msg.value);
    }

    function sellTokens(uint _amount) public {
        //User can't sell more thokens than they have
        require(token.balanceOf(msg.sender) >= _amount);

        //Calculate the amount of ether to redeem
        uint etherAmount = _amount / rate;

        // Require that EthSwap has enough tokens
        require(address(this).balance >= etherAmount);
    
        //Perform sale
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);
        //Emit an event
        emit TokensSold(msg.sender, address(token), _amount, rate, etherAmount);
    }
}