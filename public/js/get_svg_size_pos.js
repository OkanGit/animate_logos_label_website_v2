//import {elementToPath} from "./element-to-path/src/index"
// Compute the bounding box manually
function computeBoundingBox(svgElement) {
    // Get the viewBox dimensions
    const viewBox = svgElement.getAttribute('viewBox').split(' ').map(parseFloat);
    const viewBoxX = viewBox[0];
    const viewBoxY = viewBox[1];
    const viewBoxWidth = viewBox[2];
    const viewBoxHeight = viewBox[3];

    // Get the width and height attributes
    const width = parseFloat(svgElement.getAttribute('width'));
    const height = parseFloat(svgElement.getAttribute('height'));

    // Compute the scale factors
    const scaleX = width / viewBoxWidth;
    const scaleY = height / viewBoxHeight;

    // Compute the bounding box
    const minX = viewBoxX;
    const minY = viewBoxY;
    const maxX = viewBoxX + width;
    const maxY = viewBoxY + height;

    return { minX, minY, maxX, maxY };
}




function getSvgSize(document) {
    //const doc = parseFromString(string);
    const svgElement = document.getElementsByTagName('svg')[0];
    console.log(svgElement)
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
            const bbox = path.getBBox();
            const xmin = bbox.x;
            const xmax = bbox.x + bbox.width;
            const ymin = bbox.y;
            const ymax = bbox.y + bbox.height
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



/*export*/ function getSvgBBox(document) {
    let bbox = document.getElementsByTagName('svg')[0].getBBox();
    return bbox
    /*try {
        const paths = svg2paths(document);
        let xminSvg = 100, xmaxSvg = -100, yminSvg = 100, ymaxSvg = -100;
        paths.forEach(path => {
            console.log(path)
            let bbox = path.getBBox();
            console.log(bbox)
            const xmin = bbox.x;
            const xmax = bbox.x + bbox.width;
            const ymin = bbox.y;
            const ymax = bbox.y + bbox.height
            if (xmin < xminSvg) xminSvg = xmin;
            if (xmax > xmaxSvg) xmaxSvg = xmax;
            if (ymin < yminSvg) yminSvg = ymin;
            if (ymax > ymaxSvg) ymaxSvg = ymax;
        });
        return [xminSvg, xmaxSvg, yminSvg, ymaxSvg];
    } catch (e) {
        console.log(`${document}: svg2path fails. SVG bbox is computed by using getSvgSize. ${e}`);
        const [width, height] = getSvgSize(document);
        return [0, width, 0, height];
    }*/
}

/*export*/ function getPathBBox(document, animationId) {
    try {
        const paths = svg2paths(document);
        for (let i = 0; i < paths.length; i++) {
            if (paths[i].getAttribute('animation_id') == animationId) {
                const bbox = paths[i].getBBox();
                console.log('path')
                console.log(bbox)
                const xmin = bbox.x;
                const xmax = bbox.x + bbox.width;
                const ymin = bbox.y;
                const ymax = bbox.y + bbox.height
                return [xmin, xmax, ymin, ymax];
            }
        }
    } catch (e) {
        console.log(`${document}, animation ID ${animationId}: svg2path fails and path bbox cannot be computed. ${e}`);
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

function svg2paths(document){
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
    console.log(elements)
    elements.forEach(elementToPath)
    return elements
}

function parseFromString(string){
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(string, 'image/svg+xml');
    return xmlDoc
}