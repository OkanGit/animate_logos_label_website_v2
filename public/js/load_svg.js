let scope = 5000;
let current_logo = "";
let current_data = null;
let original_logo = "";
let animated_logo = "";
let timeouts = [];


function load_random_logo(){
    for (var i=0; i<timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }
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
                original_logo = new XMLSerializer().serializeToString(data);
                document.getElementById("logo").innerHTML = original_logo;
                // insert animation id
                elements = get_all_elements(document);
                elements.forEach(insert_animation_id);

                data = generate_data(elements.length);
                current_data = data;
                console.log(data);
                // animate
                const duration = animate_logo(data, document)
                animated_logo = new XMLSerializer().serializeToString(document.getElementsByTagName('svg')[0]);
                document.getElementById("logo").innerHTML = animated_logo;
                document.getElementById('timer').innerText = duration;
                timeouts.push(setTimeout(function () {
                    console.log("Set original logo")
                    document.getElementById("logo").innerHTML = original_logo;
                }, (duration + 2) * 1000));
            });
        });
    });
}

function load_customized_logo(data){
    current_data = data;
    console.log(data);
    // animate
    const duration = animate_logo(data, document)
    animated_logo = new XMLSerializer().serializeToString(document.getElementsByTagName('svg')[0]);
    document.getElementById("logo").innerHTML = animated_logo;
    document.getElementById('timer').innerText = duration;
    timeouts.push(setTimeout(function () {
        console.log("Set original logo")
        document.getElementById("logo").innerHTML = original_logo;
    }, (duration + 2) * 1000));
}

function reload_animation(){
    for (var i=0; i<timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }
    document.getElementById("logo").innerHTML = animated_logo;
    duration = Number(document.getElementById('timer').innerText);
    timeouts.push(setTimeout(function () {
        console.log("Set original logo");
        document.getElementById("logo").innerHTML = original_logo;
    }, (duration + 2) * 1000));
}

function randomWithProbability(outcomes, weights){
    if(!weights){
        weights=Array(outcomes.length).fill(1);
    }
    let totalWeight=weights.reduce((prev, curr)=>prev+=curr);
    const num=Math.random();
    let sum=0, lastIndex=weights.length-1;
    for(let i=0; i<=lastIndex; i++){
        sum+=weights[i]/totalWeight;
        if(num<sum) return outcomes[i];
    }
    return outcomes[lastIndex];
}

const randomIntArrayInRange = (min, max, n = 1) =>
  Array.from(
    { length: n },
    () => Math.floor(Math.random() * (max - min + 1)) + min
  );

