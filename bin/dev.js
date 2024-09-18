const { exec } = require("child-process-promise");
const express = require("express");

var main = async () => {
  const application = express();

  application.use(express.static("./"));

  // listen on default port
  application.listen(8000, (err) => {
    if (err) {
      console.error("Server could not start");
      return;
    }
    console.log("Http server listening on port", 8000);
    // build a dev bundle
    exec("npm run build-dev");
    console.log("website is up to date");
  });
};

main();
