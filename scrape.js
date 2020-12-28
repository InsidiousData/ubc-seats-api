const axios = require("axios")
const cheerio = require("cheerio");
//NOTES: The seat summary table has class 'table

//Format restrictions property
const formatRestrictions = string => {
  return string.trim().replace(/\r\n|\n|\r/gm, " ");
};

//Returns an JSON object that contains the details of the seat summary table
const getSeatSummary = async (subject, course, section) => {
  const URL = `https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-section&dept=${subject}&course=${course}&section=${section}`;
  const html = await axios.get(URL).then(res => res.data)
  const $ = cheerio.load(html);

  //Specific HTML element containing registration details
  const seatSummaryCheerio = $("table[class=\\'table] > tbody").children();

  if (!seatSummaryCheerio.html()) {
    throw {
      name: "CourseNotFoundError",
      message:
        "The Seat Summary HTML element could not be found for this class",
    };
  }

  const seatSummary = {
    totalSeatsRemaining: "",
    currentlyRegistered: "",
    generalSeatsRemaining: "",
    restrictedSeatsRemaining: "",
    restrictions: ""
  };

  seatSummaryCheerio.each((i, elem) => {
    const row = $(elem).children();

    //firstColumnText refers to the type of seat
    const firstColumnText = row.eq(0).text();
    //secondColumnText refers to the number
    const secondColumnText = row.eq(1).text();

    switch (firstColumnText) {
      case "Total Seats Remaining:":
        seatSummary.totalSeatsRemaining = secondColumnText;
        break;
      case "Currently Registered:":
        seatSummary.currentlyRegistered = secondColumnText;
        break;
      case "General Seats Remaining:":
        seatSummary.generalSeatsRemaining = secondColumnText;
        break;
      case "Restricted Seats Remaining*:":
        seatSummary.restrictedSeatsRemaining = secondColumnText;
        break;
      //Use for restrictions row
      default:
        seatSummary.restrictions = formatRestrictions(
          firstColumnText)
    }
  });
  return seatSummary;
};

module.exports = {
  getSeatSummary
};
