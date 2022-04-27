import React, { Component } from "react";
import Web3 from "web3";
import Token from "../abis/Token.json";
import EthSwap from "../abis/EthSwap.json";
import Navbar from "./Navbar";
import Main from "./Main";
import TransactionList from "./TransactionList.js";
import "./App.css";

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadBlockchainData() {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    const ethBalance = await web3.eth.getBalance(this.state.account);
    this.setState({ ethBalance });

    //Load Token
    const networkId = await web3.eth.net.getId();
    const tokenData = Token.networks[5777];
    if (tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address);
      this.setState({ token });
      let tokenBalance = await token.methods
        .balanceOf(this.state.account)
        .call();
      this.setState({ tokenBalance: tokenBalance.toString() });
    } else {
      window.alert("Token contract not deployed to detected network");
    }

    //Load EthSwap
    const ethSwapData = EthSwap.networks[networkId];
    if (ethSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address);
      this.setState({ ethSwap });
    } else {
      window.alert("EthSwap contract not deployed to detected network");
    }

    this.getTransactions();

    this.setState({ loading: false });
  }

  async getTransactions() {
    const web3 = window.web3;

    const events = await this.state.ethSwap.getPastEvents({
      fromBlock: "0x0",
      toBlock: "latest",
    });
    let transactionData = [];
    console.log(events);
    for (let event of events) {
      console.log(event);
      let direction;
      if (event.event === "TokensPurchased") {
        direction = "Buy";
      } else {
        direction = "Sell";
      }
      transactionData.push({
        account: event.returnValues.account,
        rate: event.returnValues.rate,
        amount: web3.utils.fromWei(event.returnValues.amount, "Ether"),
        etherAmount: web3.utils.fromWei(event.returnValues.ethAmount, "Ether"),
        direction: direction,
      });
    }
    this.setState({ transactions: transactionData });
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true });
    this.state.ethSwap.methods
      .buyTokens()
      .send({ value: etherAmount, from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      })
      .then((event) => {
        console.log("rate: " + event.events.TokensPurchased.returnValues.rate);
        console.log("eth: " + window.web3.utils.fromWei(etherAmount, "Ether"));
        console.log(
          "tokens: " +
            window.web3.utils.fromWei(
              event.events.TokensPurchased.returnValues.amount,
              "Ether"
            )
        );
        console.log("BUY");
      });
  };

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true });
    console.log(this.state.ethSwap._address);
    this.state.token.methods
      .approve(this.state.ethSwap._address, tokenAmount)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.state.ethSwap.methods
          .sellTokens(tokenAmount)
          .send({ from: this.state.account })
          .on("transactionHash", (hash) => {
            //this.getTransactions()
            this.setState({ loading: false });
          })
          .then((event) => {
            console.log("rate: " + event.events.TokensSold.returnValues.rate);
            console.log("tokens: " + tokenAmount);
            console.log(
              "eth: " +
                window.web3.utils.fromWei(
                  event.events.TokensSold.returnValues.amount,
                  "Ether"
                )
            );
            console.log("SELL");
          });
      });
  };

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      token: {},
      ethBalance: "0",
      tokenBalance: "0",
      ethSwap: {},
      loading: true,
      transactions: [],
    };
  }

  render() {
    let content;
    let table;
    if (this.state.loading) {
      content = (
        <p id="loader" className="text-center">
          Loading...
        </p>
      );
      table = (
        <div className="container-fluid mt-5">
          <TransactionList transactions={this.state.transactions} />
        </div>
      );
    } else {
      content = (
        <Main
          ethBalance={this.state.ethBalance}
          tokenBalance={this.state.tokenBalance}
          buyTokens={this.buyTokens}
          sellTokens={this.sellTokens}
        />
      );
      table = (
        <div className="container-fluid mt-5">
          <TransactionList transactions={this.state.transactions} />
        </div>
      );
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto"
              style={{ maxWidth: "600px" }}
            >
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                ></a>
                {content}
              </div>
            </main>
          </div>
        </div>
        {table}
      </div>
    );
  }
}

export default App;
