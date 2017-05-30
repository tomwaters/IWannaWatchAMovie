const DataController = require('./datacontroller');
const Express = require('express');
const app = Express();
app.use(Express.static('public'))

let dataController = new DataController();

app.get('/api/programmes', function (req, res) {
  res.json(dataController.programmes);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});

