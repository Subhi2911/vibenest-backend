const connectToMongo = require('./server');
const express = require('express');
var cors = require('cors')

connectToMongo();
const app = express();
const port=5000;

app.use(cors());

app.use(express.json());

//Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/blogs', require('./routes/blogs'))
app.use('/uploads/profile', express.static('uploads/profile'));


app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`)
})
