let filter_id = 0;
let global_animation_id = 0;

function animate_logo(model_output, logo_document) {
    let boundary = getSvgBBox(logo_document);
    const logo_xmin = boundary.x;
    const logo_xmax = boundary.x + boundary.width;
    const logo_ymin = boundary.y;
    const logo_ymax = boundary.y + boundary.height;

    // Normalize model output
    const animations_by_id = new Map();
    for (const row of model_output) {
        const animation_id = Array.from( row.keys() )[0];
        const output = row.get(animation_id);
        if (!animations_by_id.has(animation_id)) {
            animations_by_id.set(animation_id, []);
        }
        animations_by_id.get(animation_id).push(output);
    }

    const total_animations = [];
    for (const animation_id of animations_by_id.keys()) {
        const animations = animations_by_id.get(animation_id);
        let boundary = getPathBBox(logo_document, animation_id);

        // Get current element
        const elements = get_all_elements(logo_document);
        let current_element = null;
        for(let i=0; i < elements.length; i++){
            const element = elements[i]
            if(element.getAttribute('animation_id') == animation_id){
                current_element = element;
            }
        }
        
        const path_xmin = boundary[0];
        const path_xmax = boundary[1];
        const path_ymin = boundary[2];
        const path_ymax = boundary[3];
        const xmin = logo_xmin - path_xmin;
        const xmax = logo_xmax - path_xmax;
        const ymin = logo_ymin - path_ymin;
        const ymax = logo_ymax - path_ymax;
        const animations_by_type = new Map();
        for (const animation of animations) {
            if (animation[0] === 1) continue;
            try {
                const animation_type = animation.slice(0, 10).indexOf(1);
                if (!animations_by_type.has(animation_type)) {
                    animations_by_type.set(animation_type, []);
                }
                animations_by_type.get(animation_type).push(animation);
            } catch (error) {
                console.log('Model output invalid: no animation type found');
                return;
            }
        }
        for (const animation_type of animations_by_type.keys()) {
            const animationList = animations_by_type.get(animation_type)
            const current_animations = [];
            
            // Normalize begin and duration
            // For this step, merge translate and curve
            const joint_list = [];
            if (animation_type == 1){
                // get joint list
                let extended_arr_1 = animations_by_type.get(animation_type);
                extended_arr_1.forEach(a => a.push(animation_type));
                joint_list.push(...extended_arr_1);
            }
            else if (animation_type == 2){
                // get joint list
                let extended_arr_2 = animations_by_type.get(animation_type);
                extended_arr_2.forEach(a => a.push(animation_type));
                joint_list.push(...extended_arr_2);
            }
            else{
                joint_list.push(...animations_by_type.get(animation_type))
            }
            
            joint_list.sort((a, b) => a[10] - b[10]); // Sort by begin
            for (let i = 0; i < joint_list.length; i++){
                if (joint_list.length > 1){
                    /*let j = 1;
                    let next_animation = joint_list[j];
                    // Get next animation with different begin time
                    while((i+j) < joint_list.length - 1 && joint_list[i][10] == next_animation[10]){
                        j++;
                        next_animation = joint_list[j];
                    }
                    if (j != 1){
                        let interval;
                        if (joint_list[i][10] == joint_list[j][10]){
                            interval = 1; // Predefined interval if until last animation all have same begin
                        }
                        else{
                            // Get difference
                            let difference = joint_list[j][10] - joint_list[i][10];
                            interval = difference / (j - i);
                        }
                        let factor = 0;
                        for (a = i; a < j; a++){
                            joint_list[a][10] = joint_list[i][10] + interval * factor;
                            factor++;
                        }
                    }*/
                    // Check duration
                    if (i < joint_list.length - 1){
                        let max_dur = joint_list[i+1][10] - joint_list[i][10];
                        if (joint_list[i][11] > max_dur){
                            joint_list[i][11] = max_dur;
                        }
                    }
                    if (joint_list[i][11] <= 0){
                        joint_list[i][11] = 1;
                    }
                }
            }
            // Set back begin time such that first animation directly begins
            joint_list.sort((a, b) => a[10] - b[10]); // Sort by begin
            const o_begin = joint_list[0][10];
            for(let i = 0; i < joint_list.length; i++){
                joint_list[i][10] = joint_list[i][10] - o_begin;
            }
            // Set up final animation parameters
            let final_list = [];
            for (let i = 0; i < joint_list.length; i++){
                if (animation_type == 1 || animation_type == 2){
                    if(animation_type == joint_list[i][joint_list[i].length - 1]){
                        joint_list[i].pop();
                        const original_animation = joint_list[i];
                        final_list.push(original_animation);
                    }
                    else{
                        continue;
                    }
                }
                else{
                    final_list.push(joint_list[i]);
                }
            }

            for (let i = 0; i < final_list.length; i++) {
                
                const animation = final_list[i];
                let begin = animation[10];
                let dur = animation[11];
                handleAnimation(animation_id, i, final_list, animation_type, animation, current_animations, xmin, xmax, ymin, ymax, begin, dur);
                
            }
            total_animations.push(...current_animations);
        }
    }
    // Get duration
    let duration = 0;
    console.log('duration')
    for(let i=0; i < total_animations.length; i++){
        const animation = total_animations[i];
        let temp_dur = Number(animation.begin) + Number(animation.dur);
        if(temp_dur > duration){
            duration = temp_dur;
        }
    }
    console.log(duration)
    _insert_animations(total_animations, logo_document);
    
    return duration;
}

