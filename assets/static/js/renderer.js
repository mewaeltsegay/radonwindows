const mysql = require("mysql")
const printJS = require("print-js")
const config = require(__dirname + "/config/config.js")

var element
var detail
var reportData
var baseUrl = config.url
var selected_item
var backHistory = []
var importFrom

var connection = mysql.createPool({
    connectionLimit: 100,
    host: '192.168.5.1',
    user: 'root',
    password: null,
    database: 'inventory',
    debug: false
})
/**
 * Wait for an element before resolving a promise
 * @param {String} querySelector - Selector of element to wait for
 * @param {Integer} timeout - Milliseconds to wait before timing out, or 0 for no timeout
 */
function waitForElement(querySelector, timeout=0){
    const startTime = new Date().getTime();
    return new Promise((resolve, reject)=>{
        const timer = setInterval(()=>{
            const now = new Date().getTime();
            if(document.querySelector(querySelector)){
                clearInterval(timer);
                resolve();
            }else if(timeout && now - startTime >= timeout){
                clearInterval(timer);
                reject();
            }
        }, 100);
    });
}


waitForElement("#app", 3000).then(function(){
    const settings = require("electron-settings")
    var ucwords = require('ucwords')

    settings.get('user').then(value => {
        document.querySelector("#userProfileName").innerHTML = ucwords(value.user_name)
        document.querySelector("#userProfileName").setAttribute("uuid",value.uuid)
    })
    $("#mainContent").load("views/dashboard.html")
    document.querySelector('#logout').addEventListener("click", (event) => {
        const settings = require("electron-settings")
        settings.unsetSync("user")
        location.assign("login/index.html")
        // retrieveLogs()
    })
    console.log(permissions)
    if($.inArray('view_items',permissions) !== -1){
        document.querySelector('#inventory').addEventListener("click",(event) => {
            $("#mainContent").load("views/items.html")
            // retrieveInventory()
        })
    }
    else {
        $('#inventory').prop('hidden',true)
    }

    // document.querySelector('#add_new').addEventListener("click",(event) => {
    //     $("#mainContent").load("views/add_item.html")
    //     // retrieveInventory()
    // })
    if($.inArray('add_transaction',permissions) !== -1) {
        document.querySelector('#stockIn').addEventListener("click", (event) => {
            $("#mainContent").load("views/stock_in.html")
        })
        document.querySelector('#stockOut').addEventListener("click", (event) => {
            $("#mainContent").load("views/stock_out.html")
        })
        document.querySelector('#stockMove').addEventListener("click", (event) => {
            $("#mainContent").load("views/stock_move.html")
        })
        document.querySelector('#stockLoan').addEventListener("click", (event) => {
            $("#mainContent").load("views/stock_loans.html")
        })
    }
    else{
        $('#stockIn,#stockOut,#stockMove').prop('hidden',true)
    }
    if($.inArray('audit_items',permissions) !== -1) {
        document.querySelector('#stockAudit').addEventListener("click", (event) => {
            $("#mainContent").load("views/stock_audit.html")
        })
    }
    else{
        $('#stockAudit').prop('hidden',true)
    }
    if($.inArray('view_fixed',permissions) !== -1) {
        document.querySelector('#fixed_asset').addEventListener("click", (event) => {
            backHistory.push('dashboard')
            $("#mainContent").load("views/fixedasset.html")
        })
    }
    else{
        $('#fixed_asset').prop('hidden',true)
    }
    if($.inArray('view_damaged',permissions) !== -1) {
        document.querySelector('#damaged').addEventListener("click", (event) => {
            backHistory.push('dashboard')
            $("#mainContent").load("views/damaged.html")
        })
    }
    else{
        $('#damaged').prop('hidden',true)
    }
    if($.inArray('view_employees',permissions) !== -1) {
        document.querySelector('#employees').addEventListener("click", (event) => {
            backHistory.push('dashboard')
            $("#mainContent").load("views/employees.html")
        })
    }
    else{
        $('#employees').prop('hidden',true)
    }
    document.querySelector('#dash').addEventListener("click",(event) => {
        backHistory.push('dashboard')
        $("#mainContent").load("views/dashboard.html")
    })
    if($.inArray('create_reports',permissions) !== -1) {
        document.querySelector('#reports').addEventListener("click", (event) => {
            backHistory.push('dashboard')
            $("#mainContent").load("views/report.html")
        })
    }
    else{
        $('#reports').prop('hidden',true)
    }
    if($.inArray('create_user',permissions) !== -1) {
        document.querySelector('#users').addEventListener("click", (event) => {
            backHistory.push('dashboard')
            handleAdditional("users")
        })
        document.querySelector('#roles').addEventListener("click",(event) => {
            backHistory.push('dashboard')
            handleAdditional("roles")
        })
    }
    else{
        $('#users,#roles').prop('hidden',true)
    }
    document.querySelector('#categories').addEventListener("click",(event) => {
        backHistory.push('dashboard')
        handleAdditional("categories")
    })
    document.querySelector('#locations').addEventListener("click",(event) => {
        backHistory.push('dashboard')
        handleAdditional("locations")
    })
    document.querySelector('#departments').addEventListener("click",(event) => {
        backHistory.push('dashboard')
        handleAdditional("departments")
    })
    document.querySelector('#units').addEventListener("click",(event) => {
        backHistory.push('dashboard')
        handleAdditional("units")
    })
}).catch(()=>{
    console.log("element did not load in 3 seconds");
});

function setDamaged(send,element){
    var success
    if(confirm("Are you sure you want to set this item as damaged?")){
        $.post(baseUrl + "/app/damaged.php",send,"json").done(function( data ) {
            var jsonn = JSON.parse(data)
            success = jsonn.success
            }).then(() => {
                if(success == "true"){
                    var table = $("#detailsDataTable").DataTable()
                    table.row(element).remove().draw(false)
                }
            })
    }
    else{
        document.querySelector("#"+send.uuid).checked = false
    }
}

function setDamagedTransaction(send,element){
    var success
    if(confirm("Are you sure you want to set this item as damaged?")){
        $.post(baseUrl + "/app/update.php",send,"json").done(function( data ) {
            var jsonn = JSON.parse(data)
            success = jsonn.success
        }).then(() => {
            if(success == "true"){
                var table = $("#transactionsTable").DataTable()
                table.row(element).remove().draw(false)
            }
        })
    }
    else{
        document.querySelector("#"+send.id).checked = false
    }
}

function handleAdditional(item) {
    const ucwords = require("ucwords")
    $("#mainContent").load("views/additional.html")

    waitForElement("#additionalTitle",3000).then(function(){
        document.querySelector("#additionalTitle").innerText = ucwords(item)
        document.querySelector("#additionalTitle").setAttribute("val",item)
    })

}

function populateItemModal(data){
    const btn = document.querySelector('#itemModal')
    const options = {
        attributes: true
    }

    const observer = new MutationObserver(function(mutationList, observer) {
        mutationList.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                // handle class change
                if(mutation.target.className === "modal fade show"){
                    $("#qty").html(data[4])
                    $("#item_id").html(data[0])
                    $("#item").val(data[0]).addClass("is-valid")
                    $("#unit_price").val(data[3].substr(1,data[3].length - 4)).addClass('is-valid')
                    $("#type option").filter(function () { return $(this).html() === "Inventory"; }).attr('selected','selected')
                    $("#type").addClass('is-valid')
                    $("#location option").filter(function () { return $(this).html() === data[1]; }).attr('selected','selected')
                    $("#location").addClass('is-valid')
                    $("#category option").filter(function () { return $(this).html() === data[2]; }).attr('selected','selected')
                    $("#category").addClass('is-valid')
                    $("#unit_measure option").filter(function () { return $(this).html() === data[5]; }).attr('selected','selected')
                    $("#unit_measure").addClass('is-valid')
                }
            }
        })
    })
    observer.observe(btn, options)

    $("#modalBody").load("views/modalBody/items.html")
}

function populateDetailsModal(data){
    const btn = document.querySelector('#itemModal')
    const options = {
        attributes: true
    }

    const observer = new MutationObserver(function(mutationList, observer) {
        mutationList.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                // handle class change
                if(mutation.target.className === "modal fade show"){
                    if(detail.type == "fixed asset") {
                        $("#qty").html(data[8])
                        $("#item_id").html(data[12])
                        $("#item").val(data[1]).addClass("is-valid")
                        $("#manufacturer").val(data[4]).addClass("is-valid")
                        $("#model").val(data[5]).addClass("is-valid")
                        $("#serial_no").val(data[6]).addClass("is-valid")
                        $("#unit_price").val(data[7].substr(1, data[7].length - 4)).addClass('is-valid')
                        $("#type option").filter(function () {
                            return $(this).html() === "Fixed Asset";
                        }).attr('selected', 'selected')
                        $("#type").addClass('is-valid')
                        $("#location option").filter(function () {
                            return $(this).html() === data[2];
                        }).attr('selected', 'selected')
                        $("#location").addClass('is-valid')
                        $("#category option").filter(function () {
                            return $(this).html() === data[3];
                        }).attr('selected', 'selected')
                        $("#category").addClass('is-valid')
                        $("#unit_measure option").filter(function () {
                            return $(this).html() === data[9];
                        }).attr('selected', 'selected')
                        $("#unit_measure").addClass('is-valid')
                        $("#rowAssignedTo").removeAttr("hidden")
                        $("#assigned_to").removeAttr("disabled")
                        $("#assigned_to option").filter(function () {
                            return $(this).html() === data[11];
                        }).attr('selected', 'selected')
                        $("#assigned_to").addClass('is-valid')
                        if (data[0] != 0) {
                            $("#icon").attr("hidden", "hidden")
                            $("#pic").removeAttr("hidden").attr("src", baseUrl + "/items/images/" + data[0] + ".jpg")
                            $("#picture").val(data[0])
                        }
                    }
                    else{
                        $("#qty").html(data[8])
                        $("#item_id").html(data[11])
                        $("#item").val(data[1]).addClass("is-valid")
                        $("#manufacturer").val(data[4]).addClass("is-valid")
                        $("#model").val(data[5]).addClass("is-valid")
                        $("#serial_no").val(data[6]).addClass("is-valid")
                        $("#unit_price").val(data[7].substr(1, data[7].length - 4)).addClass('is-valid')
                        $("#type option").filter(function () {
                            return $(this).html() === "Inventory";
                        }).attr('selected', 'selected')
                        $("#type").addClass('is-valid')
                        $("#location option").filter(function () {
                            return $(this).html() === data[2];
                        }).attr('selected', 'selected')
                        $("#location").addClass('is-valid')
                        $("#category option").filter(function () {
                            return $(this).html() === data[3];
                        }).attr('selected', 'selected')
                        $("#category").addClass('is-valid')
                        $("#unit_measure option").filter(function () {
                            return $(this).html() === data[9];
                        }).attr('selected', 'selected')
                        $("#unit_measure").addClass('is-valid')
                        if (data[0] != 0) {
                            $("#icon").attr("hidden", "hidden")
                            $("#pic").removeAttr("hidden").attr("src", baseUrl + "/items/images/" + data[0] + ".jpg")
                            $("#picture").val(data[0])
                        }
                    }
                }
            }
        })
    })
    observer.observe(btn, options)

    $("#modalBody").load("views/modalBody/details.html")
}

function populateEmployeeModal(data){
    const btn = document.querySelector('#employeeModal')
    const options = {
        attributes: true
    }

    const observer = new MutationObserver(function(mutationList, observer) {
        mutationList.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                // handle class change
                if(mutation.target.className === "modal fade show"){
                    $("#modal_id").html(data[7])
                    var name = data[1].split(" ")
                    $("#modal_first_name").val(name[0]).addClass("is-valid")
                    $("#modal_last_name").val(name[1]).addClass("is-valid")
                    $("#modal_mobile_phone").val(data[3]).addClass("is-valid")
                    $("#modal_address").val(data[4]).addClass("is-valid")
                    $("#modal_city").val(data[5]).addClass("is-valid")
                    $("#modal_zoba").val(data[6]).addClass("is-valid")
                    $("#modal_dept option").filter(function () {
                        return $(this).html() === data[2];
                    }).attr('selected', 'selected')
                    $("#modal_dept").addClass('is-valid')
                }
            }
        })
    })
    observer.observe(btn, options)

    $("#modalBody").load("views/modalBody/employees.html")
}

