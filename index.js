const express = require('express')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const jwt = require('jsonwebtoken');
const app = express()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5000



app.use(cors())
app.use(express.json())

/* function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    console.log("inside function", authHeader);
    if (!authHeader) {
        return res.status(401).send({ message: 'Un-authorized' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCEESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: "Forbidden access" })
        }
        req.decoded = decoded;
        next();
    });
} */

// =======================================================
const uri = `mongodb+srv://${process.env.USER}:${process.env.ACCESS}@cluster0.zvb4m.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const usersCollection = client.db("full-stack-project").collection("users");
const productsCollection = client.db("full-stack-project").collection("products");
const purchaseCollection = client.db("full-stack-project").collection("purchase");
const reviewCollection = client.db("full-stack-project").collection("review");

async function run() {
    try {
        // await client.connect();

        app.get("/products", async (req, res) => {
            const query = {}
            const cursor = await productsCollection.find(query).toArray();
            res.send(cursor)
        })
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.findOne(query)
            res.send(result)
        })
        app.post("/products", async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result)
        })
        app.put("/products", async (req, res) => {
            const quantity = req.body.updatedQuantity;
            const id = req.body.id;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    productQnty: quantity
                }
            }
            const result = await productsCollection.updateOne(filter, updateDoc)
            res.send(result)
        })
        app.delete("/products", async (req, res) => {
            const id = req.body;
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
            res.send(result)
        })
        // Purchase api's
        app.post("/purchase", async (req, res) => {
            const productDetails = req.body
            const result = await purchaseCollection.insertOne(productDetails)
            res.send(result)
        })
        app.get("/purchase", async (req, res) => {
            const query = {};
            const result = await purchaseCollection.find(query).toArray();
            res.send(result)
        })
        app.get("/purchaseIndiviual", async (req, res) => {
            const email = req.headers.email;
            const query = { email: email };
            const result = await purchaseCollection.find(query).toArray();
            res.send(result)
        })
        app.get("/purchase/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const result = await purchaseCollection.findOne(query);
            res.send(result)
        })
        app.delete("/purchase/:id", async (req, res) => {
            const id = req.body.id;
            const query = { _id: ObjectId(id) }
            const result = await purchaseCollection.deleteOne(query)
            console.log(result);
            res.send(result)
        })
        app.put("/purchase/:id", async (req, res) => {
            const id = req.body.id;
            const filter = { _id: ObjectId(id) };
            const option = {upsert:true}
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: req.body.transactionId
                }
            }
            const updateInfo = await purchaseCollection.updateOne(filter,updatedDoc,option)
            res.send(updateInfo)
        })
        app.put("/updateStatus", async (req, res) => {
            console.log(req.body);
            const id = req.body.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                  status:"shipped"
                },
              };
            const result = await purchaseCollection.updateOne(filter,updateDoc,options)
            res.send(result)
        })

        // ========================== Payment api =======================
        app.post("/create-payment-intent", async (req, res) => {
            const price = req.body.price;
            const amount = parseInt(price) * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                payment_method_types: ['card']
            });
            res.send({clientSecret: paymentIntent.client_secret})
        })
        // ===========================  User  =============================
        app.get("/users", async (req, res) => {
            const query = {}
            const result = await usersCollection.find(query).toArray();
            // const email = req.headers.email;
            // const token = jwt.sign({ email: email }, process.env.ACCEESS_TOKEN_SECRET, { expiresIn: '1h' });
            // console.log("indise api",authorization);
            res.send(result)
        })
        app.get("/user", async (req, res) => {
            const query = { email: req.headers.email }
            const result = await usersCollection.findOne(query);
            res.send(result)
            //====================== This api used in Navbar  =========
        })
        app.put("/users/admin", async (req, res) => {
            const email = req.body.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: "admin" },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result)
        })
        app.put("/users", async (req, res) => {
            const email = req.body.existingUser.email;
            const user = {email:email}
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            // const token = jwt.sign({ email: email }, process.env.ACCEESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send( result )
        })
        app.put("/user/update", async (req, res) => {
            const email = req.body.email;
            const filter = { email: email }
            const option = { upsert: true };
            const updateDoc = {
                $set: {
                    address: req.body.address,
                    number: req.body.number
                }
            };
            const result = await usersCollection.updateOne(filter, updateDoc, option)
            console.log(result);
            res.send(result)
        })
        app.delete("/user/delete", async (req, res) => {
            const email = req.body.email;
            const query = { email: email };
            const result = await usersCollection.deleteOne(query);
            res.send(result)
        })
        // ======================  Review ===========================
        app.get("/reviews", async (req, res) => {
            const query = {};
            const result = await reviewCollection.find(query).toArray();
            res.send(result)
        })
        app.post("/reviews", async (req, res) => {
            const feedback = req.body;
            const result = await reviewCollection.insertOne(feedback);
            res.send(result)
        })

    } finally {
        
    }
}
run().catch(console.dir);
// =======================================================




app.get('/', (req, res) => {
    res.send('Running on port')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})