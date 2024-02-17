/* Define storage and firestore references for easy use in functions */
const db = firebase.firestore();
const storage = firebase.storage();
const storageRef = storage.ref();

current_logo = "";
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

function animate_logo(){
    const { exec } = require('child_process');

    exec('python resources/postprocessing.py', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing the Python script: ${error}`);
        return;
    }
    console.log(`Python script output: ${stdout}`);
    });
}

function generate_random_animations(number_animations){
    // Generate random model output
    model_output = [];
    for (i = 0; i < number_animations; i++){
        // Set animation type
        type = Math.floor(Math.random() * 9) + 1;
        for (i = 0; i < 10; i++){
            if (i == type){
                model_output[i] = 1;
            }
            else{
                model_output[i] = 0;
            }
        }
        // Set parameters for the animation type
        switch(type){
            case 1:
                // translate

            case 2:
                // curve
            case 3:
                // scale
            case 4:
                // rotate
            case 5:
                // skewX
            case 6:
                // skewY
            case 7:
                // fill
            case 8:
                // opacity
            case 9:
                // blur
            default:
                break;
        }
    }

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

async function initialize(){
    console.log("initialize");
    await load_all_logos(2000)
        .then(load_random_logo)
        .catch(error => console.log(error));
}