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
    const xmlDoc = parser.parseFromString(string, 'text/xml');
    return xmlDoc
}

function getStyleAttributesSVG(string) {
    const localStyles = getLocalStyleAttributes(string);
    const globalStyles = getGlobalStyleAttributes(string);
    const globalGroupStyles = getGlobalGroupStyleAttributes(string);
    return combineStyleAttributes(localStyles, globalStyles, globalGroupStyles);
}

function getStyleAttributesPath(string, animationId, attribute) {
    const styles = getStyleAttributesSVG(string);
    const stylesAnimationId = styles.filter(style => style.animation_id === animationId.toString());
    return stylesAnimationId[0][attribute];
}

function parseSVG(string) {
    const paths = [], attrs = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(string, 'image/svg+xml');
    const svgPaths = doc.querySelectorAll('path');
    svgPaths.forEach(path => {
        paths.push(path.getAttribute('d'));
        const animationId = path.getAttribute('animation_id');
        const style = path.getAttribute('style');
        const fill = path.getAttribute('fill') || '';
        const stroke = path.getAttribute('stroke') || '';
        const strokeWidth = path.getAttribute('stroke-width') || '';
        const opacity = path.getAttribute('opacity') || '';
        const strokeOpacity = path.getAttribute('stroke-opacity') || '';
        attrs.push({
            animation_id: animationId,
            style: style,
            fill: fill,
            stroke: stroke,
            stroke_width: strokeWidth,
            opacity: opacity,
            stroke_opacity: strokeOpacity
        });
    });
    return [paths, attrs];
}

function getLocalStyleAttributes(string) {
    const attributes = [];
    const [_, attrs] = parseSVG(string);
    for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        const animationId = attr['animation_id'];
        const class_ = '';
        let fill = '#000000';
        let stroke = '#000000';
        let strokeWidth = '0';
        let opacity = '1.0';
        let strokeOpacity = '1.0';
        if (attr['style']) {
            const a = attr['style'];
            if (a.includes('fill')) fill = a.split('fill:')[1].split(';')[0];
            if (a.includes('stroke')) stroke = a.split('stroke:')[1].split(';')[0];
            if (a.includes('stroke-width')) strokeWidth = a.split('stroke-width:')[1].split(';')[0];
            if (a.includes('opacity')) opacity = a.split('opacity:')[1].split(';')[0];
            if (a.includes('stroke-opacity')) strokeOpacity = a.split('stroke-opacity:')[1].split(';')[0];
        } else {
            if (attr['fill']) fill = attr['fill'];
            if (attr['stroke']) stroke = attr['stroke'];
            if (attr['stroke-width']) strokeWidth = attr['stroke-width'];
            if (attr['opacity']) opacity = attr['opacity'];
            if (attr['stroke-opacity']) strokeOpacity = attr['stroke-opacity'];
        }
        if (attr['class']) class_ = attr['class'];
        if (!fill.includes('#') && fill !== '') fill = transformToHex(fill);
        if (!stroke.includes('#') && stroke !== '') stroke = transformToHex(stroke);
        attributes.push({
            filename: string.split('.svg')[0],
            animation_id: animationId,
            class_: class_,
            fill: fill,
            stroke: stroke,
            stroke_width: strokeWidth,
            opacity: opacity,
            stroke_opacity: strokeOpacity
        });
    }
    return attributes;
}

function getGlobalStyleAttributes(string) {
    const doc = new DOMParser().parseFromString(string, 'image/svg+xml');
    const styleElements = doc.getElementsByTagName('style');
    const attributes = [];
    for (let i = 0; i < styleElements.length; i++) {
        const style = styleElements[i].textContent;
        const classes = style.split('}');
        for (let j = 0; j < classes.length - 1; j++) {
            const classString = classes[j].split('{')[0].trim();
            const styleString = classes[j].split('{')[1].trim();
            const attributesArray = styleString.split(';');
            const attributeObj = { class_: classString };
            attributesArray.forEach(attr => {
                if (attr.includes('fill:')) attributeObj.fill = attr.split('fill:')[1].trim();
                if (attr.includes('stroke:')) attributeObj.stroke = attr.split('stroke:')[1].trim();
                if (attr.includes('stroke-width:')) attributeObj.stroke_width = attr.split('stroke-width:')[1].trim();
                if (attr.includes('opacity:')) attributeObj.opacity = attr.split('opacity:')[1].trim();
                if (attr.includes('stroke-opacity:')) attributeObj.stroke_opacity = attr.split('stroke-opacity:')[1].trim();
            });
            if (!attributeObj.fill.includes('#') && attributeObj.fill !== '') attributeObj.fill = transformToHex(attributeObj.fill);
            if (!attributeObj.stroke.includes('#') && attributeObj.stroke !== '') attributeObj.stroke = transformToHex(attributeObj.stroke);
            attributes.push(attributeObj);
        }
    }
    return attributes;
}

function getGlobalGroupStyleAttributes(string) {
    const doc = new DOMParser().parseFromString(string, 'image/svg+xml');
    const groups = doc.getElementsByTagName('g');
    const attributes = [];
    for (let i = 0; i < groups.length; i++) {
        const style = groups[i].getAttribute('style') || '';
        const use = groups[i].getElementsByTagName('use');
        let href = '';
        if (use.length !== 0) href = use[0].getAttribute('xlink:href');
        let fill = '', stroke = '', stroke_width = '', opacity = '', stroke_opacity = '';
        if (style !== '') {
            const attributesArray = style.split(';');
            attributesArray.forEach(attr => {
                if (attr.includes('fill:')) fill = attr.split('fill:')[1].trim();
                if (attr.includes('stroke:')) stroke = attr.split('stroke:')[1].trim();
                if (attr.includes('stroke-width:')) stroke_width = attr.split('stroke-width:')[1].trim();
                if (attr.includes('opacity:')) opacity = attr.split('opacity:')[1].trim();
                if (attr.includes('stroke-opacity:')) stroke_opacity = attr.split('stroke-opacity:')[1].trim();
            });
        } else {
            fill = groups[i].getAttribute('fill') || '';
            stroke = groups[i].getAttribute('stroke') || '';
            stroke_width = groups[i].getAttribute('stroke-width') || '';
            opacity = groups[i].getAttribute('opacity') || '';
            stroke_opacity = groups[i].getAttribute('stroke-opacity') || '';
        }
        if (!fill.includes('#') && fill !== '') fill = transformToHex(fill);
        if (!stroke.includes('#') && stroke !== '') stroke = transformToHex(stroke);
        attributes.push({
            href: href.replace('#', ''),
            fill: fill,
            stroke: stroke,
            stroke_width: stroke_width,
            opacity: opacity,
            stroke_opacity: stroke_opacity
        });
    }
    return attributes;
}

function combineStyleAttributes(localStyles, globalStyles, globalGroupStyles) {
    // Implementation for combining style attributes
    // This function is left for implementation according to your requirements.
    // It should combine local, global, and global group styles according to specified priorities.
}
