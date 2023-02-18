var mysql = require("mysql")
var connection = new mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: null,
    database: 'inventory'
})

connection.connect()
var sql = "select item,location,category,unit_price,quantity,unit_measure from inventory where item='test23'"

connection.query(sql,function (errors,results,fields){
    if(errors){
        console.error(errors)
    }
    else{
        postMessage("done")
    }
})
