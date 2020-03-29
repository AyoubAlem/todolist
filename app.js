const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
// const date = require(__dirname + '/date.js');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
mongoose.connect(
  'mongodb+srv://admin-ayoub:Test123@cluster0-ry5vo.mongodb.net/todolistDB',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }
);

const itemsSchema = {
  name: String
};

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);

const Item = mongoose.model('Item', itemsSchema);

const coca = new Item({
  name: 'Bring With You Coca Cola'
});
const noodles = new Item({
  name: 'Bring With You Noodles'
});
const leaders = new Item({
  name: 'Bring With You Leaders'
});

const defaultItems = [coca, noodles, leaders];

app.get('/', function(req, res) {
  // const day = date.getDate();
  Item.find(function(err, items) {
    if (items.length === 0) {
      Item.insertMany([coca, noodles, leaders], function(err) {
        if (err) {
          console.log(err);
        }
      });
      res.redirect('/');
    } else {
      res.render('list', { listTitle: 'Today', newListItems: items });
    }
  });
});

app.post('/', function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.button;
  const item = new Item({
    name: itemName
  });
  if (listName == 'Today') {
    item.save();
    res.redirect('/');
  } else {
    List.findOne({ name: listName }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    });
  }
});

app.post('/delete', function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === 'Today') {
    Item.deleteOne({ _id: checkedItemId }, function(err) {
      if (!err) {
        res.redirect('/');
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function(err, foundList) {
        if (!err) {
          res.redirect('/' + listName);
        }
      }
    );
  }
});

app.get('/:customListName', function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect('/' + customListName);
      } else {
        res.render('list', {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});

let port = process.env.PORT;
if (port == null || port == '') {
  port = 3000;
}

app.listen(port, function(req, res) {
  console.log('Server is Running On Port 3000');
});
