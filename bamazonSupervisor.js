// NPM IMPORTS
const inquirer = require("inquirer"),
  mysql = require("mysql"),
  colors = require("colors"),
  {table} = require("table");

let config,
  data,
  output;

require('dotenv').config();

// DATABASE SET UP
const connection = mysql.createConnection({
  host: process.env.DB_HOST,

  port: 3306,

  user: process.env.DB_USER,

  password: process.env.DB_PASSWORD,

  database: "bamazon"
})

connection.connect((err) => {

  if (err) throw err

  promptSupervisor();
})


let displayTable = () => {

  console.log("displaying...")

  data = [ ['department_id'.blue, 'department_name'.blue, 'overhead_costs'.blue, 'product_sales'.blue, 'total_profit'.blue] ];

  connection.query(`
  SELECT departments.department_id, departments.department_name, departments.overhead_costs, SUM(products.product_sales) AS product_sales, SUM(product_sales - departments.overhead_costs) AS total_profit
  FROM products 
  INNER JOIN departments
  ON departments.department_name = products.department_name
  GROUP BY department_id, department_name, overhead_costs
  ORDER BY department_id ASC`, 
  (err, res) => {
    if (err) throw err;

    res.forEach(({department_id, department_name, overhead_costs, product_sales}) => {
      let arr = []
      arr.push(department_id, department_name, overhead_costs, product_sales, product_sales-overhead_costs)
      data.push(arr)

    })
    output = table(data);
  
    console.log(output);

    promptSupervisor();
  })
}


let createDept = () => {

  inquirer.prompt([
    {
      type: "input",
      name: "deptName",
      message: "What is the name of the department you would like to add?"
    },
    {
      type: "number",
      name: "overhead",
      message: "What are the overhead costs of the new department?"
    }
  ]).then(({ deptName, overhead }) => {

    connection.query(`INSERT INTO departments(department_name, overhead_costs) 
    VALUES('${deptName}', '${overhead}')`, 
    (err, res) => {
      if (err) throw err;

      console.log(`You have added a new department to your store!`)

      promptSupervisor();
    })
  })

}


let promptSupervisor = () => {

  inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "what would you like to do?",
      choices: ["View Product Sales by Department", "Create New Department", "Exit"]
    }
  ]).then(({ action }) => {

    switch(action) {
      case "View Product Sales by Department":
        displayTable();
        break;

      case "Create New Department":
        createDept();
        break;
      
      default:
        connection.end();

    }

  })
}