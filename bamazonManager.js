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

  displayOptions();
});

let printInfo = (res) => {

  return res.forEach(({ item_id, product_name, price, stock_quantity }) => {
    console.log(`
    ${item_id} | ${product_name} | $${price} | ${stock_quantity}
    `)
  });

}

let viewProducts = () => {

  connection.query("SELECT * FROM products", (err, res) => {
    if (err) throw err;

    printInfo(res);
    displayOptions();
  })

}

let viewLowInventory = () => {

  connection.query("SELECT * FROM products WHERE stock_quantity < 5", (err, res) => {
    if (err) throw err;

    printInfo(res);
    displayOptions();
  })
}

let addInventory = () => {


  inquirer.prompt([
    {
      type: "number",
      name: "addInventory",
      message: "choose the id of the item you would like to add more of"
    },
    {
      type: "number",
      name: "addAmount",
      message: "How many would you like to order for your inventory?"
    }
  ]).then(({ addInventory, addAmount }) => {

    connection.query(`
    UPDATE products 
    SET stock_quantity = stock_quantity + ${addAmount} 
    WHERE item_id=${addInventory}`,
      (err, res) => {
        if (err) throw err;

        console.log(`
        Updating ${res.affectedRows} product: adding ${addAmount} items to inventory
        `)

        displayOptions();
      })

  })

}

let addNewProduct = () => {

  inquirer.prompt([
    {
      type: "input",
      name: "productName",
      message: "What is the name of the product you would like to add?"
    },
    {
      type: "input",
      name: "productDept",
      message: "What is the department of the product you are adding?"
    },
    {
      type: "number",
      name: "productPrice",
      message: "What is the price of this product?"
    },
    {
      type: "number",
      name: "productQuantity",
      message: "How many of this new product would you like to order?"
    }
  ]).then(({ productName, productDept, productPrice, productQuantity }) => {

    connection.query(`
    INSERT INTO products (product_name, department_name, price, stock_quantity)
    VALUES ('${productName}', '${productDept}', '${productPrice}', '${productQuantity}')`,
      (err, res) => {
        if (err) throw err;

        console.log(`You have added ${productName} to your store!`);

        displayOptions();
      })

  })
}


let displayOptions = () => {

  inquirer.prompt([
    {
      type: "list",
      name: "options",
      message: "what would you like to do?",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
    }
  ]).then(({ options }) => {

    switch (options) {
      case "View Products for Sale":
        console.log("viewing products...")
        viewProducts();
        break;

      case "View Low Inventory":
        console.log("viewing low inventory...")
        viewLowInventory();
        break;

      case "Add to Inventory":
        addInventory();
        break;

      case "Add New Product":
        addNewProduct();
        break;

      case "Exit":
        connection.end();
        break;

      default:
        console.log("Invalid command. Please try again.")
    }
  })
}