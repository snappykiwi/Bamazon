const mysql = require('mysql'),
      inquirer = require('inquirer');

let customer = require("./bamazonCustomer"),
    manager = require("./bamazonManager"),
    supervisor = require('./bamazonSupervisor');

require('dotenv').config();

// DATABASE SET UP
const connection = mysql.createConnection({
  host: process.env.DB_HOST,

  port: 3306,

  user: process.env.DB_USER,

  password: process.env.DB_PASSWORD,

  database: "bamazon"
})

// CONNECTION TO DB
connection.connect((err) => {
  if (err) throw err;

  role();
})

let role = () => {

  inquirer.prompt(
    {
      type: "list",
      name: "role",
      message: "who are you?",
      choices: ["customer", "manager", "supervisor"]
    }
  ).then(( {role} ) => {
    role === "customer" ? customer.displayProducts() : 
    role === "manager" ? manager.displayOptions() : 
    supervisor.promptSupervisor()
  })
}