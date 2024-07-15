import axios from "axios";
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

export default function Home() {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transactionsMap, setTransactionsMap] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [nameFilter, setNameFilter] = useState("");
  const [amountFilter, setAmountFilter] = useState("");

  async function getCustomers() {
    let { data } = await axios.get(
      "https://raw.githubusercontent.com/Shereif10/customersData/main/customers.json"
    );
    setCustomers(data);
    return data;
  }

  async function getTransactions() {
    let { data } = await axios.get(
      "https://raw.githubusercontent.com/Shereif10/transactionsData/main/transactions.json"
    );
    setTransactions(data);

    const map = data.reduce((acc, transaction) => {
      if (!acc[transaction.customer_id]) {
        acc[transaction.customer_id] = [];
      }
      acc[transaction.customer_id].push(transaction);
      return acc;
    }, {});

    setTransactionsMap(map);
    return data;
  }

  useEffect(() => {
    getCustomers();
    getTransactions();
  }, []);

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
  };

  const getChartData = () => {
    if (!selectedCustomer || !transactionsMap[selectedCustomer.id]) return null;

    const customerTransactions = transactionsMap[selectedCustomer.id];
    return {
      labels: customerTransactions.map((t) => t.date),
      datasets: [
        {
          label: "Transaction Amount",
          data: customerTransactions.map((t) => t.amount),
          fill: false,
          borderColor: "red",
        },
      ],
    };
  };

  const getAggregateChartData = () => {
    const dates = [];
    const amounts = [];

    transactions.forEach((transaction) => {
      const dateIndex = dates.indexOf(transaction.date);
      if (dateIndex === -1) {
        dates.push(transaction.date);
        amounts.push(transaction.amount);
      } else {
        amounts[dateIndex] += transaction.amount;
      }
    });

    return {
      labels: dates,
      datasets: [
        {
          label: "Total Transaction Amount",
          data: amounts,
          fill: false,
          borderColor: "blue",
        },
      ],
    };
  };

  const filteredCustomers = customers.filter(
    (cust) =>
      cust.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
      (!transactionsMap[cust.id] ||
        transactionsMap[cust.id].some(
          (transaction) =>
            amountFilter === "" ||
            transaction.amount.toString() === amountFilter
        ))
  );

  return (
    <section className="my-5">
      <>
        <h1 className="text-center text-white fw-bolder">
          Customers' Transactions
        </h1>

        <div className="container">
          <div className="row mb-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by Customer Name"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <input
                type="number"
                className="form-control"
                placeholder="Filter by Transaction Amount"
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
              />
            </div>
          </div>

          <table className="table table-bordered table-dark">
            <thead className="">
              <tr>
                <td className="fw-bolder">Customer Id</td>
                <td className="fw-bolder">Customer Name</td>
                <td className="fw-bolder">Transaction Amount</td>
                <td className="fw-bolder">Transaction Date</td>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(
                (cust) =>
                  transactionsMap[cust.id] &&
                  transactionsMap[cust.id].map((transaction, idx) => (
                    <tr
                      key={transaction.id}
                      onClick={() => handleCustomerClick(cust)}
                      className="border-1 cursor-pointer"
                    >
                      {idx === 0 && (
                        <>
                          <td rowSpan={transactionsMap[cust.id].length}>
                            {cust.id}
                          </td>
                          <td
                            rowSpan={transactionsMap[cust.id].length}
                            className="customer-name"
                          >
                            {cust.name}
                          </td>
                        </>
                      )}
                      <td className="border-0">{transaction.amount}</td>
                      <td className="border-0">{transaction.date}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        <div className="container bg-dark w-100">
          {!selectedCustomer && (
            <div>
              <h2 className="text-white">Aggregate Transactions</h2>
              <p className="text-light fw-lighter">
                ( Click on any customer name to get his/her chart )
              </p>
              <Line data={getAggregateChartData()} />
            </div>
          )}
          {selectedCustomer && (
            <div>
              <h2 className="text-white">
                Transactions for {selectedCustomer.name}
              </h2>
              <Line data={getChartData()} />
            </div>
          )}
        </div>
      </>
    </section>
  );
}
