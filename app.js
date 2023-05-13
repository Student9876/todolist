const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")
const app = express()
const dotenv = require("dotenv")
dotenv.config()

app.use(express.static("public"))
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))
// Mongoose 

const pass = process.env.PASS
const user_id = process.env.USER_ID
const uri = "mongodb+srv://" + user_id + ":" + pass + "@cluster0.j3d6lug.mongodb.net/todolistDB"
mongoose.connect(uri, { useNewUrlParser: true })


// List for root route 
const newItemSchema = {
    name: String
}
const Item = mongoose.model("item", newItemSchema)




const defaultItem1 = new Item({
    name: "Welcome to your todo list!"
})
const defaultItem2 = new Item({
    name: "Hit the + button to add a new item."
})
const defaultItem3 = new Item({
    name: "Hit this to delete an item ---->"
})

const defaultItems = [defaultItem1, defaultItem2, defaultItem3]



// Lists for other routes 
const listSchema = {
    name: String,
    items: [newItemSchema]
}
const List = mongoose.model("list", listSchema)

const deletedItemsSchema = {
    name: String,
    items: [newItemSchema]
}
const completedItems = mongoose.model("delItem", deletedItemsSchema)


app.get("/", (req, res) => {
    Item.find().then((items) => {
        if (items.length === 0) {
            Item.insertMany(defaultItems)
            res.redirect("/")
        } else {
            res.render('list', {
                listTitle: "Today",
                newListItems: items,
            })
        }
    })
})



app.post("/", (req, res) => {
    const itemName = req.body.newItem
    const listName = req.body.list

    const item = new Item({
        name: itemName
    })
    if (listName === "Today") {
        item.save()
        res.redirect("/")

    } else {
        List.findOne({ name: listName }).then((foundList) => {
            foundList.items.push(item)
            foundList.save()
            res.redirect("/" + listName)
        })
    }
})


app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName)
    List.findOne({ name: customListName }).then((result) => {
        if (result === null) {
            // Create a new list 
            const list = new List({
                name: customListName,
                items: defaultItems
            })
            list.save()
            res.redirect("/" + customListName)
        }
        else {
            // Show the existing list 
            res.render("list", { listTitle: customListName, newListItems: result.items })
            // res.redirect("/"+customListName)
        }
    })
})


// Deleting Item
app.post("/delete", (req, res) => {
    const itemID = req.body.checkbox
    const listName = req.body.listName
    if (listName === "Today") {
        // Item.findOne({_id: itemID}).then((result)=>{
        //     const completed = new completedItems({
        //         name: "Today",
        //         items: result.name
        //     })

        // })
        Item.findByIdAndRemove(itemID).then((err) => {
            if (err) { console.log(err) }
            else { console.log("Item removed sucessfully") }
        })
        res.redirect("/")
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: itemID } } }).then((err) => {
            if (err) { console.log(err) }
            else { console.log("Item removed sucessfully") }
            res.redirect("/" + listName)
        })
    }
})


app.listen(process.env.PORT, function () {
    console.log("Server is running on port " + process.env.PORT)
})