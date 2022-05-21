const express = require('express')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())
// =======================================================

// git e push korar por deploy kore deikho
const uri = `mongodb+srv://${process.env.USER}:${process.env.ACCESS}@cluster0.zvb4m.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const serviceCollection = client.db("full-stack-project").collection("services");

async function run() {
    try {
        await client.connect();

        app.get("/services", async(req, res) => {
            const query = {}
            const cursor = await serviceCollection.find(query).toArray();
            res.send(cursor)
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);
// =======================================================




app.get('/', (req, res) => {
    res.send('Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})