function _convertToHexStr(n){
    let h = n.toString(16);
    if (n < 16) {
        h = '0' + h;
    }
    return h;
}

function handleAnimation(animation_id, i, animationList, animationType, animation, currentAnimations, xmin, xmax, ymin, ymax, begin, dur) {
    switch (animationType) {
        case 1: // animation: translate
            console.log('translate')
            let from_x = animation[12];
            let from_y = animation[13];
            let to_x, to_y;
            if (i < animationList.length - 1) {
                to_x = animationList[i + 1][12];
                to_y = animationList[i + 1][13];
            } else {
                to_x = 0;
                to_y = 0;
            }
            // Check if parameters are within boundary
            from_x = Math.min(Math.max(from_x, xmin), xmax);
            from_y = Math.min(Math.max(from_y, ymin), ymax);
            to_x = Math.min(Math.max(to_x, xmin), xmax);
            to_y = Math.min(Math.max(to_y, ymin), ymax);
            currentAnimations.push(_animation_translate(animation_id, begin, dur, from_x, from_y, to_x, to_y));
            break;
        case 2: // animation: curve
            console.log('curve')
            let curve_from_x = animation[12];
            let curve_from_y = animation[13];
            let via_x = animation[14];
            let via_y = animation[15];
            let curve_to_x, curve_to_y;
            if (i < animationList.length - 1) {
                curve_to_x = animationList[i + 1][12];
                curve_to_y = animationList[i + 1][13];
            } else {
                curve_to_x = 0;
                curve_to_y = 0;
            }
            // Check if parameters are within boundary
            curve_from_x = Math.min(Math.max(curve_from_x, xmin), xmax);
            curve_from_y = Math.min(Math.max(curve_from_y, ymin), ymax);
            via_x = Math.min(Math.max(via_x, xmin), xmax);
            via_y = Math.min(Math.max(via_y, ymin), ymax);
            curve_to_x = Math.min(Math.max(curve_to_x, xmin), xmax);
            curve_to_y = Math.min(Math.max(curve_to_y, ymin), ymax);
            currentAnimations.push(_animation_curve(animation_id, begin, dur, curve_from_x, curve_from_y, via_x, via_y, curve_to_x, curve_to_y));
            break;
        case 3: // animation: scale
            console.log('scale')
            let scale_from_f = animation[16];
            let scale_to_f;
            if (i < animationList.length - 1) {
                scale_to_f = animationList[i + 1][16];
            } else {
                scale_to_f = 1;
            }
            currentAnimations.push(_animation_scale(animation_id, begin, dur, scale_from_f, scale_to_f));
            break;
        case 4: // animation: rotate
            console.log('rotate')
            let rotate_from_degree = animation[17];
            let midpoints = getMidpointOfPathBBox(document, animation_id);
            let rotate_to_degree;
            if (i < animationList.length - 1) {
                rotate_to_degree = animationList[i + 1][17];
            } else {
                rotate_to_degree = 360;
            }
            currentAnimations.push(_animation_rotate(animation_id, begin, dur, rotate_from_degree, rotate_to_degree, midpoints));
            break;
        case 5: // animation: skewX
            console.log('skewX')
            let skewX_from_x = animation[18];
            let skewX_to_x;
            if (i < animationList.length - 1) {
                skewX_to_x = animationList[i + 1][18];
            } else {
                skewX_to_x = 0;
            }
            skewX_from_x = Math.min(Math.max(skewX_from_x, xmin), xmax);
            skewX_to_x = Math.min(Math.max(skewX_to_x, xmin), xmax);
            currentAnimations.push(_animation_skewX(animation_id, begin, dur, skewX_from_x, skewX_to_x));
            break;
        case 6: // animation: skewY
            console.log('skewY')
            let skewY_from_y = animation[19];
            let skewY_to_y;
            if (i < animationList.length - 1) {
                skewY_to_y = animationList[i + 1][19];
            } else {
                skewY_to_y = 0;
            }
            skewY_from_y = Math.min(Math.max(skewY_from_y, ymin), ymax);
            skewY_to_y = Math.min(Math.max(skewY_to_y, ymin), ymax);
            currentAnimations.push(_animation_skewY(animation_id, begin, dur, skewY_from_y, skewY_to_y));
            break;
        case 7: // animation: fill
            console.log('fill')
            let from_rgb = '#' + _convertToHexStr(animation[20]) + _convertToHexStr(animation[21]) + _convertToHexStr(animation[22]);
            let to_rgb;
            if (i < animationList.length - 1) {
                to_rgb = '#' + _convertToHexStr(animationList[i + 1][20]) + _convertToHexStr(animationList[i + 1][21]) + _convertToHexStr(animationList[i + 1][22]);
            } else {
                // Get fill style from SVG
                /*let fillStyle = getStyleAttributesPath(document, animation_id, "fill");
                if (fillStyle == null) fillStyle = "none";
                let strokeStyle = getStyleAttributesPath(document, animation_id, "stroke");
                if (strokeStyle == null) strokeStyle = "none";
                if (fillStyle === "none" && strokeStyle !== "none") {
                    colorHex = strokeStyle;
                } else {
                    colorHex = fillStyle;
                }*/
                let fillStyle = getFillAttribute(document, animation_id);
                if(fillStyle == null){
                    to_rgb = "#000000"
                }
                else{
                    to_rgb = fillStyle;
                }
                //to_rgb = colorHex;
                //to_rgb = "#000"
            }
            currentAnimations.push(_animation_fill(animation_id, begin, dur, from_rgb, to_rgb));
            break;
        case 8: // animation: opacity
            console.log('opacity')
            let opacity_from_f = animation[23] / 100; // percent
            let opacity_to_f;
            if (i < animationList.length - 1) {
                opacity_to_f = animationList[i + 1][23] / 100; // percent
            } else {
                opacity_to_f = 1;
            }
            currentAnimations.push(_animation_opacity(animation_id, begin, dur, opacity_from_f, opacity_to_f));
            break;
        case 9: // animation: blur
            console.log('blur')
            let blur_from_f = animation[24];
            let blur_to_f;
            if (i < animationList.length - 1) {
                blur_to_f = animationList[i + 1][24];
            } else {
                blur_to_f = 0;
            }
            currentAnimations.push(_animation_blur(animation_id, begin, dur, blur_from_f, blur_to_f));
            break;
        default:
            console.log('Unknown animation type:', animationType);
            break;
    }
}

