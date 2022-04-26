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
            <th scope="col">From</th>
            <th scope="col">To</th>
            <th scope="col">Value</th>
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
          <td> {transaction.from} </td>
          <td> {transaction.to} </td>
          <td> {transaction.value} </td>
        </tr>
        
      );
    }
  }
}

export default TransactionList;
