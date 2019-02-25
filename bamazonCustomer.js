const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "test",
    password: "password",
    database: "bamazon_db"
});

connection.connect((err) => {
    if (err) throw err;
    app();
});

const app = () => {
    displayItems();
}

const displayItems = () => {
    connection.query("SELECT * FROM products", (err, res) => {
        var userSelection;
        var userQuantity;

        if (err) throw err;
        inquirer.prompt([
            {
                type: "rawlist",
                message: "Which item do you want to buy?",
                choices: () => {
                    var itemsForSale = [];
                    for (var i = 0; i < res.length; i++) {
                        itemsForSale.push(res[i].product_name);
                    }
                    return itemsForSale;
                },
                name: "itemSelected",
            },
            {
                type: "input",
                message: "How many do you want to buy?",
                name: "itemQuantity",
            }
        ]).then((answer) => {
            for (var i = 0; i < res.length; i++) {
                if (res[i].product_name === answer.itemSelected) {
                    userSelection = res[i];
                }
            }
            userQuantity = answer.itemQuantity;

            var invAmount = userSelection.stock_quantity;
            if (invAmount > userQuantity) {
                connection.query("UPDATE products SET ? WHERE ?", [{ stock_quantity: (userSelection.stock_quantity - userQuantity) }, { product_name: userSelection.product_name }]);
                const divider = "< - - - - - - - - - - - - - - - - - - - - - - - - - - >";
                console.log(divider);
                console.log(`\nYou ordered ${userQuantity} ${userSelection.product_name}(s).\n Cost: $${userSelection.price * userQuantity}\n`);
                console.log(divider);
                displayItems();
            }
            else {
                console.error("Sorry!  Either the Item is Out of Stock or You ordered too many!");
                displayItems();
            }
        });
    });
}