function getFillAttribute(document, animation_id){
    const elements = get_all_elements(document);
        let current_element = null;
        for(let i=0; i < elements.length; i++){
            const element = elements[i]
            if(element.getAttribute('animation_id') == animation_id){
                current_element = element;
            }
        }
    if (current_element == null){
        return null;
    }
    let fill_attribute = current_element.getAttribute('fill');
    if (fill_attribute == null){
        fill_attribute = current_element.getAttribute('stroke');
    }
    while(fill_attribute == null && current_element.parentElement != null){
        current_element = current_element.parentElement;
        fill_attribute = current_element.getAttribute('fill');
    }
    return fill_attribute;
}

function _animation_translate(animation_id, begin, dur, from_x, from_y, to_x, to_y) {
    console.log('animation: translate');
    const animation_dict = {
        animation_id,
        animation_type: 'animate_transform',
        attributeName: 'transform',
        attributeType: 'XML',
        type: 'translate',
        begin: `${begin}`,
        dur: `${dur}`,
        fill: 'freeze',
        from: `${from_x} ${from_y}`,
        to: `${to_x} ${to_y}`
    };
    return animation_dict;
}

function _animation_curve(animation_id, begin, dur, from_x, from_y, via_x, via_y, to_x, to_y) {
    console.log('animation: curve');
    const animation_dict = {
        animation_id,
        animation_type: 'animate_motion',
        begin: `${begin}`,
        dur: `${dur}`,
        fill: 'freeze',
        from: `${from_x} ${from_y}`,
        via: `${via_x} ${via_y}`,
        to: `${to_x} ${to_y}`
    };
    return animation_dict;
}

