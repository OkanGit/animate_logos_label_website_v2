//const fs = require('fs');
//const { exec } = require('child_process');
//const axios = require('axios');

scope = 0;
logos = [];

function load_all_logos(s){
    scope = s;
    return new Promise((resolve, reject) => {
        $(document).ready(function () {
            $.get("resources/results_shuffled.txt", function (data) {
                var lines = data.split('\n');
                let i = 0;
                lines.forEach(function (line) {
                    if (i < scope) {
                        logos.push(line);
                        console.log(line);
                    }
                    i++;
                });
                resolve(); // Resolve the promise once all logos are loaded
            }).fail(function() {
                reject("Could not load logos.");
            });
        });
    });
}

function load_random_logo(){
  number = Math.floor(Math.random() * scope);
  console.log("Load random number: " + number);
  current_logo = "logo_" + number;
  
  const http = require('http'); // or 'https' for https:// URLs
  const fs = require('fs');

  const file = fs.createWriteStream("resources/logo.svg");
  const request = http.get(logos[number], function(response) {
      response.pipe(file);

      // after download completed close filestream
      file.on("finish", () => {
          file.close();
          console.log("Download Completed");
      });
  });
}

postData('data to process');

// Main function
async function main() {
  try {
    
    load_all_logos(2000)
    load_random_logo()

    // Generate random integers
    const integers = Array.from({ length: 26 }, () => Math.floor(Math.random() * 100));

    // Execute Python script to process the content
    //const processedContent = await executePythonScript('resources/postprocessing.py', content, integers);
    res = subprocess.run(js_ctx, capture_output=True, text=True).stdout.strip('\n')
    // Display the processed content
    console.log(processedContent);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Call the main function
main();

