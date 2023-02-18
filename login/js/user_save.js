function worker(userinfo) {
    const sqlite3 = require("sqlite3")
    const path = require("path")
    var db = new sqlite3.Database(path.join(__dirname, "py/user.db"))

    db.run("INSERt INTO user ('uname','user_name','role_id','dept_id','uuid')values(?,?,?,?,?)", [userinfo.user["uname"], userinfo.user["user_name"], userinfo.user["role_id"], userinfo.user["dept_id"], userinfo.user["uuid"]], function (err) {
        if (err) {
            console.log(err)
        }
        location.assign("../index.html")
    })
}