function _animation_scale(animation_id, begin, dur, from_f, to_f) {
    console.log('animation: scale');
    const animation_dict = {
        animation_id,
        animation_type: 'animate_transform',
        attributeName: 'transform',
        attributeType: 'XML',
        type: 'scale',
        begin: `${begin}`,
        dur: `${dur}`,
        fill: 'freeze',
        from: `${from_f}`,
        to: `${to_f}`
    };
    return animation_dict;
}

function _animation_rotate(animation_id, begin, dur, from_degree, to_degree, midpoints) {
    console.log('animation: rotate');
    const animation_dict = {
        animation_id,
        animation_type: 'animate_transform',
        attributeName: 'transform',
        attributeType: 'XML',
        type: 'rotate',
        begin: `${begin}`,
        dur: `${dur}`,
        fill: 'freeze',
        from: `${from_degree} ${midpoints[0]} ${midpoints[1]}`,
        to: `${to_degree} ${midpoints[0]} ${midpoints[1]}`
    };
    return animation_dict;
}

function _animation_skewX(animation_id, begin, dur, from_i, to_i) {
    console.log('animation: skew');
    const animation_dict = {
        animation_id,
        animation_type: 'animate_transform',
        attributeName: 'transform',
        attributeType: 'XML',
        type: 'skewX',
        begin: `${begin}`,
        dur: `${dur}`,
        fill: 'freeze',
        from: `${from_i}`,
        to: `${to_i}`
    };
    return animation_dict;
}

function _animation_skewY(animation_id, begin, dur, from_i, to_i) {
    console.log('animation: skew');
    const animation_dict = {
        animation_id,
        animation_type: 'animate_transform',
        attributeName: 'transform',
        attributeType: 'XML',
        type: 'skewY',
        begin: `${begin}`,
        dur: `${dur}`,
        fill: 'freeze',
        from: `${from_i}`,
        to: `${to_i}`
    };
    return animation_dict;
}

function _animation_fill(animation_id, begin, dur, from_rgb, to_rgb) {
    console.log('animation: fill');
    const animation_dict = {
        animation_id,
        animation_type: 'animate',
        attributeName: 'fill',
        attributeType: 'XML',
        type: 'fill',
        begin: `${begin}`,
        dur: `${dur}`,
        fill: 'freeze',
        from: from_rgb,
        to: to_rgb
    };
    return animation_dict;
}

