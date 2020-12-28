const axios = require("axios")
const cheerio = require("cheerio");
//NOTES: The seat summary table has class 'table

//Format restrictions property
const formatRestrictions = string => {
  return string.trim().replace(/\r\n|\n|\r/gm, " ");
};

//Returns an JSON object that contains the details of the seat summary table
const getFormattedSeatSummary = async (subject, course, section) => {
  const URL = `https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-section&dept=${subject}&course=${course}&section=${section}`;
  const html = await axios.get(URL).then(res => res.data)
  const $ = cheerio.load(html);

  //Specific HTML element containing registration details
  const seatSummary = $("table[class=\\'table] > tbody").children();

  if (!seatSummary.html()) {
    throw {
      name: "ClassNotFoundError",
      message:
        "The Seat Summary HTML element could not be found for this class",
    };
  }

  const formattedSeatSummary = {
    totalSeatsRemaining: "",
    currentlyRegistered: "",
    generalSeatsRemaining: "",
    restrictedSeatsRemaining: "",
    restrictions: ""
  };

  seatSummary.each((i, elem) => {
    const row = $(elem).children();

    //firstColumnText refers to the type of seat
    const firstColumnText = row.eq(0).text();
    //secondColumnText refers to the number
    const secondColumnText = row.eq(1).text();



    switch (firstColumnText) {
      case "Total Seats Remaining:":
        formattedSeatSummary.totalSeatsRemaining = secondColumnText;
        break;
      case "Currently Registered:":
        formattedSeatSummary.currentlyRegistered = secondColumnText;
        break;
      case "General Seats Remaining:":
        formattedSeatSummary.generalSeatsRemaining = secondColumnText;
        break;
      case "Restricted Seats Remaining*:":
        formattedSeatSummary.restrictedSeatsRemaining = secondColumnText;
        break;
    }


    //If the second column text is empty, means we are on the restrictions row
    if (!secondColumnText) {
      formattedSeatSummary.restrictions = formatRestrictions(
        firstColumnText
      );
    }
  });
  return formattedSeatSummary;
};

module.exports = {
  getFormattedSeatSummary
};