function populateAdditionalModal(title,data){
    const btn = document.querySelector('#additionalModal')
    const options = {
        attributes: true
    }

    const observer = new MutationObserver(function(mutationList, observer) {
        mutationList.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                // handle class change
                if(mutation.target.className === "modal fade show"){
                    if(title === "Categories"){
                        document.querySelector("#modal_id").innerText = data[1]
                        $("#modal_category").val(data[0]).addClass("is-valid")
                    }
                    else if(title === "Locations"){
                        document.querySelector("#modal_id").innerText = data[2]
                        $("#modal_loc_name").val(data[0]).addClass("is-valid")
                        $("#modal_description").val(data[1])
                    }
                    else if(title === "Departments"){
                        document.querySelector("#modal_id").innerText = data[2]
                        $("#modal_dept_name").val(data[0]).addClass("is-valid")
                        $("#modal_description").val(data[1])
                    }
                    else if(title === "Units"){
                        document.querySelector("#modal_id").innerText = data[3]
                        $("#modal_unit_name").val(data[0]).addClass("is-valid")
                        $("#modal_unit_type option").filter(function () { return $(this).html() === data[1]; }).attr('selected','selected')
                        $("#modal_unit_type").addClass("is-valid")
                        $("#modal_description").val(data[2])
                    }
                    else if(title === "Users"){
                        document.querySelector("#modal_id").innerText = data[4]
                        var name = data[0].split(" ")
                        $("#modal_first_name").val(name[0]).addClass("is-valid")
                        $("#modal_last_name").val(name[1]).addClass("is-valid")
                        $("#modal_user_name").val(data[1]).addClass("is-valid")
                        $("#modal_dept option").filter(function () { return $(this).html() === data[2]; }).attr('selected','selected')
                        $("#modal_dept").addClass("is-valid")
                        $("#modal_role option").filter(function () { return $(this).html() === data[3]; }).attr('selected','selected')
                        $("#modal_role").addClass("is-valid")
                    }
                    else if(title === "Roles"){
                        var ucwords = require("ucwords")
                        document.querySelector("#modal_id").innerText = data[2]
                        $("#modal_role_name").val(data[0]).addClass("is-valid")
                        var perms = ucwords(data[1]).split(',')
                        $("#modalpermissions input:checkbox").each(function(){
                            $(this).prop("checked",false)
                        })
                        $("#modalpermissions label").each(function(){
                            if($.inArray($(this).html(),perms) !== -1)
                                $("#"+$(this).attr("for")).prop("checked",true)
                        });
                    }
                }
            }
        })
    })
    observer.observe(btn, options)

    if(title === "Roles"){
        $("#modalBody").load("views/modalBody/roles.html")
    }
    else if (title === "Categories"){
        $("#modalBody").load("views/modalBody/categories.html")
    }
    else if (title === "Locations"){
        $("#modalBody").load("views/modalBody/locations.html")
    }
    else if (title === "Departments"){
        $("#modalBody").load("views/modalBody/departments.html")
    }
    else if (title === "Units"){
        $("#modalBody").load("views/modalBody/units.html")
    }
    else if (title === "Users"){
        $("#modalBody").load("views/modalBody/users.html")
    }
}


function populateAdditional(){
    const ucwords = require("ucwords")
    var rows = []
    var row = []
    var columns
    waitForElement("#additionalTitle",3000).then(function(){
        $("#additionalForm").load("views/"+document.querySelector("#additionalTitle").getAttribute('val')+"Form.html")
        $.post(baseUrl + "/app/get.php",{table:document.querySelector("#additionalTitle").getAttribute('val')},"json").done(function( data ) {
            var jsonn = JSON.parse(data)
            columns = jsonn.columns
            rows = jsonn.rows
            $("#additionalHeaders").empty()
            for (var i = 0; i <= columns.length - 1; i++) {
                $("#additionalHeaders").append("<th>"+ucwords(columns[i])+"</th>")
            }
            var table
            new Promise((resolve,reject)=>{
                var int = setInterval( ()=> {
                    if (document.querySelector("#additionalHeaders").children.length > 0) {
                        table = $("#additionalDataTable").DataTable({
                            "iDisplayLength" : 50,
                            "aaSorting": [],
                            "columnDefs":[{
                                "targets": -1,
                                "width": "6%",
                            }]
                        })
                        clearInterval(int)
                        resolve()
                    } else {
                        reject()
                    }
                },200)
            }).then(() => {
                for (var i = 0; i <= rows.length - 1; i++) {
                    var tmp = []
                    tmp = Object.values(rows[i])
                    table.row.add(tmp)
                }
                table.draw()
            }).then(()=>{
                if($('#additionalTitle').attr('val') == "users"){
                    if($.inArray('edit_user',permissions) === -1){
                        $('.edit').prop('disabled',true)
                    }
                    if($.inArray('delete_user',permissions) === -1){
                        $('.delete').prop('disabled',true)
                    }
                }
            })
        })
    })
}

function setCopyright(){
    var moment = require("moment")
    var date = new Date()
    var year = moment(date).format("YYYY")
    document.getElementById("footer").innerHTML = "<span>Copyright © 2019 - " + year + "  Mewael Tsegay. All rights reserved.</span>"
}

function retrieveInventory(){
    var table = $("#dataTable").DataTable({
        "order": [[ 1, "desc" ]], //or asc
        "columnDefs" : [{"targets":1, "type":"date-eu"}],
    })
    connection.connect()
    var sql = "select item,location,category,unit_price,quantity,unit_measure from inventory"

    connection.query(sql,function (error,results,fields){
        if(error){
            console.log(error)
        }
        else{
            var row = []
            for (result in results){
                row.push(result.item)
                row.push(result.location)
                row.push(result.category)
                row.push(result.unit_price)
                row.push(result.quantity)
                row.push(result.unit_measure)
                table.row.add(row)
            }

            table.draw()
            console.log(results[0])
        }
    })

    connection.end()
}
function preview(input) {
    if(input.files && input.files[0]){
        var reader = new FileReader();

        reader.onload = function (e){
            $('#pic').attr('hidden',false);
            $('#pic').attr('src',e.target.result);
            $('#icon').attr('hidden',true);
        }

        reader.readAsDataURL(input.files[0]);
    }

}

