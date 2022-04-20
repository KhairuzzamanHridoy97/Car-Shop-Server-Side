const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

//Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bttmq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// console.log(uri)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const database = client.db('carShopDB')
    const productCollection = database.collection("products");
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection('users');
    const reviewsCollection = database.collection("reviews");

    // Post Api products
    app.post('/products',async (req,res)=>{
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.json(result)
    });

    // Get Api for products
    app.get('/products', async (req, res) => {
      const query = req.query.home;
      let cursor;
      if (query) {
        cursor = productCollection.find({}).limit(6);
      }
      else {
        cursor = productCollection.find({});
      }
      const result = await cursor.toArray();
      res.json(result);
    });

    // delete single products
    app.delete('/products/:id',async(req,res)=>{
      const id =req.params.id;
      const query = {_id:ObjectId(id)} 
      const result= await productCollection.deleteOne(query); // delete document operation
      res.json(result);
    });

    // post order
    app.post('/orders',async(req,res)=>{
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.json(result);
      // console.log(result);
    });

     //get order
     app.get('/allOrders',async(req,res)=>{
      const cursor = ordersCollection.find({})
      const orders = await cursor.toArray()
      res.json(orders)
    });

    //show normal user data in  myOrder
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log(query);
      const cursor = ordersCollection.find(query);
      const orders = await cursor.toArray();
      res.json(orders);
    });  


    // delete single order
    app.delete('/deleteOrder/:id',async(req,res)=>{
      const id= req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

     //  post users
     app.post('/users',async(req,res)=>{
      const user = req.body
      const result = await usersCollection.insertOne(user); 
      console.log(result);
      res.json(result);
  }) ;
  
    // update-insert (upsert) for using googleSignIn
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
      filter,
      updateDoc,
      options
      );
      res.json(result);
  });

  // admin role set-up
  app.put("/users/admin",async(req,res)=>{
    const user = req.body;
    console.log('put',user)
    const filter = {email: user.email};
    const updateDoc ={$set:{role: 'admin'}};
    const result = await usersCollection.updateOne(filter,updateDoc);
    res.json(result);
});

  // admin role check
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false
      if (user?.role === 'admin') {
          isAdmin = true;
      }
      res.json({ admin: isAdmin });
  });

  // GET API for Show Reviews
    app.get("/addReview", async (req, res) => {
      const result = await reviewsCollection.find({}).toArray();
      res.send(result);
   });

  //POST API For addReview
    app.post("/addReview", async (req, res) => {
    const addReview = req.body;
    const result = await reviewsCollection.insertOne(addReview);
    res.send(result.insertedId);
  });


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Car Shop!')
})

app.listen(port, () => {
  console.log(`Car shop server run on port ${port}`)
})