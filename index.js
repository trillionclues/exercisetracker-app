const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config()
const User = require('./user.model');
const Exercise = require('./exercise.model.js')

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Use process.env to access the secret
const mySecret = process.env['MONGO_URI'] || 'mongodb+srv://exceln646:14253618@cluster0.runi6yp.mongodb.net/';

mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log("Connected to MongoDB")
}).catch((err) => {
  console.log("Error connecting to Mongodb:", err)
})

// Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const user = new User({ username: req.body.username })

    // create new user
    const savedUser = await user.save();

    // respond with user details
    res.json(savedUser)
  }
  catch (err) {
    console.error('Error creating user:', err);
    res.status(400).json({ error: 'Could not create user' });
  }
})

// function formatDate(date) {
//   const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
//   return date.toLocaleDateString('en-US', options);
// }

// post exercise details
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const userId = req.params._id
    const { description, duration, date } = req.body

    // check if person with Id does not exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: "User not found!" })
    }

    // Convert the date to the desired format (string)
    const formattedDate = date ? new Date(date).toDateString() : new Date().toDateString();

    // but if found, create exercise associated with user  
    const exercise = new Exercise({
      description,
      duration,
      date: formattedDate,
      user: userId,
    })

    // save the exercise
    const savedExercise = await exercise.save()

    // Update the user's log with the new exercise
    user.log.push(savedExercise);
    await user.save();

    // respond with exercise details json
    res.json({
      username: user.username,
      description: savedExercise.description,
      duration: savedExercise.duration,
      date: new Date(savedExercise.date).toDateString(),
      // date: savedExercise.date,
      // date: formatDate(new Date(savedExercise.date)),
      _id: userId,
    })
  }
  catch (err) {
    console.log('Error adding exercises', err)
    res.status(400).json({ error: 'Could not add exercise' })
  }
})

// Get a list of all user
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { _id: 1, username: 1 })
    res.json(users)
  }
  catch (err) {
    res.status(500).json({ error: 'Could not retrieve users' })
  }
})


// GET request to /api/users/:_id/logs to retrieve a full exercise log of any user.
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const userId = req.params._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(500).json({ error: "Could not retrieve user data" });
    }

    // Parse optional query parameters
    const from = new Date(req.query.from);
    const to = new Date(req.query.to);
    const limit = parseInt(req.query.limit);

    // Find all exercises for the user
    let userExercises = await Exercise.find({ user: userId });

    // Filter exercises based on from and to dates
    if (from instanceof Date && !isNaN(from.getTime())) {
      userExercises = userExercises.filter(exercise => exercise.date >= from);
    }
    if (to instanceof Date && !isNaN(to.getTime())) {
      userExercises = userExercises.filter(exercise => exercise.date <= to);
    }

    // Limit the number of exercises
    if (!isNaN(limit)) {
      userExercises = userExercises.slice(0, limit);
    }

    // Format the date property in each exercise log item
    const userLog = userExercises.map((exercise) => ({
      description: exercise.description,
      duration: exercise.duration,
      // date: exercise.date instanceof Date ? exercise.date.toDateString() : null, // Check if exercise.date exists
      date: new Date(exercise.date).toDateString()
    }));

    // Display user exercise data
    res.json({
      username: user.username,
      count: userLog.length,
      _id: user._id,
      log: userLog,
    });
  } catch (err) {
    console.log('Could not find user:', err);
    res.status(500).json({ error: 'Could not retrieve user log' });
  }
});




const listener = app.listen(process.env.PORT || 3001, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
