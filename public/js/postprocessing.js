import { getSvgBBox, getPathBBox } from "./get_svg_size_pos";

let filter_id = 0;

function animate_logo(model_output, logo_string) {
    boundary = getSvgBBox(logo_string);
    const logo_xmin = boundary[0];
    const logo_xmax = boundary[1];
    const logo_ymin = boundary[2];
    const logo_ymax = boundary[3];

    // Normalize model output
    const animations_by_id = new Map();
    for (const row of model_output) {
        const animation_id = row.animation_id;
        const output = row.model_output;
        if (!animations_by_id.has(animation_id)) {
            animations_by_id.set(animation_id, []);
        }
        animations_by_id.get(animation_id).push(output);
    }

    const total_animations = [];
    for (const [animation_id, animations] of animations_by_id.entries()) {
        boundary = getPathBBox(string, animation_id)
        const path_xmin = boundary[0];
        const path_xmax = boundary[1];
        const path_ymin = boundary[2];
        const path_ymax = boundary[3];
        const xmin = path_xmin - logo_xmin;
        const xmax = logo_xmax - path_xmax;
        const ymin = path_ymin - logo_ymin;
        const ymax = logo_ymax - path_ymax;

        const animations_by_type = new Map();
        for (const animation of animations) {
            if (animation[0] === 1) continue;
            try {
                const animation_type = animation.slice(1, 10).indexOf(1);
                if (!animations_by_type.has(animation_type)) {
                    animations_by_type.set(animation_type, []);
                }
                animations_by_type.get(animation_type).push(animation);
            } catch (error) {
                console.log('Model output invalid: no animation type found');
                return;
            }
        }

        for (const [animation_type, animationList] of animations_by_type.entries()) {
            const current_animations = [];
            animationList.sort((a, b) => a[10] - b[10]); // Sort by begin
            for (let i = 0; i < animationList.length; i++) {
                const animation = animationList[i];
                let begin = animation[10];
                let dur = animation[11];
                let animationType;
                try {
                    animationType = animation.slice(1, 10).indexOf(1);
                } catch (error) {
                    console.log('Model output invalid: no animation type found');
                    return;
                }
                handleAnimation(animationType, animation, currentAnimations, xmin, xmax, ymin, ymax, begin, dur);
                
            }
            total_animations.push(...current_animations);
        }
    }
    _insert_animations(total_animations, logo_string, logo_string);
}

