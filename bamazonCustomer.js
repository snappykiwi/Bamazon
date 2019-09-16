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

// CONNECTION TO DB
connection.connect( (err) => {
  if (err) throw err;

  console.log(`connected as id ${connection.threadId}`)

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

  connection.query("SELECT * FROM products WHERE ?",
    {
      item_id: userChoice
    },

    function (err, res) {
      if (err) throw err;
      res.forEach(({ price, stock_quantity }) => {

        console.log(`${price} | ${stock_quantity}`)

        if (stock_quantity > userAmount) {
          let stockLeft = stock_quantity - userAmount;
          console.log(`Your total is: $${parseFloat(price) * parseFloat(userAmount)}`)
          updateAmount(userChoice, stockLeft)
        }
        else {
          console.log("Insufficient Quantity!")
          displayProducts();
        }
      })
    }
  )
}

let updateAmount = (userChoice, stockLeft) => {

  connection.query("UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: stockLeft
      },
      {
        item_id: userChoice
      }
    ],
    function(err, res) {
      if (err) throw err;
      console.log(res.affectedRows)

      displayProducts();
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
  ]).then(response => {

    if (!response.confirm) {
      connection.end();
    }
    else {
      
      inquirer.prompt([
        {
          type: "list",
          name: "productChoice",
          message: "what is the id of the product you would like to purchase?",
          choices: function () {
            return res.map(r => r.item_id)
          }
        },
        {
          type: "number",
          name: "productNumber",
          message: "how many would you like to purchase?"
        }
      ]).then(response => {
    
        findProduct(response.productChoice, response.productNumber)
    
      })

    }
  })
}