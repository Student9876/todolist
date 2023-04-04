const express = require("express")
const bodyParser = require("body-parser")


const app = express()
app.use(express.static("public"))


var items = []
app.use(bodyParser.urlencoded({ extended: true }))

var indexOfItem

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
app.set('view engine', 'ejs')


app.get("/", (req, res) => {
    var today = new Date()

    var options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }

    var date = today.toLocaleDateString("en-US", options)
    res.render('list', {
        kindOfDay: date,
        newListItems: items
    })
})


app.post("/", (req, res) => {
    var item = req.body.newItem
    console.log(item)
    items.push(item)
    res.redirect("/")
    // res.render("list", { newListItem: item })
})


app.post("/removeItem", (req, res) => {
    indexOfItem = req.body.index
    items.splice(indexOfItem, 1)
    res.redirect("/")
    console.log(indexOfItem)
})


app.listen(3000, () => {
    console.log("Server is running on port 3000")
})