function retrieveTransactions(){
    var moment = require("moment")
    var ucwords = require("ucwords")
    var table = $("#transactionsTable").DataTable()
    var sql = "select `inventory transactions`.id,concat(employees.first_name,' ',employees.last_name) as name, inventory.item, `inventory transactions`.details,`inventory transactions`.quantity,unit.unit_name,`transaction types`.description,`inventory transactions`.creation_date,`inventory transactions`.`comment` from `inventory transactions` join inventory on transaction_item=inventory.id join employees on employee=employees.id join `transaction types` on transaction_type=`transaction types`.id join unit on inventory.unit_measure = unit.id where `inventory transactions`.returned='' order by name"

    connection.query(sql, (error,results) => {
        if(error)
            console.error(error)
        else{
            for (var i = 0;i <= results.length - 1 ; i++) {
                var arr = []
                arr.push(ucwords(results[i].name))
                arr.push(ucwords(results[i].item))
                arr.push(results[i].details)
                arr.push(results[i].quantity)
                arr.push(ucwords(results[i].unit_name))
                arr.push(ucwords(results[i].description))
                var created = new Date(results[i].creation_date)
                arr.push(moment(created).format("DD/MM/YYYY"))
                arr.push(results[i].comment)
                arr.push('<input class="form-check-input damaged" type="checkbox" id="'+ results[i].id+'">')
                results[i].description === "Consume"? arr.push('<div></div><button id="' + results[i].id +'" class="btn btn-outline-danger bg-transparent pt-1 pb-1 pr-2 pl-2 m-auto text-danger consume" data-toggle="tooltip" data-placement="bottom" title="Consumed"><i class="fas fa-burn font-weight-bold"></i></button><button id="' + results[i].id +'" class="btn btn-outline-success bg-transparent pt-1 pb-1 pr-2 pl-2 ml-1 text-success return" data-toggle="tooltip" data-placement="bottom" title="Returned"><i class="fas fa-arrow-left font-weight-bold"></i></button></div>'): arr.push('<button id="' + results[i].id +'" class="btn btn-outline-success bg-transparent pt-1 pb-1 pr-2 pl-2 ml-1 text-success return" data-toggle="tooltip" data-placement="bottom" title="Returned"><i class="fas fa-arrow-left font-weight-bold"></i></button>')

                table.row.add(arr)
            }
            table.draw(false)
        }
    })
}
function saveRole(event){
    event.preventDefault()
    if(checkRolesFormValidity() == false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else {
        var table = $("#additionalDataTable").DataTable()
        var role_name = document.querySelector("#role_name").value
        var description = document.querySelector("#description").value
        var permissions = $(':checkbox:checked').map(function(){
            return this.id
        }).get()
        var send = {
            table: "roles",
            columns: ['name','description','created_by'].toString(),
            row: [role_name,description,document.querySelector("#userProfileName").getAttribute('uuid')],
            permissions: permissions
        }

        $.post(baseUrl + '/app/save.php',send,"json").done((data) => {
            var response = JSON.parse(data)
            if(response.success === "true"){
                $('#ok').attr("data-type", "success").attr("data-message", "Successfully added category.").attr("data-title", "Success! ").click()
                document.querySelector("#needs-validation").reset()
                $("#needs-validation").find('input,select').removeClass('is-valid is-invalid')
                table.row.add(response.data).draw(false)
            }
            else{
                $('#ok').attr("data-type", "danger").attr("data-message", response.message).attr("data-title", "Failure! ").click()
                document.querySelector("#needs-validation").reset()
                $("#needs-validation").find('input,select').removeClass('is-valid is-invalid')
            }
        })
    }
}

function updateRole(event){
    event.preventDefault()
    if(checkRolesModalFormValidity() === false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else {

        var table = $("#additionalDataTable").DataTable()
        var id = document.querySelector("#modal_id").innerText
        var role  = $("#modal_role_name").val()
        var permissions = $(':checkbox:checked').map(function(){
            var ids = (this.id).split("_")
            return ids[1]
        }).get()
        var permissions_name = $(':checkbox:checked').map(function(){
            return $("[for="+this.id+"]").html()
        }).get()
        var created_by = document.querySelector("#userProfileName").getAttribute('uuid')

        var send = {
            table: "roles",
            id: id,
            fields: {
                name: role,
                created_by: created_by
            },
            permissions: permissions
        }
        var row = [role,permissions_name.toString(),"<button class='btn cur-p bg-transparent border-0 edit m-0 p-2' data='"+id+"' data-toggle='modal' data-target='#additionalModal'><i class='fas fa-edit text-primary'></i></button><button class='btn cur-p bg-transparent border-0 delete m-0 p-2' data='"+id+"'><i class='fas fa-trash text-danger'></i></button>"]

        $.post(baseUrl + '/app/update.php',send,"json").done((data) => {
            var response = JSON.parse(data)
            if(response.success === "true"){
                $('#additionalModal').trigger('click')
                $('#ok').attr("data-type", "success").attr("data-message", "Successfully edited category.").attr("data-title", "Success! ").click()
                table.row(element).data(row).draw(false)
            }
            else{
                $('#additionalModal').trigger('click')
                $('#ok').attr("data-type", "danger").attr("data-message", "Please try again.").attr("data-title", "Failure! ").click()
            }
        })


    }
}

function saveCategory(event){
    event.preventDefault()
    if(checkFormValidity() == false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else {
        var table = $("#additionalDataTable").DataTable()
        var cat_name = document.querySelector("#cat_name").value
        var send = {
            table: "category",
            columns: ['category_name','created_by'].toString(),
            row: [cat_name,document.querySelector("#userProfileName").getAttribute('uuid')]
        }

        $.post(baseUrl + '/app/save.php',send,"json").done((data) => {
            var response = JSON.parse(data)
            if(response.success === "true"){
                $('#ok').attr("data-type", "success").attr("data-message", "Successfully added category.").attr("data-title", "Success! ").click()
                document.querySelector("#needs-validation").reset()
                $("#needs-validation").find('input,select').removeClass('is-valid is-invalid')
                table.row.add(response.data).draw(false)
            }
            else{
                $('#ok').attr("data-type", "danger").attr("data-message", "Please try again.").attr("data-title", "Failure! ").click()
                document.querySelector("#needs-validation").reset()
                $("#needs-validation").find('input,select').removeClass('is-valid is-invalid')
            }
        })
    }
}

function updateCategory(event){
    event.preventDefault()
    if(checkModalFormValidity() === false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else {
        var table = $("#additionalDataTable").DataTable()
        var id = document.querySelector("#modal_id").innerText
        var cat  = $("#modal_category").val()
        var created_by = document.querySelector("#userProfileName").getAttribute('uuid')

        var send = {
            table: "category",
            id: id,
            fields: {
                category_name: cat,
                created_by: created_by
            }
        }
        var row = [cat,"<button class='btn cur-p bg-transparent border-0 edit m-0 p-2' data='"+id+"' data-toggle='modal' data-target='#additionalModal'><i class='fas fa-edit text-primary'></i></button><button class='btn cur-p bg-transparent border-0 delete m-0 p-2' data='"+id+"'><i class='fas fa-trash text-danger'></i></button>"]

        $.post(baseUrl + '/app/update.php',send,"json").done((data) => {
            var response = JSON.parse(data)
            if(response.success === "true"){
                $('#additionalModal').trigger('click')
                $('#ok').attr("data-type", "success").attr("data-message", "Successfully edited category.").attr("data-title", "Success! ").click()
                table.row(element).data(row).draw(false)
            }
            else{
                $('#additionalModal').trigger('click')
                $('#ok').attr("data-type", "danger").attr("data-message", "Please try again.").attr("data-title", "Failure! ").click()
            }
        })

    }
}
function saveLocation(event){
    event.preventDefault()
    if(checkFormValidity() == false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else {
        var table = $("#additionalDataTable").DataTable()
        var loc_name = document.querySelector("#loc_name").value
        var description = document.querySelector("#description").value
        var send = {
            table: "location",
            columns: ['location_name','description','created_by'].toString(),
            row: [loc_name,description,document.querySelector("#userProfileName").getAttribute('uuid')]
        }

        $.post(baseUrl + '/app/save.php',send,"json").done((data) => {
            var response = JSON.parse(data)
            if(response.success === "true"){
                $('#ok').attr("data-type", "success").attr("data-message", "Successfully added location.").attr("data-title", "Success! ").click()
                document.querySelector("#needs-validation").reset()
                $("#needs-validation").find('input,select').removeClass('is-valid is-invalid')
                table.row.add(response.data).draw(false)
            }
            else{
                $('#ok').attr("data-type", "danger").attr("data-message", "Please try again.").attr("data-title", "Failure! ").click()
                document.querySelector("#needs-validation").reset()
                $("#needs-validation").find('input,select').removeClass('is-valid is-invalid')
            }
        })
    }
}

function updateLocation(event){
    event.preventDefault()
    if(checkModalFormValidity() === false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else {
        var table = $("#additionalDataTable").DataTable()
        var id = document.querySelector("#modal_id").innerText
        var loc  = $("#modal_loc_name").val()
        var desc = $("#modal_description").val()
        var created_by = document.querySelector("#userProfileName").getAttribute('uuid')

        var send = {
            table: "location",
            id: id,
            fields: {
                location_name: loc,
                description: desc,
                created_by: created_by
            }
        }
        var row = [loc,desc,"<button class='btn cur-p bg-transparent border-0 edit m-0 p-2' data='"+id+"' data-toggle='modal' data-target='#additionalModal'><i class='fas fa-edit text-primary'></i></button><button class='btn cur-p bg-transparent border-0 delete m-0 p-2' data='"+id+"'><i class='fas fa-trash text-danger'></i></button>"]

        $.post(baseUrl + '/app/update.php',send,"json").done((data) => {
            var response = JSON.parse(data)
            if(response.success === "true"){
                $('#additionalModal').trigger('click')
                $('#ok').attr("data-type", "success").attr("data-message", "Successfully edited location.").attr("data-title", "Success! ").click()
                table.row(element).data(row).draw(false)
            }
            else{
                $('#additionalModal').trigger('click')
                $('#ok').attr("data-type", "danger").attr("data-message", "Please try again.").attr("data-title", "Failure! ").click()
            }
        })

    }
}
function saveDepartment(event){
    event.preventDefault()
    if(checkFormValidity() == false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else {
        var table = $("#additionalDataTable").DataTable()
        var dept_name = document.querySelector("#dept_name").value
        var description = document.querySelector("#description").value
        var send = {
            table: "departments",
            columns: ['name','description','created_by'].toString(),
            row: [dept_name,description,document.querySelector("#userProfileName").getAttribute('uuid')]
        }

        $.post(baseUrl + '/app/save.php',send,"json").done((data) => {
            var response = JSON.parse(data)
            if(response.success === "true"){
                $('#ok').attr("data-type", "success").attr("data-message", "Successfully added department.").attr("data-title", "Success! ").click()
                document.querySelector("#needs-validation").reset()
                $("#needs-validation").find('input,select').removeClass('is-valid is-invalid')
                table.row.add(response.data).draw(false)
            }
            else{
                $('#ok').attr("data-type", "danger").attr("data-message", "Please try again.").attr("data-title", "Failure! ").click()
                document.querySelector("#needs-validation").reset()
                $("#needs-validation").find('input,select').removeClass('is-valid is-invalid')
            }
        })
    }
}

function updateDepartment(event){
    event.preventDefault()
    if(checkModalFormValidity() === false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else {
        var table = $("#additionalDataTable").DataTable()
        var id = document.querySelector("#modal_id").innerText
        var dept  = $("#modal_dept_name").val()
        var desc = $("#modal_description").val()
        var created_by = document.querySelector("#userProfileName").getAttribute('uuid')

        var send = {
            table: "departments",
            id: id,
            fields: {
                name: dept,
                description: desc,
                created_by: created_by
            }
        }
        var row = [dept,desc,"<button class='btn cur-p bg-transparent border-0 edit m-0 p-2' data='"+id+"' data-toggle='modal' data-target='#additionalModal'><i class='fas fa-edit text-primary'></i></button><button class='btn cur-p bg-transparent border-0 delete m-0 p-2' data='"+id+"'><i class='fas fa-trash text-danger'></i></button>"]

        $.post(baseUrl + '/app/update.php',send,"json").done((data) => {
            var response = JSON.parse(data)
            if(response.success === "true"){
                $('#additionalModal').trigger('click')
                $('#ok').attr("data-type", "success").attr("data-message", "Successfully edited department.").attr("data-title", "Success! ").click()
                table.row(element).data(row).draw(false)
            }
            else{
                $('#additionalModal').trigger('click')
                $('#ok').attr("data-type", "danger").attr("data-message", "Please try again.").attr("data-title", "Failure! ").click()
            }
        })

    }
}

function saveUnit(event){
    event.preventDefault()
    if(checkFormValidity() == false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else {
        var table = $("#additionalDataTable").DataTable()
        var unit_name = document.querySelector("#unit_name").value
        var unit_type = document.querySelector("#unit_type").value
        var description = document.querySelector("#description").value
        var send = {
            table: "unit",
            columns: ['unit_name','unit_type','description','created_by'].toString(),
            row: [unit_name,unit_type,description,document.querySelector("#userProfileName").getAttribute('uuid')]
        }

        $.post(baseUrl + '/app/save.php',send,"json").done((data) => {
            var response = JSON.parse(data)
            if(response.success === "true"){
                $('#ok').attr("data-type", "success").attr("data-message", "Successfully added unit.").attr("data-title", "Success! ").click()
                document.querySelector("#needs-validation").reset()
                $("#needs-validation").find('input,select').removeClass('is-valid is-invalid')
                table.row.add(response.data).draw(false)
            }
            else{
                $('#ok').attr("data-type", "danger").attr("data-message", "Please try again.").attr("data-title", "Failure! ").click()
                document.querySelector("#needs-validation").reset()
                $("#needs-validation").find('input,select').removeClass('is-valid is-invalid')
            }
        })
    }
}

function updateUnit(event){
    event.preventDefault()
    if(checkModalFormValidity() === false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else {
        var table = $("#additionalDataTable").DataTable()
        var id = document.querySelector("#modal_id").innerText
        var unit  = $("#modal_unit_name").val()
        var type = $("#modal_unit_type").val()
        var desc = $("#modal_description").val()
        var created_by = document.querySelector("#userProfileName").getAttribute('uuid')

        var send = {
            table: "unit",
            id: id,
            fields: {
                unit_name: unit,
                unit_type: type,
                description: desc,
                created_by: created_by
            }
        }
        var row = [unit,type,desc,"<button class='btn cur-p bg-transparent border-0 edit m-0 p-2' data='"+id+"' data-toggle='modal' data-target='#additionalModal'><i class='fas fa-edit text-primary'></i></button><button class='btn cur-p bg-transparent border-0 delete m-0 p-2' data='"+id+"'><i class='fas fa-trash text-danger'></i></button>"]

        $.post(baseUrl + '/app/update.php',send,"json").done((data) => {
            var response = JSON.parse(data)
            if(response.success === "true"){
                $('#additionalModal').trigger('click')
                $('#ok').attr("data-type", "success").attr("data-message", "Successfully edited unit.").attr("data-title", "Success! ").click()
                table.row(element).data(row).draw(false)
            }
            else{
                $('#additionalModal').trigger('click')
                $('#ok').attr("data-type", "danger").attr("data-message", "Please try again.").attr("data-title", "Failure! ").click()
            }
        })

    }
}

function saveUser(event){
    event.preventDefault()
    if(checkFormValidity() == false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else{
        var table = $("#additionalDataTable").DataTable()
        var fname = document.querySelector('#first_name').value
        var lname = document.querySelector('#last_name').value
        var uname = document.querySelector('#user_name').value
        var password = document.querySelector('#password').value
        var dept = document.querySelector('#dept').value
        var role = document.querySelector('#role').value
        var send = {
            fname: fname,
            lname: lname,
            uname: uname,
            password: password,
            dept: dept,
            role: role,
            created_by: document.querySelector("#userProfileName").getAttribute('uuid')
        }

        $.post(baseUrl + "/app/createUser.php",send,"json").done(function(data) {
                $('#ok').attr("data-type", "success").attr("data-message", "Successfully created user.").attr("data-title", "Success! ").click()
                document.querySelector("#needs-validation").reset()
                $("#needs-validation").find('input,select').removeClass('is-valid is-invalid')
                table.row.add(Object.values(JSON.parse(data))).draw(false)
            })
    }
}

function updateUser(event){
    event.preventDefault()
    if(checkModalFormValidity() === false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else {
        const ucwords = require("ucwords")
        var table = $("#additionalDataTable").DataTable()
        var id = document.querySelector("#modal_id").innerText
        var uname  = $("#modal_user_name").val()
        var user_name = ucwords($("#modal_first_name").val()+ " "+$("#modal_last_name").val())
        var dept_id = $("#modal_dept").find(":selected").attr('id')
        var role_id = $("#modal_role").find(":selected").attr('id')
        var created_by = document.querySelector("#userProfileName").getAttribute('uuid')

        var send = {
            table: "users",
            id: id,
            fields: {
                uname: uname,
                user_name: user_name,
                role_id: role_id,
                dept_id: dept_id,
                created_by: created_by
            }
        }

        $.post(baseUrl + '/app/update.php',send,"json").done((data) => {
            var response = JSON.parse(data)
            if(response.success === "true"){
                $('#additionalModal').trigger('click')
                $('#ok').attr("data-type", "success").attr("data-message", "Successfully edited category.").attr("data-title", "Success! ").click()
                table.row(element).data(response.data).draw(false)
            }
            else{
                $('#additionalModal').trigger('click')
                $('#ok').attr("data-type", "danger").attr("data-message", "Please try again.").attr("data-title", "Failure! ").click()
            }
        })

    }
}

function updateEmployee(event){
    event.preventDefault()
    if(checkModalFormValidity() === false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else {
        const ucwords = require("ucwords")
        var table = $("#employeesDataTable").DataTable()
        var id = document.querySelector("#modal_id").innerText
        var first_name  = $("#modal_first_name").val()
        var last_name  = $("#modal_last_name").val()
        var dept_id = $("#modal_dept").find(":selected").attr('id')
        var mobile_phone  = $("#modal_mobile_phone").val()
        var address  = $("#modal_address").val()
        var city  = $("#modal_city").val()
        var zoba  = $("#modal_zoba").val()
        var created_by = document.querySelector("#userProfileName").getAttribute('uuid')

        var send = {
            table: "employees",
            id: id,
            fields: {
                first_name: first_name,
                last_name: last_name,
                department: dept_id,
                mobile_phone: mobile_phone,
                address: address,
                city: city,
                zoba: zoba,
                created_by: created_by
            }
        }

        image = "<div class=\"img-center text-center border rounded\" style=\"width: 40pt;height: 40pt\"> <i class=\"fas fa-camera pt-3 text-primary\" style=\"font-size: 16pt\"></i></div>"

        var row = [image,first_name+" "+last_name,$("#modal_dept").val(),mobile_phone,address,city,zoba,"<button type=\"button\" class=\"btn cur-p bg-transparent border-0 edit-employee m-0 p-2\" id='"+id+"' data-toggle='modal' data-target='#employeeModal'><i class='fas fa-edit text-primary'></i></button><button type=\"button\" class=\"btn cur-p border-0 bg-transparent p-2 m-0 delete-employee\" id='"+id+"'><i class='fas fa-trash-alt text-danger'></i></button>"]

        $.post(baseUrl + '/app/update.php',send,"json").done((data) => {
            var response = JSON.parse(data)
            if(response.success === "true"){
                $('#employeeModal').trigger('click')
                $('#ok').attr("data-type", "success").attr("data-message", "Successfully edited employee.").attr("data-title", "Success! ").click()
                table.row(element).data(row).draw(false)
            }
            else{
                $('#employeeModal').trigger('click')
                $('#ok').attr("data-type", "danger").attr("data-message", "Please try again.").attr("data-title", "Failure! ").click()
            }
        })
    }
}

function updatePassword(event){
    event.preventDefault()
    if(checkModalFormPasswordValidity() === false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else {
        var id = document.querySelector("#modal_id").innerText
        var password  = $("#modal_password").val()

        var send = {
            password: password,
            id: id
        }

        $.post(baseUrl + '/app/resetPassword.php',send,"json").done((data) => {
            var response = JSON.parse(data)
            if(response.success === "true"){
                $('#additionalModal').trigger('click')
                $('#ok').attr("data-type", "success").attr("data-message", "Successfully edited category.").attr("data-title", "Success! ").click()
            }
            else{
                $('#additionalModal').trigger('click')
                $('#ok').attr("data-type", "danger").attr("data-message", "Please try again.").attr("data-title", "Failure! ").click()
            }
        })

    }
}

function updateItemDetails(event){
    event.preventDefault()
    if(checkFormValidity() === false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else {
        var item  = $("#item").val()
        var category  = $("#category").find(":selected").attr('id')
        var location  = $("#location").find(":selected").attr('id')
        var unit_measure  = $("#unit_measure").find(":selected").attr('id')
        var type  = $("#type").val()
        var manufacturer  = $("#manufacturer").val()
        var model  = $("#model").val()
        var serial_no  = $("#serial_no").val()
        var picture = $("#picture").val()
        var unit_price = $("#unit_price").val()
        var id = $("#item_id").html()
        var qty = $("#qty").html()

        var send

        if($("#rowAssignedTo").prop("hidden")) {
            send = {
                table: "inventory",
                uid: id,
                fields: {
                    item: item,
                    category: category,
                    location: location,
                    type: type,
                    unit_measure: unit_measure,
                    unit_price: Number(unit_price),
                    manufacturer: manufacturer,
                    model: model,
                    serial_no: serial_no,
                    picture: picture
                }
            }
        }
        else {
            send = {
                table: "inventory",
                uid: id,
                fields: {
                    item: item,
                    category: category,
                    location: location,
                    type: type,
                    unit_measure: unit_measure,
                    unit_price: Number(unit_price),
                    manufacturer: manufacturer,
                    model: model,
                    serial_no: serial_no,
                    picture: picture,
                    assigned_to: $("#assigned_to").find(":selected").attr("id")
                }
            }
        }
        console.log(send)

        var formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        })

        var image

        if(picture == "") {
            image = "<div class=\"img-center text-center border rounded\" style=\"width: 40pt;height: 40pt\" id='imageHolder' data='0'> <i class=\"fas fa-camera pt-3 text-primary\" style=\"font-size: 16pt\"></i></div>"
        }
        else {
            image = "<img class='card-img ml-0' src=baseUrl + '/Items/images/thumbs/"+ picture +".jpg' id='imageHolder' data="+ picture +" style='width: 40pt;height: 40pt;display: block;margin-left: auto;margin-right: auto;border: 1px solid #ddd;border-radius: 4px;object-fit: cover;'>"
        }
        if(detail.type == "fixed asset")
            var row = [image,item,$("#location").val(),$("#category").val(),$("#manufacturer").val(),$("#model").val(),$("#serial_no").val(),formatter.format(unit_price)+" NKF",qty,$("#unit_measure").val(),"<input class='form-check-input' type='checkbox'>",$('#assigned_to').find(':selected').html(),"<button type=\"button\" class=\"btn cur-p bg-transparent border-0 edit p-2 m-0\" data-toggle='modal' data-target='#itemModal'><i class='fas fa-edit text-primary'></i></button><button type=\"button\" class=\"btn cur-p border-0 bg-transparent ml-1 mr-auto delete p-2 m-0\"><i class='fas fa-trash-alt text-danger'></i></button>"]
        else
            var row = [image,item,$("#location").val(),$("#category").val(),$("#manufacturer").val(),$("#model").val(),$("#serial_no").val(),formatter.format(unit_price)+" NKF",qty,$("#unit_measure").val(),"<input class='form-check-input' type='checkbox'>","<button type=\"button\" class=\"btn cur-p bg-transparent border-0 edit p-2 m-0\" data-toggle='modal' data-target='#itemModal'><i class='fas fa-edit text-primary'></i></button><button type=\"button\" class=\"btn cur-p border-0 bg-transparent ml-1 mr-auto delete p-2 m-0\"><i class='fas fa-trash-alt text-danger'></i></button>"]

        $.post(baseUrl + '/app/updateItem.php',send,"json").done((data) => {
            var response = JSON.parse(data)
            if(response.success === "true"){
                $('#additionalModal').trigger('click')
                $('#ok').attr("data-type", "success").attr("data-message", "Successfully edited category.").attr("data-title", "Success! ").click()
                table.row(element).data(row).draw(false)
            }
            else{
                $('#additionalModal').trigger('click')
                $('#ok').attr("data-type", "danger").attr("data-message", "Please try again.").attr("data-title", "Failure! ").click()
            }
        })
    }
}

function updateItem(event){
    event.preventDefault()
    if(checkFormValidity() === false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else {
        var item  = $("#item").val()
        var category  = $("#category").find(":selected").attr('id')
        var location  = $("#location").find(":selected").attr('id')
        var unit_measure  = $("#unit_measure").find(":selected").attr('id')
        var type  = $("#type").val()
        var unit_price = $("#unit_price").val()
        var qty = $("#qty").html()
        var id = $("#item_id").html()

        if($("#rowAssignedTo").prop("hidden")) {
            var send = {
                table: "inventory",
                id: id,
                fields: {
                    item: item,
                    category: category,
                    location: location,
                    type: type,
                    unit_measure: unit_measure,
                    unit_price: Number(unit_price)
                }
            }
        }
        else {
            var send = {
                table: "inventory",
                id: id,
                fields: {
                    item: item,
                    category: category,
                    location: location,
                    type: type,
                    unit_measure: unit_measure,
                    unit_price: Number(unit_price),
                    assigned_to: $("#assigned_to").find(":selected").attr("id")
                }
            }
        }

        var formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        })

        var row = [item,$("#location").val(),$("#category").val(),formatter.format(unit_price)+" NKF",qty,$("#unit_measure").val(),"<button type=\"button\" class=\"btn cur-p bg-transparent border-0 edit p-2 m-0\" data-toggle='modal' data-target='#itemModal'><i class='fas fa-edit text-primary'></i></button><button type=\"button\" class=\"btn cur-p border-0 bg-transparent ml-1 mr-auto delete p-2 m-0\"><i class='fas fa-trash-alt text-danger'></i></button>"]

        $.post(baseUrl + '/app/updateItem.php',send,"json").done((data) => {
            var response = JSON.parse(data)
            if(response.success === "true"){
                $('#additionalModal').trigger('click')
                $('#ok').attr("data-type", "success").attr("data-message", "Successfully edited category.").attr("data-title", "Success! ").click()
                table.row(element).data(row).draw(false)
            }
            else{
                $('#additionalModal').trigger('click')
                $('#ok').attr("data-type", "danger").attr("data-message", "Please try again.").attr("data-title", "Failure! ").click()
            }
        })

    }
}

function saveTransaction(event){
    var table = $("#transactionsTable").DataTable()
    $("#in_stock").addClass("is-valid")
    if($("#transaction_type").val() === "Loan"){
        document.querySelector("#siv").classList.add("is-valid")
        document.querySelector("#requisition").classList.add("is-valid")
    }
    event.preventDefault()
    if(checkFormValidity() === false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else {
        var data = []
        var item = []
        var sql = ""
        var insert = []

        data["transaction_item"] = document.querySelector("#item").options[document.querySelector("#item").options.selectedIndex].getAttribute("id")
        data["details"] = Array.prototype.slice.call(document.querySelectorAll('#items option:checked'),0).map(function(v,i,a) {
            return v.getAttribute("details");
        });
        data["employee"] = document.querySelector("#employee").options[document.querySelector("#employee").options.selectedIndex].id
        data["transaction_type"] = document.querySelector("#transaction_type").options[document.querySelector("#transaction_type").options.selectedIndex].id
        var trans_type = document.querySelector("#transaction_type").options[document.querySelector("#transaction_type").options.selectedIndex].value
        data["quantity"] = $("#quantity").val()
        data["siv"] = $("#siv").val()
        data["requisition"] = $("#requisition").val()
        data["comment"] = $("#remark").val()
        data["created_by"] = document.querySelector("#userProfileName").getAttribute("uuid")

        if(trans_type !== "Loan" && trans_type !== "Consume"){
            if(trans_type === "Permanently Move")
                data["returned"] = "Q"
            if(trans_type === "Relocate")
                data["returned"] = "R"
        }
        else{
            data["returned"] = ""
        }
        console.log(data)
        insert = [Object.values(data)]

        if($("#transaction_type").val() === "Relocate" || $("#transaction_type").val() === "Permanently Move"){
            item["location"] = document.querySelector("#location").options[document.querySelector("#location").options.selectedIndex].id
            item["assigned_to"] = document.querySelector("#employee").options[document.querySelector("#employee").options.selectedIndex].id
        }

        if(data["details"].length > 1) {
            var datas = []

            for (var i = 0; i <= data["details"].length - 1; i++) {
                var datass = []
                datass.push(data["transaction_item"])
                datass.push(data["details"][i])
                datass.push(data["employee"])
                datass.push(data["transaction_type"])
                datass.push("1")
                datass.push(data["siv"])
                datass.push(data["requisition"])
                datass.push(data["comment"])
                datass.push(data["created_by"])
                datass.push(data["returned"])

                datas.push(datass)
            }
            insert = Object.values(datas)
        }
        sql = "insert into `inventory transactions`(transaction_item, details, employee, transaction_type, quantity, siv, requisition,comment, created_by, returned) values ?"
        connection.query(sql,[insert],(error,results) => {
            if(error)
                console.error(error.message)
            else{
                if(trans_type === "Loan" || trans_type === "Consume") {
                    $('#ok').attr("data-type", "success").attr("data-message", "Successfully added transaction.").attr("data-title", "Success! ").click()
                    document.querySelector("#items").removeAttribute("multiple")
                    document.querySelector("#in_stock").value = ""
                    document.querySelector("#needs-validation").reset()
                    $("#needs-validation").find('input,select').removeClass('is-valid is-invalid')
                }
                else{
                    for(var i = 0;i <= data["details"].length - 1; i++){
                        sql = "UPDATE `inventory` SET `location`=?,`type`='Fixed Asset',`assigned_to`=?  WHERE `unique_id`=?"
                        connection.query(sql,[item["location"],item["assigned_to"],data["details"][i]],(error,results) => {
                            if(error)
                                console.error(error.message)
                            else{
                                document.querySelector("#items").removeAttribute("multiple")
                                document.querySelector("#needs-validation").reset()
                                $("#needs-validation").find('input,select').removeClass('is-valid is-invalid')
                                $('#ok').attr("data-type", "success").attr("data-message", "Successfully added transaction.").attr("data-title", "Success! ").click()
                            }
                        })
                    }
                }
            }
        })

    }
}

async function processReturn(id){
    var settings = require("electron-settings")
    var moment = require("moment")
    var date = new Date()

    var return_date = moment(date).format("YYYY-MM-DD HH:mm:ss")
    var received_by = document.querySelector("#userProfileName").getAttribute("uuid")

    sql = "UPDATE `inventory transactions` SET `returned` = 'Y',`return_date` = ?,`received_by`= ? WHERE id = ?"
    connection.query(sql,[return_date,received_by,id],(error,results) => {
        if(error)
            console.log(error.message)
        else
            return new Promise((resolve => {
                resolve(true)
            }))
    })
}

async function processConsumption(id){
    var settings = require("electron-settings")
    var moment = require("moment")
    var date = new Date()

    var return_date = moment(date).format("YYYY-MM-DD HH:mm:ss")
    var received_by = document.querySelector("#userProfileName").getAttribute("uuid")

    sql = "UPDATE `inventory transactions` SET `returned` = 'P',`return_date` = ?,`received_by`= ? WHERE id = ?"
    connection.query(sql,[return_date,received_by,id],(error,results) => {
        if(error)
            console.log(error.message)
        else
            return new Promise((resolve => {
                resolve(true)
            }))
    })
}

async function processDamage(id){
    var settings = require("electron-settings")
    var moment = require("moment")
    var date = new Date()

    var return_date = moment(date).format("YYYY-MM-DD HH:mm:ss")
    var received_by = document.querySelector("#userProfileName").getAttribute("uuid")

    sql = "UPDATE `inventory transactions` SET `returned` = 'D',`return_date` = ?,`received_by`= ? WHERE id = ?"
    connection.query(sql,[return_date,received_by,id],(error,results) => {
        if(error)
            console.log(error.message)
        else
            return new Promise((resolve => {
                resolve(true)
            }))
    })
}

function saveItem(event){
    var settings = require("electron-settings")
    var moment = require("moment")
    event.preventDefault()
    if(checkFormValidity() === false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else {
        var arr = []
        var arr2 = []

        arr["item"] = document.querySelector("#item").value
        arr["type"] = document.querySelector("#type").options[document.querySelector("#type").options.selectedIndex].value
        if(arr["type"] === "Fixed Asset")
            arr["assigned_to"] = document.querySelector("#assigned_to").options[document.querySelector("#assigned_to").options.selectedIndex].id
        arr["category"] = document.querySelector("#category").options[document.querySelector("#category").options.selectedIndex].id
        arr["location"] = document.querySelector("#location").options[document.querySelector("#location").options.selectedIndex].id
        arr["manufacturer"] = document.querySelector("#manufacturer").value
        arr["model"] = document.querySelector("#model").value
        arr["serial_no"] = document.querySelector("#serial_no").value
        arr["supplier"] = document.querySelector("#supplier").value
        arr["reorder_level"] = document.querySelector("#reorder_level").value
        arr["target_stock_level"] = document.querySelector("#target_stock_level").value
        if(document.querySelector("#discontinued").checked)
            arr["discontinued"] = "Y"
        else
            arr["discontinued"] = "N"
        arr["unit_price"] = document.querySelector("#unit_price").value
        arr["unit_measure"] = document.querySelector("#unit_measure").options[document.querySelector("#unit_measure").options.selectedIndex].id
        if(document.querySelector("#unit_measure").options[document.querySelector("#unit_measure").options.selectedIndex].getAttribute("type") !== "pcs")
            arr["quantity"] = document.querySelector("#quantity").value
        else
            arr["quantity"] = 1
        var exp_date = new Date(document.querySelector("#expiry_date").value)
        arr["expiry_date"] = moment(exp_date).format("YYYY-MM-DD")
        arr["description"] = document.querySelector("#description").value
        arr["picture"] = document.querySelector("#picture").value
        arr["created_by"] = document.querySelector("#userProfileName").getAttribute("uuid")

        arr2["item"] = document.querySelector("#item").value
        arr2["grn_no"] = document.querySelector("#grn").value
        arr2["quantity"] = document.querySelector("#quantity").value
        arr2["purchase_order"] = document.querySelector("#purchase_order").value
        var pur_date = new Date(document.querySelector("#purchase_date").value)
        arr2["purchase_date"] = moment(pur_date).format("YYYY-MM-DD")
        arr2["submittedby"] = document.querySelector("#submitted_by").options[document.querySelector("#submitted_by").options.selectedIndex].id
        arr2["receivedby"] = document.querySelector("#received_by").options[document.querySelector("#received_by").options.selectedIndex].id
        arr2["authorisedby"] = document.querySelector("#authorised_by").options[document.querySelector("#authorised_by").options.selectedIndex].id
        arr2["created_by"] = arr["created_by"]

        var data = []
        var sql

        if(document.querySelector("#unit_measure").options[document.querySelector("#unit_measure").options.selectedIndex].getAttribute("type") !== "pcs") {
            data = Object.values(arr)
            sql = generateInsertQuery("inventory", arr,false)
        }
        else {
            data = [multipleRows(arr, document.querySelector("#quantity").value)]
            sql = generateInsertQuery("inventory", arr,true)
        }

        connection.query(sql,data,(error,fields,results) => {
            if(error)
                console.error(error.message)
            else{
                if(arr2["grn_no"] !== ""){
                    let sql2 = generateInsertQuery("grn",arr2)
                    connection.query(sql2,Object.values(arr2), (error,fields,results) => {
                        if(error)
                            console.error(error.message)
                        else {
                            document.querySelector("#needs-validation").reset()
                            resetImage()
                            $("#needs-validation").find('input,select').removeClass('is-valid is-invalid')
                            $('#ok').attr("data-type", "success").attr("data-message", "Successfully added item.").attr("data-title", "Success! ").click()
                        }
                    })
                }
                else{
                    document.querySelector("#needs-validation").reset()
                    resetImage()
                    $("#needs-validation").find('input,select').removeClass('is-valid is-invalid')
                    $('#ok').attr("data-type", "success").attr("data-message", "Successfully added item.").attr("data-title", "Success! ").click()
                }
            }
        })
        // console.log(Object.values(arr))

        // console.log(arr)
    }
}
function resetImage(){
    document.querySelector("#icon").removeAttribute("hidden")
    document.querySelector("#pic").setAttribute("hidden","hidden")
}
function multipleRows(array,times){
    var arr = []
    for(var i = 1;i <= times;i++){
        arr.push(Object.values(array))
    }
    return arr
}
function generateInsertQuery(table, arr, pcs = false){
    var fields = Object.keys(arr).toString()
    if(pcs === false) {
        var str = "insert into " + table + "(" + fields + ")values("
        for (var i = 0; i < Object.keys(arr).length; i++) {
            str = str + "?"
            if (i !== (Object.keys(arr).length - 1))
                str = str + ","
        }
        str = str + ")"
        return str
    }
    else{
        var str = "insert into " + table + "(" + fields + ")values ? "

        return str
    }
}

function generateUniqueID(){
    let flag = "0"
    const uniqid = require('uniqid')
    const strtoupper = require('strtoupper')
    let sql = "select * from inventory where unique_id = ?"

    let uuid = strtoupper.strtoupper(uniqid("NCEW"))
    connection.query(sql, uuid, (error, results) => {
        if (error)
            console.error(error.message)
        else {
            if (results.length === 0) {
                document.getElementById("uuid").value = uuid
            }
        }
    })
}

function limitQuantityIfSerialIsSet(){
    if(document.querySelector("#serial_no").value !== "") {
        document.querySelector("#quantity").setAttribute("disabled", "disabled")
        document.querySelector("#quantity").value = 1
    }
    else {
        document.querySelector("#quantity").removeAttribute("disabled")
        document.querySelector("#quantity").value = ""
    }
}

function makeGRNRequired(){
    let grn,pd,po,sb,rb,ab
    grn = document.querySelector("#grn").value
    pd = document.querySelector("#purchase_date").value
    po = document.querySelector("#purchase_order").value
    sb = document.querySelector("#submitted_by").options.selectedIndex
    rb = document.querySelector("#received_by").options.selectedIndex
    ab = document.querySelector("#authorised_by").options.selectedIndex

    if(grn !== "" || pd !== "" || po !== "" || sb !== 0 || rb !== 0 || ab !== 0) {
        document.querySelector("#grn").setAttribute("required", "required")
        document.querySelector("#purchase_date").setAttribute("required", "required")
        document.querySelector("#purchase_order").setAttribute("required", "required")
        document.querySelector("#submitted_by").setAttribute("required", "required")
        document.querySelector("#received_by").setAttribute("required", "required")
        document.querySelector("#authorised_by").setAttribute("required", "required")
    }
    else{
        document.querySelector("#grn").removeAttribute("required")
        document.querySelector("#grn").classList.remove("is-invalid")
        document.querySelector("#purchase_date").removeAttribute("required")
        document.querySelector("#purchase_date").classList.remove("is-invalid")
        document.querySelector("#purchase_order").removeAttribute("required")
        document.querySelector("#purchase_order").classList.remove("is-invalid")
        document.querySelector("#submitted_by").removeAttribute("required")
        document.querySelector("#submitted_by").classList.remove("is-invalid")
        document.querySelector("#received_by").removeAttribute("required")
        document.querySelector("#received_by").classList.remove("is-invalid")
        document.querySelector("#authorised_by").removeAttribute("required")
        document.querySelector("#authorised_by").classList.remove("is-invalid")
    }
}
function imageUpload(){
    var axios = require("axios")
    var file = document.getElementById("browse").files[0];

    var formData = new FormData();
    formData.append("picture", file);

    document.querySelector("#progContainer").removeAttribute("hidden")
    document.querySelector("#progress").removeAttribute("hidden")
    var config = {
        onUploadProgress: progressEvent => {
            var percentComplete = Math.ceil((progressEvent.loaded / progressEvent.total) * 100)
            document.querySelector("#progress").style.width = event.loaded + "%"

        }
    }

    axios.post(baseUrl + "/app/imageUpload.php",formData,config).then((response) => {
        console.log(response.data)
        axios({
            url: baseUrl + "/app/createThumb.php",
            method: "put",
            data: {"image": response.data.toString()}
        })
        document.querySelector("#progContainer").setAttribute("hidden","hidden")
        document.querySelector("#progress").style.width = "0%"
        document.querySelector("#picture").value = response.data
    })
}

function saveEmployee(event){
    const ucwords = require("ucwords")
    var table = $("#employeesDataTable").DataTable()
    event.preventDefault()
    if(checkFormValidity() === false){
        $('#ok').attr("data-type", "warning").attr("data-message", "Fill the form correctly and try again.").attr("data-title", "Error! ").click()
        return false
    }
    else {
        var send = {
            table: "employees",
            fields: ["first_name","last_name","department","mobile_phone","address","city","zoba","created_by"],
            rows: [
                {
                    first_name: "'" + $('#first_name').val() + "'",
                    last_name: "'" + $('#last_name').val() + "'",
                    department: $('#dept option:selected').attr('id'),
                    mobile_phone: "'" + $('#mobile_phone').val() + "'",
                    address: "'" + $('#address').val() + "'",
                    city: "'" + $('#city').val() + "'",
                    zoba: "'" + $('#zoba').val() + "'",
                    created_by: "'" + $('#userProfileName').attr('uuid') + "'"
                }
            ]
        }

        $.post(baseUrl + "/app/stock_insert.php",send,"json").done(data => {
            var result = JSON.parse(data)

            if(result.success == "success"){
                $('#ok').attr("data-type", "success").attr("data-message", "Successfully added employee.").attr("data-title", "Success! ").click()
                $('#mainContent').load('views/employees.html')
            }
            else{
                $('#ok').attr("data-type", "danger").attr("data-message", result.message).attr("data-title", "Error! ").click()
            }
        })
    }
}
function checkIfPasswordValid(id){
    var min = document.getElementById(id).getAttribute("min")
    var password = document.getElementById(id).value
    if(password.length >= min){
        document.getElementById(id).classList.remove("is-invalid");
        document.getElementById(id).classList.add("is-valid");
    }
    else{
        document.getElementById(id).classList.add("is-invalid");
        document.getElementById(id).classList.remove("is-valid");
    }
}
function checkIfPassword2Valid(){
    var password = document.querySelector("#password").value
    var password2 = document.querySelector("#password2").value
    if(password === password2){
        document.querySelector("#password2").classList.remove("is-invalid");
        document.querySelector("#password2").classList.add("is-valid");
    }
    else{
        document.querySelector("#password2").classList.add("is-invalid");
        document.querySelector("#password2").classList.remove("is-valid");
    }
}

function checkIfModalPassword2Valid(){
    var password = document.querySelector("#modal_password").value
    var password2 = document.querySelector("#modal_password2").value
    if(password === password2){
        document.querySelector("#modal_password2").classList.remove("is-invalid");
        document.querySelector("#modal_password2").classList.add("is-valid");
    }
    else{
        document.querySelector("#modal_password2").classList.add("is-invalid");
        document.querySelector("#modal_password2").classList.remove("is-valid");
    }
}

function checkIfValid(id){
    var pattern = document.getElementById(id).getAttribute('pattern').substr(1,document.getElementById(id).getAttribute('pattern').length - 2 )
    var val = document.getElementById(id).value

    var reg = new RegExp("["+pattern+"]","g")
    var antireg = new RegExp("[^"+pattern+"]", "g")

    if(document.getElementById(id).hasAttribute("required") && (val !== "" && val!== " ")) {
        if (val.match(reg) && !val.match(antireg)) {
            document.getElementById(id).classList.remove("is-invalid");
            document.getElementById(id).classList.add("is-valid");
        } else {
            document.getElementById(id).classList.add("is-invalid");
            document.getElementById(id).classList.remove("is-valid");
        }
    }
    else if(!document.getElementById(id).hasAttribute("required")){
        if(val === "") {
            document.getElementById(id).classList.remove("is-invalid");
            document.getElementById(id).classList.add("is-valid");
        }
        else{
            if (val.match(reg) && !val.match(antireg)) {
                document.getElementById(id).classList.remove("is-invalid");
                document.getElementById(id).classList.add("is-valid");
            } else {
                document.getElementById(id).classList.add("is-invalid");
                document.getElementById(id).classList.remove("is-valid");
            }
        }
    }
    else{
        document.getElementById(id).classList.add("is-invalid");
        document.getElementById(id).classList.remove("is-valid");
    }
}
function checkIfValid2(id){
    var pattern = document.getElementById(id).getAttribute('pattern').substr(1,document.getElementById(id).getAttribute('pattern').length - 8 )
    var val = document.getElementById(id).value

    var reg = new RegExp("["+pattern+"]","g")
    var antireg = new RegExp("[^"+pattern+"]", "g")

    if(document.getElementById(id).hasAttribute("required") && (val !== "" && val!== " ")) {
        if (val.match(reg) && !val.match(antireg)) {
            document.getElementById(id).classList.remove("is-invalid");
            document.getElementById(id).classList.add("is-valid");
        } else {
            document.getElementById(id).classList.add("is-invalid");
            document.getElementById(id).classList.remove("is-valid");
        }
    }
    else if(!document.getElementById(id).hasAttribute("required")){
        if(val === "") {
            document.getElementById(id).classList.remove("is-invalid");
            document.getElementById(id).classList.add("is-valid");
        }
        else{
            if (val.match(reg) && !val.match(antireg)) {
                document.getElementById(id).classList.remove("is-invalid");
                document.getElementById(id).classList.add("is-valid");
            } else {
                document.getElementById(id).classList.add("is-invalid");
                document.getElementById(id).classList.remove("is-valid");
            }
        }
    }
    else{
        document.getElementById(id).classList.add("is-invalid");
        document.getElementById(id).classList.remove("is-valid");
    }
}
//

function checkIfDataAndTimeValid(id){
    document.getElementById(id).classList.add("is-valid")
    document.getElementById(id).classList.remove("is-invalid")
}
//
function checkIfSelectIsValid(id){
    if(document.getElementById(id).options.selectedIndex === 0){
        document.getElementById(id).classList.add("is-invalid")
        document.getElementById(id).classList.remove("is-valid")
    }
    else{
        document.getElementById(id).classList.add("is-valid")
        document.getElementById(id).classList.remove("is-invalid")
    }
}

function deleteItem(id,element){
    var send = {
        id: id
    }
    $.post(baseUrl + "/app/deleteItem.php",send,"json").done(function(data){
        var table = $("#detailsDataTable").DataTable()
        if(JSON.parse(data).success === "true")
            table.row(element).remove().draw(false)
    })
}

function deleteRecord(id,element){
    var page = document.querySelector("#additionalTitle").innerText
    var table = ""

    if(page === "Users")
        table = "users"
    else if(page === "Roles")
        table = "roles"
    else if(page === "Categories")
        table = "category"
    else if(page === "Locations")
        table = "location"
    else if(page === "Departments")
        table = "departments"
    else if(page === "Units")
        table = "unit"

    var send = {
        table: table,
        id: id
    }
    $.post(baseUrl + "/app/delete.php",send,"json").done(function(data){
        var table = $("#additionalDataTable").DataTable()
        if(JSON.parse(data).success === "true")
            table.row(element).remove().draw(false)
    })
}
function getEmployees(id){
    var ucwords = require("ucwords")
    var selected = document.querySelector(id)

    var send = {
        table: "employees",
        fields: ["id","concat(first_name,' ',last_name) as name"],
        where: 1
    }

    $.post(baseUrl + "/app/stock_read.php",send,"json").done(data=>{
        var result = JSON.parse(data)

        if(result.success == "success"){
            var data = result.data
            for(var i=0;i<data.length;i++){
                var opt = document.createElement("option")
                opt.innerHTML = ucwords(data[i].name)
                opt.id = data[i].id
                selected.appendChild(opt)
            }
        }})
}

function getEmployeesByDepartment(id,dept_id){
    $(id+" option:not(:first)").remove()
    var ucwords = require("ucwords")
    var selected = document.querySelector(id)

    var send = {
        table: "employees",
        fields: ["id","concat(first_name,' ',last_name) as name"],
        where: "department = " + dept_id
    }

    $.post(baseUrl + "/app/stock_read.php",send,"json").done(data=>{
        var result = JSON.parse(data)

        if(result.success == "success"){
            var data = result.data
            for(var i=0;i<data.length;i++){
                var opt = document.createElement("option")
                opt.innerHTML = ucwords(data[i].name)
                opt.id = data[i].id
                selected.appendChild(opt)
            }
        }})
}

function getCategories(){
    var ucwords = require("ucwords")
    var selected = document.querySelector("#category")

    var send = {
        table: "category",
        fields: ["id","category_name"],
        where: 1
    }

    $.post(baseUrl + "/app/stock_read.php",send,"json").done(data=>{
        var result = JSON.parse(data)

        if(result.success == "success"){
            var data = result.data
            for(var i=0;i<data.length;i++){
                var opt = document.createElement("option")
                opt.innerHTML = ucwords(data[i].category_name)
                opt.id = data[i].id
                selected.appendChild(opt)
            }
        }})
}


function getItems(){
    var ucwords = require("ucwords")
    var selected = document.querySelector("#item")

    var send = {
        table: "items",
        fields: ["id","item"],
        where: "1 group by item order by item"
    }

    $.post(baseUrl + "/app/stock_read.php",send,"json").done(data=>{
        var result = JSON.parse(data)

        if(result.success == "success"){
            var results = result.data
            for(var i=0;i<results.length;i++){
                var opt = document.createElement("option")
                opt.innerHTML = ucwords(results[i].item)
                opt.id = results[i].id
                selected.appendChild(opt)
            }
        }})
}

function getRoles(){
    var ucwords = require("ucwords")
    var selected = document.querySelector("#role")

    var send = {
        table: "roles",
        fields: ["id","name"],
        where: 1
    }

    $.post(baseUrl + "/app/stock_read.php",send,"json").done(data=>{
        var result = JSON.parse(data)

        if(result.success == "success"){
            var data = result.data
            for(var i=0;i<data.length;i++){
                var opt = document.createElement("option")
                opt.innerHTML = ucwords(data[i].name)
                opt.id = data[i].id
                selected.appendChild(opt)
            }
        }})
}

function getModalRoles(){
    var ucwords = require("ucwords")
    var selected = document.querySelector("#modal_role")

    var send = {
        table: "roles",
        fields: ["id","name"],
        where: 1
    }

    $.post(baseUrl + "/app/stock_read.php",send,"json").done(data=>{
        var result = JSON.parse(data)

        if(result.success == "success"){
            var data = result.data
            for(var i=0;i<data.length;i++){
                var opt = document.createElement("option")
                opt.innerHTML = ucwords(data[i].name)
                opt.id = data[i].id
                selected.appendChild(opt)
            }
        }})
}

function getPrivilages(){
    var ucwords = require("ucwords")
    waitForElement("#permissions", 3000).then(function() {
        var send = {
            table: "permissions",
            fields: ["id","description"],
            where: 1
        }

        $.post(baseUrl + "/app/stock_read.php",send,"json").done(data=>{
            var result = JSON.parse(data)

            if(result.success == "success"){
                var results = result.data
                var per = $('#permissions')
                for(var i=0;i<results.length;i++){
                    per.append('<div class="custom-control custom-checkbox mb-3"><input class="custom-control-input" id="' + results[i].id + '" name="' + results[i].id + '" type="checkbox"><label class="custom-control-label" for="' + results[i].id + '">' + ucwords(results[i].description) + '</label></div>')
                }
            }})

    })
}
function getModalPrivilages(){
    var ucwords = require("ucwords")
    waitForElement("#modalpermissions", 3000).then(function() {
        var send = {
            table: "permissions",
            fields: ["id", "description"],
            where: 1
        }

        $.post(baseUrl + "/app/stock_read.php", send, "json").done(data => {
            var result = JSON.parse(data)

            if (result.success == "success") {
                var results = result.data
                var per = $('#modalpermissions')
                for (var i = 0; i < results.length; i++) {
                    per.append('<div class="custom-control custom-checkbox mb-3"><input class="custom-control-input" id="modal_' + results[i].id + '" name="modal_' + results[i].id + '" type="checkbox"><label class="custom-control-label" for="modal_' + results[i].id + '">' + ucwords(results[i].description) + '</label></div>')
                }
            }
        })
    })
}

function getUserPrivilages(){
    var ucwords = require("ucwords")
    var settings = require("electron-settings")
    var set_perms = settings.getSync('user.permissions.description')

    var perms = []

    set_perms.forEach((item) =>{
        perms.push(ucwords(item))
    })


    waitForElement("#modalpermissions", 3000).then(function() {
        var send = {
            table: "permissions",
            fields: ["id","description"],
            where: 1
        }

        $.post(baseUrl + "/app/stock_read.php",send,"json").done(data=>{
            var result = JSON.parse(data)

            if(result.success == "success"){
                var results = result.data
                var per = $('#modalpermissions')
                for (var i = 0; i < results.length; i++) {
                    if($.inArray(ucwords(results[i].description),perms) !== -1){
                        per.append(`<div class="custom-control custom-checkbox mb-3">
                                    <input class="custom-control-input" id="modal_' + results[i].id + '" name="modal_${results[i].id}" type="checkbox" checked disabled>
                                    <label class="custom-control-label" for="modal_' + results[i].id + '">${ucwords(results[i].description)}</label>
                                    </div>`)
                    }
                    else{
                        per.append(`<div class="custom-control custom-checkbox mb-3">
                                    <input class="custom-control-input" id="modal_' + results[i].id + '" name="modal_${results[i].id}" type="checkbox" disabled>
                                    <label class="custom-control-label" for="modal_' + results[i].id + '">${ucwords(results[i].description)}</label>
                                    </div>`)
                    }
                }
            }})
    })
}

function getDepartments(){
    var ucwords = require("ucwords")
    var selected = document.querySelector("#dept")

    var send = {
        table: "departments",
        fields: ["id","name"],
        where: 1
    }

    $.post(baseUrl + "/app/stock_read.php",send,"json").done(data=>{
        var result = JSON.parse(data)

        if(result.success == "success"){
            var data = result.data
            for(var i=0;i<data.length;i++){
                var opt = document.createElement("option")
                opt.innerHTML = ucwords(data[i].name)
                opt.id = data[i].id
                selected.appendChild(opt)
            }
    }})
}

function getModalDepartments(){
    var ucwords = require("ucwords")
    var selected = document.querySelector("#modal_dept")

    var send = {
        table: "departments",
        fields: ["id","name"],
        where: 1
    }

    $.post(baseUrl + "/app/stock_read.php",send,"json").done(data=>{
        var result = JSON.parse(data)

        if(result.success == "success"){
            var data = result.data
            for(var i=0;i<data.length;i++){
                var opt = document.createElement("option")
                opt.innerHTML = ucwords(data[i].name)
                opt.id = data[i].id
                selected.appendChild(opt)
            }
        }})
}

function getLocations(){
    var ucwords = require("ucwords")
    var selected = document.querySelector("#location")

    var send = {
        table: "location",
        fields: ["id","location_name"],
        where: 1
    }

    $.post(baseUrl + "/app/stock_read.php",send,"json").done(data=>{
        var result = JSON.parse(data)

        if(result.success == "success"){
            var data = result.data
            for(var i=0;i<data.length;i++){
                var opt = document.createElement("option")
                opt.innerHTML = ucwords(data[i].location_name)
                opt.id = data[i].id
                selected.appendChild(opt)
            }
    }})
}
function getLocationsNew(id){
    var ucwords = require("ucwords")
    var selected = document.querySelector(id)

    var send = {
        table: "location",
        fields: ["id","location_name"],
        where: 1
    }

    $.post(baseUrl + "/app/stock_read.php",send,"json").done(data=>{
        var result = JSON.parse(data)

        if(result.success == "success"){
            var data = result.data
            for(var i=0;i<data.length;i++){
                var opt = document.createElement("option")
                opt.innerHTML = ucwords(data[i].location_name)
                opt.id = data[i].id
                selected.appendChild(opt)
            }
        }})
}

function getJSONUnits(){
    var ucwords = require("ucwords")
    var units = []

    var send = {
        table: "unit",
        fields: ["id","unit_name","description"],
        where: 1
    }

    $.post(baseUrl + "/app/stock_read.php",send,"json").done(data=>{
        var result = JSON.parse(data)

        if(result.success == "success"){
            var data = result.data
            for(var i=0;i<data.length;i++){
                var tmp = {
                    value: `<span id="${data[i].id}">` + ucwords(data[i].unit_name) + "</span>",
                    display: ucwords(data[i].description) !== '' ? ucwords(data[i].unit_name) +" ("+ ucwords(data[i].description)+")" : ucwords(data[i].unit_name)
                }
                units.push(tmp)
            }
    }})

    return units
}

function getUnits(){
    var ucwords = require("ucwords")
    var selected = document.querySelector("#unit_measure")

    var send = {
        table: "unit",
        fields: ["id","unit_name","description","unit_type"],
        where: 1
    }

    $.post(baseUrl + "/app/stock_read.php",send,"json").done(data=>{
        var result = JSON.parse(data)

        if(result.success == "success"){
            var data = result.data
            for(var i=0;i<data.length;i++){
                var opt = document.createElement("option")
                if(data[i].description !== "")
                    opt.innerHTML = ucwords(data[i].unit_name + " (" + data[i].description + ")")
                else
                    opt.innerHTML = ucwords(data[i].unit_name)
                opt.id = data[i].id
                opt.setAttribute("type",data[i].unit_type)
                selected.appendChild(opt)
            }
        }})
}

function getTransactionTypes(){
    var ucwords = require("ucwords")
    var selected = document.querySelector("#transaction_type")

    sql = "select id,description from `transaction types`"

    connection.query(sql,function(error,results,fields){
        if(error){
            console.error(error.message)
        }
        else{
            for(var i=0;i<results.length;i++){
                var opt = document.createElement("option")
                opt.innerHTML = ucwords(results[i].description)
                opt.id = results[i].id
                selected.appendChild(opt)
            }
        }
    })
}
function populateItemsList(){
    document.querySelector("#item").options.selectedIndex = 0
    var transactionType = document.querySelector("#transaction_type")
    $("#item").find("option").not(":first").remove()
    document.querySelector("#item").classList.remove("is-valid")
    $("#items").find("option").not(":first").remove()
    document.querySelector("#items").options.selectedIndex = 0
    document.querySelector("#items").classList.remove("is-valid")
    var selectedTransactionType = transactionType.options[transactionType.options.selectedIndex].value
    var ucwords = require("ucwords")
    var selected = document.querySelector("#item")

    var type = "";
    if (selectedTransactionType === 'Relocate'){
        type = 'fixed asset';
    }
    else {
        type = 'inventory';
    }

    var sql = "select inventory.item,inventory.id,inventory.unique_id from inventory where type = ? group by item order by item"

    connection.query(sql,type,(error,results) => {
        if(error)
            console.log(error.message)
        else{
            for(var i=0;i<results.length;i++) {
                var opt = document.createElement("option")
                opt.innerHTML = ucwords(results[i].item)
                opt.id = results[i].id
                opt.setAttribute("details", results[i].unique_id)
                selected.appendChild(opt)
            }
        }
    })
}

function limitQuantity(){
    document.getElementById("quantity").value = $('#items option:selected').length;
    if($("#items").children("option:first-child").is(":selected")){
        document.querySelector("#quantity").classList.add("is-invalid")
        document.querySelector("#quantity").classList.remove("is-valid")
    }
    else{
        document.querySelector("#quantity").classList.add("is-valid")
        document.querySelector("#quantity").classList.remove("is-invalid")
    }
}
function controlQuantity(){
    if(document.querySelector("#quantity").value !== "" && document.querySelector("#quantity").value > document.querySelector("#in_stock").value) {
        document.querySelector("#quantity").classList.remove("is-valid")
        document.querySelector("#quantity").classList.add("is-invalid")
    }
    else if(document.querySelector("#quantity").value !== "" && document.querySelector("#quantity").value <= document.querySelector("#in_stock").value){
        document.querySelector("#quantity").classList.remove("is-invalid")
        document.querySelector("#quantity").classList.add("is-valid")
    }
    else {
        document.querySelector("#quantity").classList.remove("is-valid")
        document.querySelector("#quantity").classList.add("is-invalid")
    }
}

function getIndvItem() {
    var ucwords = require("ucwords")
    var item = document.querySelector("#item")
    var in_stock = document.querySelector("#in_stock")
    var selected = document.querySelector("#items")
    var transactionType = document.getElementById("transaction_type").options
    var item = item.options[item.options.selectedIndex].value

    $("#items").find("option").not(":first").remove()
    document.querySelector("#items").options.selectedIndex = 0
    document.querySelector("#items").classList.remove("is-valid")

    var sql = "";

    if(transactionType[transactionType.selectedIndex].value === "Relocate"){
        sql ="SELECT inventory.unique_id as details,location.location_name FROM `inventory` join location on location.id = inventory.location WHERE not exists(select * from `inventory transactions` where details=inventory.unique_id and (returned = 'D')) and item = ? and type='fixed asset'"
    }
    else{
        sql = "SELECT inventory.unique_id as details,location.location_name FROM `inventory` join location on inventory.location = location.id WHERE (not exists (select details from `inventory transactions` where inventory.unique_id=details and (returned!='Y' and returned!='R')) or (select unit_type from unit where unit_name=inventory.unit_measure)='bulk') and not exists(select * from `inventory transactions` where details=inventory.unique_id and (returned = 'D' or returned = 'P' or returned = 'Q' or returned = '')) and  inventory.item = ? order by timestamp asc"
    }

    connection.query(sql,item,(error,results) => {
        if(error)
            console.log(error.message)
        else{
            for(var i=0;i<results.length;i++) {
                var opt = document.createElement("option")
                opt.innerHTML = results[i].details + " (" + ucwords(results[i].location_name) + ")"
                opt.setAttribute("details",results[i].details)
                selected.appendChild(opt)
            }
            in_stock.setAttribute("value",results.length)
        }
    })
}

function quantityHandling(value){
    $("#quantity").val("")
    $("#quantity").removeClass("is-valid").removeClass("is-invalid")
    var sql = "select unit.unit_type from inventory join unit on unit.id = inventory.unit_measure where item = ?"

    connection.query(sql,value,(err,results) => {
        if(err)
            console.error(err)
        else {
            if(results[0].unit_type === "pcs"){
                document.getElementById("quantity").setAttribute("readonly", "readonly");
                document.getElementById("quantity").removeAttribute("step");
                document.getElementById("items").setAttribute("multiple","multiple");
            }
            else {
                document.querySelector("#quantity").classList.remove("is-valid")
                document.getElementById("quantity").removeAttribute("readonly");
                document.getElementById("quantity").setAttribute("step","any");
                document.getElementById("items").removeAttribute("multiple");
            }
        }
    })
}

function SIVShow(transactionType){
    if(transactionType === "Loan"){
        document.getElementById("siv").setAttribute("disabled","disabled");
        document.getElementById("requisition").setAttribute("disabled","disabled");
    }
    else{
        document.getElementById("siv").removeAttribute("disabled")
        document.getElementById("requisition").removeAttribute("disabled")
    }
    if(transactionType === "Permanently Move" || transactionType === "Relocate"){
        document.getElementById('loc-row').removeAttribute("hidden");
        document.getElementById('location').setAttribute("required","required");
        document.getElementById('location').classList.remove("is-valid")
    }
    else{
        document.getElementById('loc-row').setAttribute("hidden","hidden");
        document.getElementById('location').removeAttribute("required");
        document.getElementById('location').classList.add("is-valid")
    }
}

//
function checkFormValidity(){
    var form = document.getElementById("needs-validation")
    var allInputs = form.getElementsByTagName("input")
    var allSelect = form.getElementsByTagName("select")

    var res = []

    for(var i = 0;i< allSelect.length;i++) {
        var select = allSelect[i]
        if(select.hasAttribute("required") && !select.hasAttribute("disabled") && select.selectedIndex !== 0)
            res.push(allSelect[i].classList.contains('is-valid'))
        else if(!select.hasAttribute("required") && !select.hasAttribute("disabled") && select.selectedIndex === 0)
            res.push(true)
        else if(select.hasAttribute("required") && select.hasAttribute("disabled"))
            res.push(true)
        else
            res.push(allSelect[i].classList.contains('is-valid'))
    }

    for(var i = 0;i <= allInputs.length - 1; i++){
        var inputs = allInputs[i]
        if(inputs.hasAttribute("required") && inputs.value !== "")
            res.push(allInputs[i].classList.contains('is-valid'))
        else if(!inputs.hasAttribute("required")&& !inputs.hasAttribute("disabled") && inputs.value === "")
            res.push(true)
        else if(!inputs.hasAttribute("required") && inputs.hasAttribute("disabled"))
            res.push(true)
        else
            res.push(allInputs[i].classList.contains('is-valid'))
    }

    for(var j=0; j<=res.length-1; j++){
        if(res[j] == false){
            return false
            break
        }
    }
}

function checkModalFormValidity(){
    var form = document.getElementById("needs-validation-modal")
    var allInputs = form.getElementsByTagName("input")
    var allSelect = form.getElementsByTagName("select")

    var res = []

    for(var i = 0;i< allSelect.length;i++) {
        var select = allSelect[i]
        if(select.hasAttribute("required") && !select.hasAttribute("disabled") && select.selectedIndex !== 0)
            res.push(allSelect[i].classList.contains('is-valid'))
        else if(!select.hasAttribute("required") && !select.hasAttribute("disabled") && select.selectedIndex === 0)
            res.push(true)
        else if(select.hasAttribute("required") && select.hasAttribute("disabled"))
            res.push(true)
        else
            res.push(allSelect[i].classList.contains('is-valid'))
    }

    for(var i = 0;i <= allInputs.length - 1; i++){
        var inputs = allInputs[i]
        if(inputs.hasAttribute("required") && inputs.value !== "")
            res.push(allInputs[i].classList.contains('is-valid'))
        else if(!inputs.hasAttribute("required")&& !inputs.hasAttribute("disabled") && inputs.value === "")
            res.push(true)
        else if(!inputs.hasAttribute("required") && inputs.hasAttribute("disabled"))
            res.push(true)
        else
            res.push(allInputs[i].classList.contains('is-valid'))
    }

    for(var j=0; j<=res.length-1; j++){
        if(res[j] == false){
            return false
            break
        }
    }
}

function checkModalFormPasswordValidity(){
    var form = document.getElementById("needs-validation-password")
    var allInputs = form.getElementsByTagName("input")

    var res = []

    for(var i = 0;i <= allInputs.length - 1; i++){
        var inputs = allInputs[i]
        if(inputs.hasAttribute("required") && inputs.value !== "")
            res.push(allInputs[i].classList.contains('is-valid'))
        else if(!inputs.hasAttribute("required")&& !inputs.hasAttribute("disabled") && inputs.value === "")
            res.push(true)
        else if(!inputs.hasAttribute("required") && inputs.hasAttribute("disabled"))
            res.push(true)
        else
            res.push(allInputs[i].classList.contains('is-valid'))
    }

    for(var j=0; j<=res.length-1; j++){
        if(res[j] == false){
            return false
            break
        }
    }
}


function checkRolesFormValidity(){
    var form = document.getElementById("needs-validation")
    var allInputs = form.getElementsByTagName("input")

    var res = []

    for(var i = 0;i <= allInputs.length - 1; i++){
        var inputs = allInputs[i]
        if(inputs.hasAttribute("required") && inputs.value !== "")
            res.push(allInputs[i].classList.contains('is-valid'))
        else if(inputs.getAttribute("type") === "checkbox"){
            if(allInputs[i].checked)
                res.push()
        }
    }
    if($("input:checked").length === 0)
        res.push(false)

    for(var j=0; j<=res.length-1; j++){
        if(res[j] == false){
            return false
            break
        }
    }
}

function checkRolesModalFormValidity(){
    var form = document.getElementById("needs-validation-modal")
    var allInputs = form.getElementsByTagName("input")

    var res = []

    for(var i = 0;i <= allInputs.length - 1; i++){
        var inputs = allInputs[i]
        if(inputs.hasAttribute("required") && inputs.value !== "")
            res.push(allInputs[i].classList.contains('is-valid'))
        else if(inputs.getAttribute("type") === "checkbox"){
            if(allInputs[i].checked)
                res.push()
        }
    }
    if($("input:checked").length === 0)
        res.push(false)

    for(var j=0; j<=res.length-1; j++){
        if(res[j] == false){
            return false
            break
        }
    }
}

function checkIfAssignedToValid(){
    var assign = document.querySelector("#assigned_to")
    if(assign.hasAttribute("disabled")) {
        assign.classList.remove("is-invalid")
        assign.classList.add("is-valid")
    }
    else{
        if(assign.selectedIndex !== 0 ) {
            assign.classList.remove("is-invalid")
            assign.classList.add("is-valid")
        }
        else {
            assign.classList.remove("is-valid")
            assign.classList.add("is-invalid")
        }
    }

}
// function checkFormValidity2(){
//     var form = document.getElementById("needs-validation2")
//     var allInputs = form.getElementsByTagName("input")
//
//     var res = []
//
//     for(var i = 0;i <= allInputs.length - 1; i++){
//         res.push(allInputs[i].classList.contains('is-valid'))
//     }
//
//     for(var j=0; j<=res.length-1; j++){
//         if(res[j] == false){
//             return false
//             break
//         }
//     }
// }
// function retrieveLogs(){
//     var dataset = [["1","2","3","4","5","6","7","8","9","0","11","12","12","14","15","16","17","18","19","20","21"]]
//     $("#dataTable").dataTable({
//         data: dataset
//     })
//     // const python = require('child_process').spawn('python', [path.join(__dirname,'/py/main.py'), '-d']);
//     // python.stdout.on('data', function (data) {
//     //     var tabledata = ""
//     //     var logs = JSON.parse(data)
//     //     console.log(logs)
//     //     $("#dataTable").dataTable({
//     //         "data": dataset
//     //     })
//     // })
//     //
//     // python.stderr.on('data', (data) => {
//     //     console.error(` stderr: ${data}`);
//     // })
//     //
//     // python.on('close', (code) => {
//     //     if (code === 0) {
//     //
//     //     } else {
//     //         $('#ok').attr("data-type", "danger").attr("data-message", "Something went wrong, try again.").attr("data-title", "Error! ").click()
//     //     }
//     //     console.log(`child process exited with code ${code}`);
//     // })
//     // var table = $("#dataTable").DataTable()
//     // const fs = require('fs');
//     // const initSqlJs = require('sql.js');
//     // const filebuffer = fs.readFileSync(path.join(__dirname,'py/neon.db'));
//     //
//     // var db = null
//     // var results = []
//     //
//     // initSqlJs().then(function(SQL){
//     //     // Load the db
//     //     db = new SQL.Database(filebuffer);
//     //     let res = db.prepare("SELECT * FROM logs");
//     //     while(res.step()){
//     //         var row = res.getAsObject();
//     //         var result = [];
//     //         result.push(row.date);
//     //         result.push(row.time);
//     //         result.push(row.machine);
//     //         result.push(row.low_pressure);
//     //         result.push(row.temperature_low);
//     //         result.push(row.high_pressure);
//     //         result.push(row.temperature_high);
//     //         result.push(row.oil_pressure);
//     //         result.push(row.oil_level);
//     //         result.push(row.current_l1);
//     //         result.push(row.current_l2);
//     //         result.push(row.current_l3);
//     //         result.push(row.kwh_start);
//     //         result.push(row.kwh_end);
//     //         result.push(row.kwh_end - row.kwh_start);
//     //         result.push(row.kvarh_start);
//     //         result.push(row.kvarh_end);
//     //         result.push(row.kvarh_end - row.kvarh_start);
//     //         result.push(row.water_consumption);
//     //         result.push(row.exp_value_temp);
//     //         result.push(row.remark);
//     //
//     //         // results.push(result)
//     //
//     //         // table.row.add(result);
//     //
//     //     }
//     //     // table.draw()
//     // });
//     // // t.row.add(results).draw(false)
//     // console.log(results)
//     // $("#dataTable").DataTable().rows.add(results).draw()
//
// }
//
// function retrieveProductionHistory(){
//     var t = $("#prodDataTable").DataTable()
//     const fs = require('fs');
//     const sqlite3 = require('sqlite3').verbose();
//     var db = null
//     var results = []
//
//
//     db = new sqlite3.Database(path.join(__dirname,"py/neon.db"))
//     db.serialize(() => {
//         db.each(`Select * from production`, (err, row) => {
//             if (err) {
//                 console.error(err.message);
//             }
//             var result = []
//             result.push(row.date)
//             result.push(row.machine)
//             result.push(row.production)
//             result.push(row.remark)
//
//             results.push(result)
//
//             t.row.add(result)
//         });
//     });
//     t.draw()
//     console.log(results)
// }
//
function createChart(){
    var items = []
    var in_stock = []
    var reorder = []
    var target = []
    $.post(baseUrl + "/app/chart.php").done(function(data){
        var res = JSON.parse(data)

        if(res.success == "true"){
            $("#chartLoader").hide()
            $('#viewable').prop('hidden',false)
            items = res.items
            in_stock = res.in_stock
            reorder = res.reorder_level
            target = res.target_stock_level
            var options = {
                series: [{
                    name: "Target Stock Level",
                    data: target
                },
                    {
                        name: "In Stock",
                        data: in_stock
                    },
                    {
                        name: 'Reorder Level',
                        data: reorder
                    }
                ],
                chart: {
                    height: 740,
                    type: 'bar',
                    toolbar:{
                        tools: {
                            reset: false,
                            download: false
                        }
                    },
                    zoom: {
                        enabled: true
                    },
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    width: [2, 2, 2],
                    curve: 'straight',

                },
                legend: {
                    tooltipHoverFormatter: function(val, opts) {
                        return val + ' - <strong>' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + '</strong>'
                    }
                },
                markers: {
                    size: 0,
                    hover: {
                        sizeOffset: 6
                    }
                },
                xaxis: {
                    title: "Items",
                    categories: items
                },
                tooltip: {
                    y: [
                        {
                            title: {
                                formatter: function (val) {
                                    return val;
                                }
                            }
                        },
                        {
                            title: {
                                formatter: function (val) {
                                    return val ;
                                }
                            }
                        },
                        {
                            title: {
                                formatter: function (val) {
                                    return val;
                                }
                            }
                        }
                    ]
                },
                grid: {
                    borderColor: '#f1f1f1',
                }
            };
            var chart = new ApexCharts(document.querySelector("#chart"), options);
            chart.render();
        }
        else{
            $("#chartLoader").hide()
            $('#viewable').prop('hidden',false)
            var options = {
                series: [{
                    name: "Target Stock Level",
                    data: []
                },
                    {
                        name: "In Stock",
                        data: []
                    },
                    {
                        name: 'Reorder Level',
                        data: []
                    }
                ],
                chart: {
                    height: 740,
                    type: 'bar',
                    toolbar:{
                        tools: {
                            reset: false,
                            download: false
                        }
                    },
                    zoom: {
                        enabled: true
                    },
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    width: [2, 2, 2],
                    curve: 'straight',

                },
                legend: {
                    tooltipHoverFormatter: function(val, opts) {
                        return val + ' - <strong>' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + '</strong>'
                    }
                },
                markers: {
                    size: 0,
                    hover: {
                        sizeOffset: 6
                    }
                },
                xaxis: {
                    title: "Items",
                    categories: []
                },
                tooltip: {
                    y: [
                        {
                            title: {
                                formatter: function (val) {
                                    return val;
                                }
                            }
                        },
                        {
                            title: {
                                formatter: function (val) {
                                    return val ;
                                }
                            }
                        },
                        {
                            title: {
                                formatter: function (val) {
                                    return val;
                                }
                            }
                        }
                    ]
                },
                grid: {
                    borderColor: '#f1f1f1',
                }
            };
            var chart = new ApexCharts(document.querySelector("#chart"), options);
            chart.render();
        }
    })

}
function getAllItems(){
    var ucwords = require("ucwords")
    var arr = []

    var send = {
        table: "items",
        fields: ["item"],
        where: 1
    }

    $.post(baseUrl + "/app/stock_read.php",send,"json").done(data=>{
        var result = JSON.parse(data)

        if(result.success == "success"){
            var data = result.data
            console.log(data)
            for(var i=0;i<data.length;i++){
                arr.push(ucwords(data[i].item))
            }
    }})

    return arr
}
function getAllStockItems(){
    var ucwords = require("ucwords")
    var arr = []

    var send = {
        table: "items",
        fields: ["item"],
        where: 1
    }

    $.post(baseUrl + "/app/stock_read.php",send,"json").done(data=>{
        var result = JSON.parse(data)

        if(result.success == "success"){
            var data = result.data
            console.log(data)
            for(var i=0;i<data.length;i++){
                arr.push(ucwords(data[i].item))
            }
        }})

    return arr
}
function showAssignedTo(){
    var type = document.querySelector("#type").value

    if(type == "Fixed Asset"){
        document.querySelector("#rowAssignedTo").removeAttribute("hidden")
        document.querySelector("#assigned_to").removeAttribute("disabled")
    }
    else{
        document.querySelector("#rowAssignedTo").setAttribute("hidden","hidden")
        document.querySelector("#assigned_to").setAttribute("disabled","disabled")
    }
}
function getInStock(){
    var item = document.querySelector("#item").value

    var send = {
        table: "items",
        fields: ["(IF(NOT EXISTS(select stock.item_id from stock where stock.item_id = items.id and stock.type='inventory' group by stock.item_id),0,(select sum(stock.quantity) from stock where stock.item_id = items.id and stock.type='inventory' group by stock.item_id)) + IF(NOT EXISTS(select transaction_in.item_id from transaction_in where transaction_in.item_id = items.id group by transaction_in.item_id),0,(select sum(transaction_in.quantity) from transaction_in where transaction_in.item_id = items.id group by transaction_in.item_id))) - IF(NOT EXISTS(select transaction_out.item_id from transaction_out where transaction_out.item_id = items.id group by transaction_out.item_id),0,(select sum(transaction_out.quantity) from transaction_out where transaction_out.item_id = items.id group by transaction_out.item_id)) as in_stock"],
        where: "item ='" + item + "'"
    }

    $.post(baseUrl + "/app/stock_read.php",send,"json").done(data=>{
        var result = JSON.parse(data)

        if(result.success == "success"){
            var data = result.data
            if(data.length > 0 )
                document.querySelector("#stock").value = data[0].in_stock
        }
        else{
            document.querySelector("#stock").value = 0
        }
    })

}
function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
     the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value.trim();
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() === val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                     (or any other open lists of autocompleted values:*/
                    closeAllLists();
                    getInStock()
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
             increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
             decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
         except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
    /*execute a function when the document loses focus:*/
    inp.addEventListener("focusout", function (e) {
        closeAllLists(e.target);
    });


}
