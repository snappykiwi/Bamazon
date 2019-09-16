// NPM IMPORTS
let inquirer = require("inquirer");
let mysql = require("mysql");

require('dotenv').config();

// DATABASE SET UP
let connection = mysql.createConnection({
  host: process.env.DB_HOST,

  port: 3306,

  user: process.env.DB_USER,

  password: process.env.DB_PASSWORD,

  database: "bamazon"
})

connection.connect((err) => {

  if (err) throw err;

  console.log(`connected as id ${connection.threadId}`)

  displayOptions();
});

let printInfo = (res) => {
  res.forEach(({ item_id, product_name, price, stock_quantity }) => {
    console.log(`${item_id} | ${product_name} | $${price} | ${stock_quantity}`)
  });
}

let viewProducts = () => {

  connection.query("SELECT * FROM products",
    function (err, res) {
      if (err) throw err;

      printInfo(res)
      displayOptions();
    })

}

let viewLowInventory = () => {

  connection.query("SELECT * FROM products WHERE stock_quantity < 5",
    function (err, res) {
      if (err) throw err;

      printInfo(res)
    })
}

let addInventory = () => {

}

let addNewProduct = () => {

}


let displayOptions = () => {

  inquirer.prompt([
    {
      type: "list",
      name: "options",
      message: "what would you like to do?",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
    }
  ]).then(response => {

    switch (response.options) {
      case "View Products for Sale":
        console.log("viewing products...")
        viewProducts();
        break;

      case "View Low Inventory":
        console.log("viewing low inventory...")
        viewLowInventory();
        break;

      case "Add to Inventory":
        console.log("adding to inventory...")
        return

      case "Add New Product":
        console.log("adding new product...")
        return

      case "Exit":
        connection.end();
        return

      default:
        console.log("Invalid command. Please try again.")
    }
  })
}