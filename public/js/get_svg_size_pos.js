import {elementToPath} from "./element-to-path/src/index"

function getSvgSize(string) {
    const doc = parseFromString(string);
    const svgElement = doc.getElementsByTagName('svg')[0];
    let width = svgElement.getAttribute('width') || "";
    let height = svgElement.getAttribute('height') || "";

    if (width !== "" && height !== "") {
        if (!/\d$/.test(width)) {
            width = width.replace('px', '').replace('pt', '');
        }
        if (!/\d$/.test(height)) {
            height = height.replace('px', '').replace('pt', '');
        }
    }

    if (width === "" || height === "" || !/\d$/.test(width) || !/\d$/.test(height)) {
        let xminSvg = 100, xmaxSvg = -100, yminSvg = 100, ymaxSvg = -100;
        const paths = svg2paths(string);
        paths.forEach(path => {
            const { xmin, xmax, ymin, ymax } = path.bbox();
            if (xmin < xminSvg) xminSvg = xmin;
            if (xmax > xmaxSvg) xmaxSvg = xmax;
            if (ymin < yminSvg) yminSvg = ymin;
            if (ymax > ymaxSvg) ymaxSvg = ymax;
            width = xmaxSvg - xminSvg;
            height = ymaxSvg - yminSvg;
        });
    }

    return [parseFloat(width), parseFloat(height)];
}

export function getSvgBBox(string) {
    try {
        const paths = svg2paths(string);
        let xminSvg = 100, xmaxSvg = -100, yminSvg = 100, ymaxSvg = -100;
        paths.forEach(path => {
            const { xmin, xmax, ymin, ymax } = path.bbox();
            if (xmin < xminSvg) xminSvg = xmin;
            if (xmax > xmaxSvg) xmaxSvg = xmax;
            if (ymin < yminSvg) yminSvg = ymin;
            if (ymax > ymaxSvg) ymaxSvg = ymax;
        });
        return [xminSvg, xmaxSvg, yminSvg, ymaxSvg];
    } catch (e) {
        console.log(`${string}: svg2path fails. SVG bbox is computed by using getSvgSize. ${e}`);
        const [width, height] = getSvgSize(string);
        return [0, width, 0, height];
    }
}

export function getPathBBox(string, animationId) {
    try {
        const paths = svg2paths(string);
        for (let i = 0; i < paths.length; i++) {
            if (paths[i].attributes.animation_id === animationId.toString()) {
                const { xmin, xmax, ymin, ymax } = paths[i].bbox();
                return [xmin, xmax, ymin, ymax];
            }
        }
    } catch (e) {
        console.log(`${string}, animation ID ${animationId}: svg2path fails and path bbox cannot be computed. ${e}`);
    }
    return [0, 0, 0, 0];
}

function getMidpointOfPathBBox(string, animationId) {
    try {
        const [xmin, xmax, ymin, ymax] = getPathBBox(string, animationId);
        const xMidpoint = (xmin + xmax) / 2;
        const yMidpoint = (ymin + ymax) / 2;
        return [xMidpoint, yMidpoint];
    } catch (e) {
        console.log(`Could not get midpoint for file ${string} and animation ID ${animationId}: ${e}`);
        return [0, 0];
    }
}

function getRelativePathPos(string, animationId) {
    const [pathMidpointX, pathMidpointY] = getMidpointOfPathBBox(string, animationId);
    const [svgXmin, svgXmax, svgYmin, svgYmax] = getSvgBBox(string);
    const relXPosition = (pathMidpointX - svgXmin) / (svgXmax - svgXmin);
    const relYPosition = (pathMidpointY - svgYmin) / (svgYmax - svgYmin);
    return [relXPosition, relYPosition];
}

function getRelativePosToBoundingBoxOfAnimatedPaths(string, animationId, animatedAnimationIds) {
    const [pathMidpointX, pathMidpointY] = getMidpointOfPathBBox(string, animationId);
    const [xmin, xmax, ymin, ymax] = getBBoxOfMultiplePaths(string, animatedAnimationIds);
    let relXPosition = 0.5, relYPosition = 0.5;

    try {
        relXPosition = (pathMidpointX - xmin) / (xmax - xmin);
    } catch (e) {
        console.log(`${string}, animation_id ${animationId}, animated_animation_ids ${animatedAnimationIds}: rel_x_position not defined and set to 0.5. ${e}`);
    }

    try {
        relYPosition = (pathMidpointY - ymin) / (ymax - ymin);
    } catch (e) {
        console.log(`${string}, animation_id ${animationId}, animated_animation_ids ${animatedAnimationIds}: rel_y_position not defined and set to 0.5. ${e}`);
    }

    return [relXPosition, relYPosition];
}

function getRelativePathSize(string, animationId) {
    const [svgXmin, svgXmax, svgYmin, svgYmax] = getSvgBBox(string);
    const svgWidth = svgXmax - svgXmin;
    const svgHeight = svgYmax - svgYmin;
    const [pathXmin, pathXmax, pathYmin, pathYmax] = getPathBBox(string, animationId);
    const pathWidth = pathXmax - pathXmin;
    const pathHeight = pathYmax - pathYmin;
    const relWidth = pathWidth / svgWidth;
    const relHeight = pathHeight / svgHeight;
    return [relWidth, relHeight];
}

function getBeginValuesByStartingPos(string, animationIds, start = 1, step = 0.5) {
    const startingPointList = [];
    const beginList = [];
    let begin = start;

    for (let i = 0; i < animationIds.length; i++) {
        const [x] = getPathBBox(string, animationIds[i]);
        startingPointList.push(x);
        beginList.push(begin);
        begin += step;
    }

    const animationIdOrder = startingPointList.map((_, index) => index).sort((a, b) => startingPointList[a] - startingPointList[b]);
    const beginValues = animationIdOrder.map(index => beginList[index]);

    return beginValues;
}

function svg2paths(string){
    document = parseFromString(string)
    elements = [];
    elements = elements.concat(document.getElementsByTagName('path'), document.getElementsByTagName('circle'), 
        document.getElementsByTagName('ellipse'), document.getElementsByTagName('line'), document.getElementsByTagName('polygon'),
        document.getElementsByTagName('polyline'), document.getElementsByTagName('rect'), document.getElementsByTagName('text'))
    for (element in elements){
        element = elementToPath(element)
    }
    return elements
}

function parseFromString(string){
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(string, 'image/svg+xml');
    return xmlDoc
}