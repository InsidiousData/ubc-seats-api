const express = require("express");
const app = express();
const cors = require("cors");
const {getFormattedSeatSummary} = require("./scrape");
app.use(cors());
app.use(express.json());

//GET route for Seat Summary
app.get("/api/:subject/:course/:section", async (req, res, next) => {
  const subject = req.params.subject;
  const course = req.params.course;
  const section = req.params.section;

  getFormattedSeatSummary(subject, course, section)
  .then(result => res.send(result))
  .catch(err => next(err));
});


//Middleware to handle all errors
const errorHandler = (error, request, response, next) => {
  if (error.name === 'ClassNotFoundError') {
    response.status(404).json({
      error: "Class not found",
    });
  }
  next(error);
};

app.use(errorHandler);

app.listen(3001, () => {
  console.log("Listening on port 3001");
});

