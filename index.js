
const express = require('express')
var cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT||5000;

// midelware

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.q5q1wsb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const toyCollection = client.db("toyMarketPlace").collection("toys");
    

    app.get('/toys', async(req,res)=>{
        const cursor =toyCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/toys/:id', async (req, res) => {
      const id = req.params.id;
    
      try {
        const query = { _id: new ObjectId(id) };
        const options = {
          projection: { description: 1, name: 1, sellerEmail: 1, sellerName: 1, pictureUrl: 1, quantityAvailable: 1, rating: 1, price: 1 },
        };
    
        const result = await toyCollection.findOne(query, options);
        res.send(result);
      } catch (error) {
        console.error('Error retrieving toy:', error);
        res.status(500).send('Internal Server Error');
      }
    });


     // Create a new toy
     app.post('/toys', async (req, res) => {
      const toyData = req.body;
     
        const result = await toyCollection.insertOne(toyData);
        res.send(result);
      
    });


    app.get("/toysMail/:email", async (req, res) => {
      console.log(req.params.email);
      const { sort } = req.query;
  const sortOptions = { price: sort === 'asc' ? 1 : -1 };
      const toys = await toyCollection
        .find({
          sellerEmail: req.params.email,
        }).sort(sortOptions)
        .toArray();
      res.send(toys);
    });

    app.put("/updatetoy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      console.log(body);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          pictureUrl: body.pictureUrl,
          name: body.name,
          sellerEmail: body.sellerEmail,
          subCategory:body.subCategory,
          rating:body.rating,
          quantityAvailable:body.quantityAvailable,
          description:body.description
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    
    app.delete('/toys/:id', async(req,res)=>{
      const id = req.params.id;
      const quary ={_id: new ObjectId(id)}
      const result = await toyCollection.deleteOne(quary);
      res.send(result);
  })

    



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})