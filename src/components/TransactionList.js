import React, { Component } from "react";

class TransactionList extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <table class="table table-striped">
        <thead class="thead-dark">
          <tr>
            <th scope="col">Account</th>
            <th scope="col">Direction</th>
            <th scope="col">Rate</th>
            <th scope="col">Amount</th>
            <th scope="col">EtherAmount</th>
          </tr>
        </thead>
        <tbody>
          {this.transactionRows()}
        </tbody>
      </table>
    );
  }

  transactionRows () {
    if (this.props.transactions) {
      return this.props.transactions.map(transaction => this.transactionRow(transaction));
    }
  }
  
  transactionRow (transaction) {
    if (transaction) {
      console.log(transaction.id)
      return (
        // React may complain to use key={user.id} for tracking and mutating items
        <tr>
          <td> {transaction.account} </td>
          <td> {transaction.direction} </td>
          <td> {transaction.rate} </td>
          <td> {transaction.amount} </td>
          <td> {transaction.etherAmount} </td>
        </tr>
        
      );
    }
  }
}

export default TransactionList;
