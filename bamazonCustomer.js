var inquirer = require('inquirer');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,

    // Your username
    user: 'root',

    // Your password
    password: 'root',
    database: 'bamazon_db'
});

function checkNumber(value) {
    var integer = Number.isInteger(parseFloat(value));
    var sign = Math.sign(value);

    if (integer && (sign === 1)) {
        return true;
    } else {
        return 'Enter correct number'
    }
}

function purchaseProduct() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'itemID',
            message: 'Please enter the ID for the item to be purchased:',
            validate: checkNumber
        },
        {
            type: 'input',
            name: 'quantity',
            message: 'Please enter the amount you would like to purchase:',
            validate: checkNumber
        }

    ]).then(function (input) {
        var item = input.itemID;
        var quantity = input.quantity;
        var querySTR = 'Select * FROM products WHERE ?';

        connection.query(querySTR, { item_id: item }, function (err, data) {
            if (err) throw err;

            if (data.length === 0) {
                console.log('Invalid Item ID, please enter a valid Item ID')
                showInventory();
            } else {
                var productData = data[0];

                if (quantity <= productData.stock_quantity) {
                    console.log("Order is being placed!")
                    var updateQueryStr = 'UPDATE products SET stock_quantity =' + (productData.stock_quantity - quantity) + " WHERE item_id = " + item;
                    connection.query(updateQueryStr, function (err, data) {
                        if (err) throw err;
                        console.log('Order has been placed, total = ' + productData.price * quantity);
                        console.log('\n----------------------\n');
                        connection.end();
                    })
                } else {
                    console.log('You have requested too many items, your order was unsuccessful.')
                    console.log('Please review the quantity left in stock and reorder.')
                    console.log('\n----------------------\n');

                    showInventory();
                }
            }
        })
    })
}

function showInventory () {
    querySTR = 'SELECT * FROM products';

    connection.query(querySTR, function(err, data){
        if (err) throw err;

        console.log('Available Items: ');
        console.log('--------------------\n');

        var strDis = '';
        for (var i=0; i < data.length; i++) {
            strDis = '';
            strDis += 'Item ID: ' + data[i].item_id + ' /// ';
            strDis += 'Product Name: ' + data[i].product_name + ' /// ';
            strDis += 'Dept: ' + data[i].department_name + ' /// ';
            strDis += 'Price: ' + data[i].price + '\n';

            console.log(strDis);
        }
        console.log('---------------------------\n');
        purchaseProduct();
    })
}

function startBamazon() {
    showInventory();
}

startBamazon();