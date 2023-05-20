const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.q5q1wsb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

client.connect().then(() => {
  const toyCollection = client.db('toyMarketPlace').collection('toys');

  app.get('/toys', (req, res) => {
    const cursor = toyCollection.find();
    cursor.toArray().then((result) => {
      res.send(result);
    });
  });

  app.get('/toys/:id', (req, res) => {
    const id = req.params.id;

    const query = { _id: new ObjectId(id) };
    const options = {
      projection: {
        description: 1,
        name: 1,
        sellerEmail: 1,
        sellerName: 1,
        pictureUrl: 1,
        quantityAvailable: 1,
        rating: 1,
        price: 1,
      },
    };

    toyCollection.findOne(query, options).then((result) => {
      res.send(result);
    }).catch((error) => {
      console.error('Error retrieving toy:', error);
      res.status(500).send('Internal Server Error');
    });
  });

  // Create a new toy
  app.post('/toys', (req, res) => {
    const toyData = req.body;

    toyCollection.insertOne(toyData).then((result) => {
      res.send(result);
    });
  });

  app.get('/toysMail/:email', (req, res) => {
    const email = req.params.email;
    const { sort } = req.query;
    const sortOptions = { price: sort === 'asc' ? 1 : -1 };

    toyCollection.find({ sellerEmail: email }).sort(sortOptions).toArray().then((toys) => {
      res.send(toys);
    });
  });

  app.put('/updatetoy/:id', (req, res) => {
    const id = req.params.id;
    const body = req.body;

    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        pictureUrl: body.pictureUrl,
        name: body.name,
        sellerEmail: body.sellerEmail,
        subCategory: body.subCategory,
        rating: body.rating,
        quantityAvailable: body.quantityAvailable,
        description: body.description,
      },
    };

    toyCollection.updateOne(filter, updateDoc).then((result) => {
      res.send(result);
    });
  });

  app.delete('/toys/:id', (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    toyCollection.deleteOne(query).then((result) => {
      res.send(result);
    });
  });

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});