function handleAnimation(animationType, animation, currentAnimations, xmin, xmax, ymin, ymax) {

    switch (animationType) {
        case 1: // animation: translate
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
            let rotate_from_degree = animation[17];
            let rotate_to_degree;
            if (i < animationList.length - 1) {
                rotate_to_degree = animationList[i + 1][17];
            } else {
                rotate_to_degree = 360;
            }
            currentAnimations.push(_animation_rotate(animation_id, begin, dur, rotate_from_degree, rotate_to_degree));
            break;
        case 5: // animation: skewX
            let skewX_from_x = animation[18];
            let skewX_to_x;
            if (i < animationList.length - 1) {
                skewX_to_x = animationList[i + 1][18];
            } else {
                skewX_to_x = 1;
            }
            skewX_from_x = Math.min(Math.max(skewX_from_x, xmin), xmax);
            skewX_to_x = Math.min(Math.max(skewX_to_x, xmin), xmax);
            currentAnimations.push(_animation_skewX(animation_id, begin, dur, skewX_from_x, skewX_to_x));
            break;
        case 6: // animation: skewY
            let skewY_from_y = animation[19];
            let skewY_to_y;
            if (i < animationList.length - 1) {
                skewY_to_y = animationList[i + 1][19];
            } else {
                skewY_to_y = 1;
            }
            skewY_from_y = Math.min(Math.max(skewY_from_y, ymin), ymax);
            skewY_to_y = Math.min(Math.max(skewY_to_y, ymin), ymax);
            currentAnimations.push(_animation_skewY(animation_id, begin, dur, skewY_from_y, skewY_to_y));
            break;
        case 7: // animation: fill
            let from_rgb = '#' + _convertToHexStr(animation[20]) + _convertToHexStr(animation[21]) + _convertToHexStr(animation[22]);
            let to_rgb;
            if (i < animationList.length - 1) {
                to_rgb = '#' + _convertToHexStr(animationList[i + 1][20]) + _convertToHexStr(animationList[i + 1][21]) + _convertToHexStr(animationList[i + 1][22]);
            } else {
                // Get fill style from SVG
                // Note: You need to implement getStyleAttributesPath function in JavaScript
                let fillStyle = getStyleAttributesPath(logoString, animation_id, "fill");
                let strokeStyle = getStyleAttributesPath(logoString, animation_id, "stroke");
                if (fillStyle === "none" && strokeStyle !== "none") {
                    colorHex = strokeStyle;
                } else {
                    colorHex = fillStyle;
                }
                to_rgb = colorHex;
            }
            currentAnimations.push(_animation_fill(animation_id, begin, dur, from_rgb, to_rgb));
            break;
        case 8: // animation: opacity
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
            let blur_from_f = animation[24];
            let blur_to_f;
            if (i < animationList.length - 1) {
                blur_to_f = animationList[i + 1][24];
            } else {
                blur_to_f = 1;
            }
            currentAnimations.push(_animation_blur(animation_id, begin, dur, blur_from_f, blur_to_f));
            break;
        default:
            console.log('Unknown animation type:', animationType);
            break;
    }
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

function _animation_rotate(animation_id, begin, dur, from_degree, to_degree) {
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
        from: `${from_degree}`,
        to: `${to_degree}`
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
        animation_type: 'animate_transform',
        attributeName: 'transform',
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
        animation_type: 'animate_transform',
        attributeName: 'transform',
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

function _insert_animations(animations, logo_string) {
    console.log('Insert animations');
    const document = new DOMParser().parseFromString(logo_string, 'image/svg+xml');
    const elements = document.getElementsByTagName('path').concat(document.getElementsByTagName('circle'))
        .concat(document.getElementsByTagName('ellipse')).concat(document.getElementsByTagName('line'))
        .concat(document.getElementsByTagName('polygon')).concat(document.getElementsByTagName('polyline'))
        .concat(document.getElementsByTagName('rect')).concat(document.getElementsByTagName('text'));

    for (const animation of animations) {
        let current_element = null;
        for (const element of elements) {
            if (element.getAttribute('animation_id') === animation.animation_id.toString()) {
                current_element = element;
                break;
            }
        }
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
                const [filter_element, filter_id] = _get_filter_element(document);
                animate_statement = _create_animate_statement(animation);
                filter_element.appendChild(animate_statement);
                current_element.setAttribute('filter', `url(#${filter_id})`);
                break;
        }
        if (animate_statement) {
            current_element.appendChild(animate_statement);
        }
    }

    const result = new XMLSerializer().serializeToString(document);
    console.log(result);
    return result;
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
    return animate;
}

function _get_filter_element(document) {

    const filter_elements = document.getElementsByTagName('filter');
    if (filter_elements.length > 0) {
        filter_id = filter_elements[0].getAttribute('id');
    } else {
        const filter_element = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter_id = filter_id + 1;
        filter_element.setAttribute('id', `filter${filter_id}`);
        filter_element.setAttribute('width', '150%');
        filter_element.setAttribute('height', '150%');
        document.documentElement.appendChild(filter_element);
    }
    return [document.getElementById(`filter${filter_id}`), filter_id];
}


function randomly_animate_logo(logo_path, target_path, number_of_animations, previously_generated) {
    // Implementation of randomly_animate_logo
}

// Function for testing
function test(){
    // Change model output
    model_output = []
    // Load logo
    $(document).ready(function () {
        $.get("https://cdn.worldvectorlogo.com/logos/keithley.svg", function (data) {
            animate_logo(model_output, data)
        });
    });
}