function _animation_opacity(animation_id, begin, dur, from_f, to_f) {
    console.log('animation: opacity');
    const animation_dict = {
        animation_id,
        animation_type: 'animate',
        attributeName: 'opacity',
        attributeType: 'XML',
        type: 'opacity',
        begin: `${begin}`,
        dur: `${dur}`,
        fill: 'freeze',
        from: `${from_f}`,
        to: `${to_f}`
    };
    return animation_dict;
}

function _animation_blur(animation_id, begin, dur, from_f, to_f) {
    console.log('animation: blur');
    const animation_dict = {
        animation_id,
        animation_type: 'animate_filter',
        attributeName: 'transform',
        attributeType: 'XML',
        type: 'blur',
        begin: `${begin}`,
        dur: `${dur}`,
        fill: 'freeze',
        from: `${from_f}`,
        to: `${to_f}`
    };
    return animation_dict;
}

function _insert_animations(animations, document) {
    console.log('Insert animations');
    const elements = get_all_elements(document)

    for (const animation of animations) {
        console.log('Current animation')
        console.log(animation);
        let current_element = null;
        for(let i=0; i < elements.length; i++){
            const element = elements[i]
            if(element.getAttribute('animation_id') == animation.animation_id){
                current_element = element;
            }
        }
        console.log(!current_element)
        if (!current_element) continue;
        let animate_statement = null;
        switch (animation.animation_type) {
            case 'animate_transform':
                animate_statement = _create_animate_transform_statement(animation);
                break;
            case 'animate_motion':
                animate_statement = _create_animate_motion_statement(animation);
                break;
            case 'animate':
                animate_statement = _create_animate_statement(animation);
                break;
            case 'animate_filter':
                const filter = _get_filter_element(document, animation.animation_id, animation);
                let filter_element = filter[0];
                let fe_element = filter[1];
                let animate_element = filter[2]
                // Search for defs element
                defs = document.getElementsByTagName('defs')
                let current_defs = null
                if (defs.length == 0){
                    svg = document.getElementsByTagName('svg')[0];
                    current_defs = document.createElement('defs');
                    svg.appendChild(current_defs);
                }
                else{
                    current_defs = defs[0];
                }
                if (filter_element != null){
                    current_defs.appendChild(filter_element);
                }
                if (fe_element != null){
                    if(filter_element == null){
                        let id = `filter_${animation.animation_id}`;
                        for (f of document.getElementsByTagName('filter')){
                            if(f.getAttribute('id') == id){
                                filter_element = f;
                            }
                        }
                    }
                    
                    filter_element.appendChild(fe_element);
                }
                current_defs.appendChild(animate_element);
                current_element.setAttribute('filter', `url(#${filter_element.getAttribute('id')})`);
                break;
        }
        if (animate_statement) {
            current_element.appendChild(animate_statement);
        }
    }

    const result = new XMLSerializer().serializeToString(document);
    console.log(result)
}

function _create_animate_transform_statement(animation) {
    const animate_transform = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
    animate_transform.setAttribute('attributeName', animation.attributeName);
    animate_transform.setAttribute('attributeType', animation.attributeType);
    animate_transform.setAttribute('type', animation.type);
    animate_transform.setAttribute('begin', animation.begin);
    animate_transform.setAttribute('dur', animation.dur);
    animate_transform.setAttribute('fill', animation.fill);
    animate_transform.setAttribute('from', animation.from);
    animate_transform.setAttribute('to', animation.to);
    animate_transform.setAttribute('additive', 'sum')
    return animate_transform;
}

function _create_animate_motion_statement(animation) {
    const animate_motion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
    animate_motion.setAttribute('begin', animation.begin);
    animate_motion.setAttribute('dur', animation.dur);
    animate_motion.setAttribute('fill', animation.fill);
    animate_motion.setAttribute('from', animation.from);
    animate_motion.setAttribute('to', animation.to);
    animate_motion.setAttribute('path', `M${animation.from} Q${animation.via} ${animation.to}`);
    animate_motion.setAttribute('additive', 'sum')
    return animate_motion;
}