function generate_data(max_animation_id, logo, previous_output = null){
    // Random number of animations; max as number of paths
    let number_animations = Math.floor(Math.random() * max_animation_id) + 1;
    // Generate animations
    data = [];
    
    for (i=0; i < number_animations; i++){
        // Animation type: [EOS, translate, curve, scale, rotate, skewX, skewY, fill, opacity, blur]
        if (Math.random() < 0.3){
            // Predefined types: parallel movement; animation of same shapes
            let p_type = Math.floor(Math.random() * 1);
            switch(p_type){
                case 0:
                    // Parallel movement of random objects
                    console.log('parallel movement')
                    // Generate number of objects
                    const n = Math.floor(Math.random() * max_animation_id);
                    // Sample random animation ids to be included
                    const a_ids = randomIntArrayInRange(0, max_animation_id, n);
                    // Determine movement parameters
                    let animation_type = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    const isCurve = Math.random() < 0.5;
                    if (isCurve){
                        animation_type[1] = 1;
                    }
                    else{
                        animation_type[2] = 1;
                    }
                    let begin = Math.floor(Math.random() * 10); // Maximum 20s; no flooring as value is float
                    let dur = Math.floor(Math.random() * 5) + 1; // Min 1s; Maximum 20s; no flooring as value is float
                    let from_x = Math.floor(Math.random() * 100) - 50; // Min -50, Max 50
                    let from_y = Math.floor(Math.random() * 100) - 50; // Min -50, Max 50
                    let via_x = Math.floor(Math.random() * 100) - 50; // Min -50, Max 50
                    let via_y = Math.floor(Math.random() * 100) - 50; // Min -50, Max 50

                    let animation_parameters = [begin, dur, from_x, from_y, via_x, via_y, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    let model_output = animation_type.concat(animation_parameters);
                    for(let i = 0; i < a_ids.length; i++){
                        let animation = new Map();
                        const a_id = a_ids[i];
                        animation.set(a_id, model_output);
                        data.push(animation)
                    }
                    break;
                case 1:
                    // Animating subset of same shapes
                    console.log('animate subset of same shapes')
                    const shapes = ['path', 'circle', 'ellipse', 'line', 'polygon', 'polyline', 'rect', 'text'];
                    // Select shape
                    const s = Math.floor(Math.random() * shapes.length);
                    const shape = shapes[s];
                    elements = Array.from(document.getElementsByTagName(shape));
                    let animation_ids = [];
                    for (let i = 0; i < elements.length; i++){
                        animation_ids.push(elements[i].getAttribute('animation_id'));
                    }
                    // Create animation
                    animation_type = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    animation_type[type] = 1;
                    // Animation parameters (positions 10-25 of animation embedding) 
                    begin = Math.floor(Math.random() * 10); // Maximum 20s; no flooring as value is float
                    dur = Math.floor(Math.random() * 5) + 1; // Min 1s; Maximum 20s; no flooring as value is float
                    from_x = Math.floor(Math.random() * 100) - 50; // Min -50, Max 50
                    from_y = Math.floor(Math.random() * 100) - 50; // Min -50, Max 50
                    via_x = Math.floor(Math.random() * 100) - 50; // Min -50, Max 50
                    via_y = Math.floor(Math.random() * 100) - 50; // Min -50, Max 50
                    let scale = Math.random() * 20 // Max factor 20
                    let rotate = Math.floor(Math.random() * 361) // Min 0, Max 360
                    let skew_x = Math.floor(Math.random() * 100) - 50; // Min -50, Max 50
                    let skew_y = Math.floor(Math.random() * 100) - 50; // Min -50, Max 50
                    let r = Math.floor(Math.random() * 256) // Min 0, Max 255
                    let g = Math.floor(Math.random() * 256) // Min 0, Max 255
                    let b = Math.floor(Math.random() * 256) // Min 0, Max 255
                    let opacity = Math.random() * 101 // Min 0, Max 100
                    if (opacity > 100) opacity = 100;
                    let blur = Math.floor(Math.random() * 100)
                    animation_parameters = [begin, dur, from_x, from_y, via_x, via_y, scale, rotate, skew_x, skew_y, r, g, b, opacity, blur, 0];

                    model_output = animation_type.concat(animation_parameters);
                    let animation = new Map();
                    for(let i = 0; i < animation_ids.length; i++){
                        let animation = new Map();
                        const a_id = animation_ids[i];
                        animation.set(a_id, model_output);
                        data.push(animation)
                    }
                    break;
            }
            i = number_animations;
        }
        else{
            let type = 0;
            if(previous_output != null){
                let map = new Map();
                for(i = 0; i < previous_output.length; i++){
                    const type = animation.slice(0, 10).indexOf(1);
                    if(type != 0){
                        map.set(type, map.get(type) + 1);
                    }
                }
                let types = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                let weights = [];
                for(i = 1; i <= types.length; i++){
                    let num = map.get(i);
                    if(num === undefined){
                        num = 1;
                    }
                    const weight = 1 / num;
                    weights.push(weight);
                }
                type = randomWithProbability(types, weights)
            }
            else{
                type = Math.floor(Math.random() * 9) + 1;
            }
            let animation_type = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            animation_type[type] = 1;
            // Animation parameters (positions 10-25 of animation embedding) 
            let begin = Math.floor(Math.random() * 10); // Maximum 20s; no flooring as value is float
            let dur = Math.floor(Math.random() * 5) + 1; // Min 1s; Maximum 20s; no flooring as value is float
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
            let blur = Math.floor(Math.random() * 100)
            let animation_parameters = [begin, dur, from_x, from_y, via_x, via_y, scale, rotate, skew_x, skew_y, r, g, b, opacity, blur, 0];

            let model_output = animation_type.concat(animation_parameters);
            let animation = new Map();
            // Select random animation id
            let a_id = Math.floor(Math.random() * max_animation_id);
            animation.set(a_id, model_output);
            data.push(animation)
        }
    }
    data = flatten_data(data);
    return data
}

function flatten_data(data){
    // TODO set all unnecessary parameters to 0
    return data;
}

function get_current_logo(){
    return current_logo;
}

function get_current_data(){
    console.log(current_data);
    let final_data = "";
    for(i = 0; i < current_data.length; i++){
        let animation = current_data[i];
        const key = Array.from(animation.keys())[0];
        const output = animation.get(key);
        final_data += key + "," + output + ";";
    }
    console.log(final_data);
    return final_data;
}

function set_current_logo(logo){
    current_logo = logo;
}

function set_current_data(data){
    current_data = data;
}


// Main function
function main() {
    load_random_logo()
}

