const { exec } = require("child-process-promise");
const express = require("express");

const main = () => {
  const application = express();

  application.use(express.static("./"));

  // listen on default port
  application.listen(8000, async (err) => {
    if (err) {
      console.error("Backend could not start");
      return;
    }
    console.log("Backend listening on port", 8000);
    // build a dev bundle
    await exec("npm run build-dev");
    console.log("Backend is up to date");
  });
};

main();
