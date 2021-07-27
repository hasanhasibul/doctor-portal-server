const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

app.use(bodyParser.json());
app.use(cors());

// Mongodb Connection Method 
const uriString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ezexp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const MongoClient = require('mongodb').MongoClient;

const uri = uriString;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db(`${process.env.DB_NAME}`).collection("Appointments");
  const doctorsCollection = client.db(`${process.env.DB_NAME}`).collection("doctors");

  console.log("database connection successfully");
  // perform actions on the collection object
  app.post('/addAppointment', (req, res) => {
    const data = req.body;
    collection.insertOne(data)
      .then(result => {
        if (result) {
          res.send(result.insertedCount > 0)
        }
      })
  })


  app.post('/appointmentByDate', (req, res) => {
    const date = req.body;
    const email = req.body.email;

    doctorsCollection.find({ email: email })
      .toArray((err, doctor) => {
        const filter = { appointmentDate: date.date };

        if (doctor.length == 0) {
          filter.email = email;
        }

        collection.find(filter)
          .toArray((err, documents) => {
            res.send(documents);
          })
      })

  })

  app.get('/allAppointments', (req, res) => {
    collection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.post('/addDoctors', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const file = req.files.file;
      const newImg = req.files.file.data;
      const encImg = newImg.toString('base64');
      const image = {
        contentType: req.files.file.mimetype,
        size: req.files.file.size,
        img: Buffer.from(encImg, 'base64')
      }
      doctorsCollection.insertOne({ name, email, image })
        .then(resultDoctor => {
          res.send(resultDoctor.insertedCount > 0)
    });
  })

  app.get('/doctors', (req, res) => {
    doctorsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/allAppointments', (req, res) => {
    collection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })


  app.post('/isDoctor', (req, res) => {
    const email = req.body.email;
    doctorsCollection.find({email:email})
      .toArray((err, doctor) => {
        res.send(doctor.length > 0)
      })
  })

});


app.listen(process.env.PORT || 5000)