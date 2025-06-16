// import("./index.js");
import("./index.js")
  .then(app => {
    if (app.start) {
      app.start();
    } else {
      console.log('No start function found in index.js');
    }
  })
  .catch(error => {
    console.error('Error importing index.js:', error);
  });