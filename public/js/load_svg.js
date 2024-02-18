//const fs = require('fs');
//const { exec } = require('child_process');
//const axios = require('axios');

scope = 2000;
current_logo = "";
current_data = null;


function load_random_logo(){
    reset_animation_id()
    $(document).ready(function () {
        logos = [];
        $.when($.get("resources/results_shuffled.txt", function (data) {
            var lines = data.split('\n');
            let i = 0;
            lines.forEach(function (line) {
                if (i < scope) {
                    logos.push(line);
                }
                i++;
            });
        })).done(function(){
            let number = Math.floor(Math.random() * scope);
            console.log("Load random number: " + number);
            let line = logos[number].split(';');
            const filename = line[0];
            current_logo = filename;
            const url = line[1];
            $.get(url, function (data) {
                const result = new XMLSerializer().serializeToString(data);
                document.getElementById("logo").innerHTML = result;
                // insert animation id
                elements = get_all_elements(document);
                elements.forEach(insert_animation_id);

                data = generate_data(null, elements.length);
                console.log(data)
                // animate
                animate_logo(data, document)
                //document.getElementById("logo").innerHTML = ""
            });
        });
    });
}

function generate_data(previous_output, max_animation_id){
    // Random number of animations; max as number of paths
    let number_animations = Math.floor(Math.random() * max_animation_id) + 1;
    // Generate animations
    data = [];
    for (i=0; i < number_animations; i++){
        // Animation type: [EOS, translate, curve, scale, rotate, skewX, skewY, fill, opacity, blur]
        let type = Math.floor(Math.random() * 9) + 1; //  --- DOne --- TODO change back
        let animation_type = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        animation_type[type] = 1;
        // Animation parameters (positions 10-25 of animation embedding) 
        let begin = Math.random() * 20; // Maximum 20s; no flooring as value is float
        let dur = Math.random() * 20; // Maximum 20s; no flooring as value is float
        let from_x = Math.floor(Math.random() * 100) - 50; // Min -50, Max 50
        let from_y = Math.floor(Math.random() * 100) - 50; // Min -50, Max 50
        let via_x = Math.floor(Math.random() * 100) - 50; // Min -50, Max 50
        let via_y = Math.floor(Math.random() * 100) - 50; // Min -50, Max 50
        let scale = Math.random() * 20 // Max factor 20
        let rotate = Math.floor(Math.random() * 361) // Min 0, Max 360
        let skew_x = Math.floor(Math.random() * 100) - 50; // Min -50, Max 50
        let skew_y = Math.floor(Math.random() * 100) - 50; // Min -50, Max 50
        let r = Math.floor(Math.random() * 256) // Min 0, Max 255
        let g = Math.floor(Math.random() * 256) // Min 0, Max 255
        let b = Math.floor(Math.random() * 256) // Min 0, Max 255
        let opacity = Math.random() * 101 // Min 0, Max 100
        if (opacity > 100) opacity = 100;
        let blur = Math.floor(Math.random() * 50)
        let animation_parameters = [begin, dur, from_x, from_y, via_x, via_y, scale, rotate, skew_x, skew_y, r, g, b, opacity, blur, 0];

        let model_output = animation_type.concat(animation_parameters);
        let animation = new Map();
        // Select random animation id
        let a_id = Math.floor(Math.random() * max_animation_id);
        animation.set(a_id, model_output);
        data.push(animation)
    }
    return data
}

function get_current_logo(){
    return current_logo;
}

function get_current_data(){
    return current_data;
}


// Main function
function main() {
    load_random_logo()
}

