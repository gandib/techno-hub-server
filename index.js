require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ijgzdcp.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

const run = async () => {
    try {
        const db = client.db("moontech");
        const productCollection = db.collection("product");
        console.log('db connected')
        app.get("/products", async (req, res) => {
            const cursor = productCollection.find({});
            const product = await cursor.toArray();

            res.send({ data: product });
        });

        app.post("/product", async (req, res) => {
            const product = req.body;

            const result = await productCollection.insertOne(product);

            res.send(result);
        });

        app.delete("/product/:id", async (req, res) => {
            const id = req.params.id;

            const result = await productCollection.deleteOne({ _id: ObjectId(id) });
            res.send(result);
        });

        app.put("/product/update/:id", async (req, res) => {
            // const id = req.params.id;
            const product = req.body;
            const id = product._id;
            console.log(id, product)
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    name: product.name,
                    desc: product.desc,
                    tag: product.tag,
                    img: product.img,
                }
            };
            const result = await productCollection.updateOne(filter, updatedDoc, options);
            res.send({ result, data: updatedDoc.$set });
        });
    } finally {
    }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});