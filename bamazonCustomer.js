// NPM IMPORTS
const inquirer = require("inquirer");
const mysql = require("mysql");

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
connection.connect( (err) => {
  if (err) throw err;

  displayProducts();
})


// DATABASE QUERIES
let displayProducts = () => {

  connection.query("SELECT * FROM products", 
    function (err, res) {
    if (err) throw err;

    res.forEach(({ item_id, product_name, price }) => {
      console.log(`${item_id} | ${product_name} | ${price}`)
    })

    productChoice(res);
  })
}

let findProduct = (userChoice, userAmount) => {

  // const chosenItem = results.find(r => r.item_id == userChoice)

  connection.query(`SELECT * FROM products WHERE item_id = ${userChoice}`, (err, res) => {

      if (err) throw err;
      res.forEach(({ price, stock_quantity, product_sales }) => {

        // console.log(`${price} | ${stock_quantity}`)

        if (stock_quantity > userAmount) {

          let stockLeft = parseFloat(stock_quantity) - parseFloat(userAmount);
          let totalPrice = parseFloat(price) * parseFloat(userAmount)
          product_sales += totalPrice;

          console.log(`
          Your total is: $${totalPrice}
          `)
          updateAmount(userChoice, "stock_quantity", stockLeft)
          updateAmount(userChoice, "product_sales", product_sales)

        }
        else {
          console.log("Insufficient Quantity!")

        }

        displayProducts();
      })
    }
  )
}

let updateAmount = (userChoice, columnChange, changeTo) => {

  connection.query(`UPDATE products SET ${columnChange} = ${changeTo} WHERE ?`,
    [
      {
        item_id: userChoice
      }
    ], (err, res) => {
      if (err) throw err;

    }
  )
}


// INQUIRER PROMPTS
let productChoice = (res) => {

  inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "would you like to make a purchase?"
    }
  ]).then(( {confirm} ) => {

    if (!confirm) {
      connection.end();
    }
    else {
      
      inquirer.prompt([
        {
          type: "list",
          name: "productChoice",
          message: "what is the id of the product you would like to purchase?",
          choices: () => {
            return res.map(r => r.item_id)
          }
        },
        {
          type: "number",
          name: "productNumber",
          message: "how many would you like to purchase?"
        }
      ]).then(( {productChoice, productNumber} ) => {
    
        findProduct(productChoice, productNumber)
    
      })

    }
  })
}