const express = require("express");
const app = express();
const cors = require("cors");
const { getSeatSummary } = require("./scrape");
app.use(cors());
app.use(express.json());

//GET route for Seat Summary
app.get("/:subject/:course/:section", async (req, res, next) => {
  const subject = req.params.subject;
  const course = req.params.course;
  const section = req.params.section;

  getSeatSummary(subject, course, section)
    .then(result => res.send(result))
    .catch(err => next(err));
});

//Middleware to handle all errors
const errorHandler = (error, request, response, next) => {
  if (error.name === 'CourseNotFoundError') {
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