function _create_animate_statement(animation) {
    const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animate.setAttribute('attributeName', animation.attributeName);
    animate.setAttribute('attributeType', animation.attributeType);
    animate.setAttribute('type', animation.type);
    animate.setAttribute('begin', animation.begin);
    animate.setAttribute('dur', animation.dur);
    animate.setAttribute('fill', animation.fill);
    animate.setAttribute('from', animation.from);
    animate.setAttribute('to', animation.to);
    animate.setAttribute('additive', 'sum')
    return animate;
}

function _get_filter_element(document, animation_id, animation) {
    const filter_elements = document.getElementsByTagName('filter');
    let current_filter = null;
    let current_fe = null;
    for (const filter of filter_elements){
        if(filter.getAttribute('id') == `filter_${animation_id}`) current_filter = filter;
    }
    const fe_elements = document.getElementsByTagName('feGaussianBlur');
    for (const fe of fe_elements){
        if(fe.getAttribute('id') == `filter_blur_${animation_id}`) current_fe = fe;
    }
    if (current_filter == null){
        current_filter = document.createElement('filter');
        current_filter.setAttribute('id', `filter_${animation_id}`);
    }
    if (current_fe == null){
        current_fe = document.createElement('feGaussianBlur')
        current_fe.setAttribute('id', `filter_blur_${animation_id}`)
        current_fe.setAttribute('stdDeviation', '0')
    }
    animate_element = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animate_element.setAttribute('href', `#filter_blur_${animation_id}`);
    animate_element.setAttribute('attributeName', 'stdDeviation');
    animate_element.setAttribute('begin', animation.begin);
    animate_element.setAttribute('dur', animation.dur);
    animate_element.setAttribute('fill', animation.fill);
    animate_element.setAttribute('from', animation.from);
    animate_element.setAttribute('to', animation.to);
    animate_element.setAttribute('additive', 'sum');
    animate_element.setAttribute('fill', 'freeze')
    return [current_filter, current_fe, animate_element];
}

function get_all_elements(document){
    paths = Array.from(document.getElementsByTagName('path'))
    circles = Array.from(document.getElementsByTagName('circle'))
    ellipses = Array.from(document.getElementsByTagName('ellipse'))
    lines = Array.from(document.getElementsByTagName('line'))
    polygons = Array.from(document.getElementsByTagName('polygon'))
    polylines = Array.from(document.getElementsByTagName('polyline'))
    rects = Array.from(document.getElementsByTagName('rect'))
    texts = Array.from(document.getElementsByTagName('text'))
    elements = [];
    elements = elements.concat(paths, circles, ellipses, lines, polygons, polylines, rects, texts)
    return elements
    
}
function reset_animation_id(){
    global_animation_id = 0;
}
function insert_animation_id(element){
    element.setAttribute('animation_id', global_animation_id);
    global_animation_id++;
}

// Function for testing
function test(){
    // Animation type: [EOS, translate, curve, scale, rotate, skewX, skewY, fill, opacity, blur]
    let animation_type = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
    // Animation parameters (positions 10-25 of animation embedding) 
    let animation_parameters = [0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1000, 0];
    // Load logo
    let model_output = animation_type.concat(animation_parameters);
    let animation = new Map();
    // set animation for animation id 0
    animation.set(1, model_output);
    let test_data = [];
    test_data.push(animation)
    $(document).ready(function () {
        $.get("https://cdn.worldvectorlogo.com/logos/united-biscuits.svg", function (data) {
            
            console.log(data)
            const result = new XMLSerializer().serializeToString(data);
            console.log(result)
            document.getElementById("logo").innerHTML = result
            // insert animation id
            elements = get_all_elements(document)
            elements.forEach(insert_animation_id)
            // animate
            animate_logo(test_data, document)
            //document.getElementById("logo").innerHTML = ""
        });
    });
}
