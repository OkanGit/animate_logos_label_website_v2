function svg2paths(document){
    elements = [];
    elements = elements.concat(document.getElementsByTagName('path'), document.getElementsByTagName('circle'), 
        document.getElementsByTagName('ellipse'), document.getElementsByTagName('line'), document.getElementsByTagName('polygon'),
        document.getElementsByTagName('polyline'), document.getElementsByTagName('rect'), document.getElementsByTagName('text'))
    for (element in elements){
        element = elementToPath(element)
    }
    return elements
}

function transformToHex(rgb) {
    if (rgb === 'none') {
        return '#000000';
    }
    if (rgb.includes('rgb')) {
        rgb = rgb.replace('rgb(', '').replace(')', '');
        if (rgb.includes('%')) {
            rgb = rgb.replace(/%/g, '');
            let rgbList = rgb.split(',');
            let rValue = Math.round(parseFloat(rgbList[0]) / 100 * 255);
            let gValue = Math.round(parseFloat(rgbList[1]) / 100 * 255);
            let bValue = Math.round(parseFloat(rgbList[2]) / 100 * 255);
            return '#' + ("0" + rValue.toString(16)).slice(-2) + ("0" + gValue.toString(16)).slice(-2) + ("0" + bValue.toString(16)).slice(-2);
        } else {
            let rgbList = rgb.split(',');
            let rValue = parseInt(rgbList[0]);
            let gValue = parseInt(rgbList[1]);
            let bValue = parseInt(rgbList[2]);
            return '#' + ("0" + rValue.toString(16)).slice(-2) + ("0" + gValue.toString(16)).slice(-2) + ("0" + bValue.toString(16)).slice(-2);
        }
    }
}


function getStyleAttributesSVG(document) {
    const localStyles = getLocalStyleAttributes(document);
    const globalStyles = getGlobalStyleAttributes(document);
    const globalGroupStyles = getGlobalGroupStyleAttributes(document);
    return combineStyleAttributes(localStyles, globalStyles, globalGroupStyles);
}

function getStyleAttributesPath(document, animationId, attribute) {
    const styles = getStyleAttributesSVG(document);
    const stylesAnimationId = styles.filter(style => style.animation_id == animationId);
    if (stylesAnimationId.length == 0){
        return null;
    }
    switch(attribute){
        case "fill":
            return stylesAnimationId[0].fill;
        case "stroke":
            return stylesAnimationId[0].stroke;
    }
}

function parseSVG(document) {
    const attrs = [];
    const svgPaths = document.querySelectorAll('path');
    svgPaths.forEach(path => {
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
    return attrs;
}

function getLocalStyleAttributes(document) {
    const attributes = [];
    const attrs = parseSVG(document);
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
            filename: "",
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

function getGlobalStyleAttributes(document) {
    const styleElements = document.getElementsByTagName('style');
    let attributes = []
    for (let i = 0; i < styleElements.length; i++) {
        const style = styleElements[i].textContent;
        const classes = style.split('}');
        for (let j = 0; j < classes.length - 1; j++) {
            if (classes[j] == "") continue;
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
            if (!attributeObj.hasOwnProperty('fill')){
                attributeObj.fill = 'none'
            }if (!attributeObj.hasOwnProperty('stroke')){
                attributeObj.stroke = 'none'
            }if (!attributeObj.hasOwnProperty('stroke-width')){
                attributeObj.stroke_width = 0
            }if (!attributeObj.hasOwnProperty('opacity')){
                attributeObj.opacity = 0
            }if (!attributeObj.hasOwnProperty('stroke-opacity')){
                attributeObj.stroke_opacity = 0
            }
            if (!attributeObj.fill.includes('#') && attributeObj.fill !== '') attributeObj.fill = transformToHex(attributeObj.fill);
            if (!attributeObj.stroke.includes('#') && attributeObj.stroke !== '') attributeObj.stroke = transformToHex(attributeObj.stroke);    

            attributes.push(attributeObj);
        }
    }
    return attributes;
}

function getGlobalGroupStyleAttributes(document) {
    const groups = document.getElementsByTagName('g');
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

function combineStyleAttributes(dfLocal, dfGlobal, dfGlobalGroups) {
    // Implementation for combining style attributes
    // This function is left for implementation according to your requirements.
    // It should combine local, global, and global group styles according to specified priorities.
    let dfStyles = [];
    
    if (dfGlobal.length === 0 && dfGlobalGroups.length === 0) {
        dfLocal.forEach(row => {
            row['href'] = "";
        });
        return dfLocal;
    }
    
    if (dfGlobal.length !== 0) {
        dfLocal.forEach(localRow => {
            let globalRow = dfGlobal.find(globalRow => globalRow['filename'] === localRow['filename'] && globalRow['class_'] === localRow['class_']);
            if (globalRow) {
                let style = {
                    'filename': localRow['filename'],
                    'animation_id': globalRow['animation_id'],
                    'class_': localRow['class_'],
                    'fill': globalRow['fill'],
                    'stroke': globalRow['stroke'],
                    'stroke_width': globalRow['stroke_width'],
                    'opacity': globalRow['opacity'],
                    'stroke_opacity': globalRow['stroke_opacity']
                };
                dfStyles.push(style);
            }
        });
    }
    
    if (dfGlobalGroups.length !== 0) {
        dfLocal.forEach(localRow => {
            let globalGroupRow = dfGlobalGroups.find(globalGroupRow => globalGroupRow['filename'] === localRow['filename'] && globalGroupRow['animation_id'] === localRow['animation_id']);
            if (globalGroupRow) {
                let style = {
                    'filename': localRow['filename'],
                    'animation_id': localRow['animation_id'],
                    'class_': localRow['class_'],
                    'href': globalGroupRow['href'] || '',
                    'fill': globalGroupRow['fill'],
                    'stroke': globalGroupRow['stroke'],
                    'stroke_width': globalGroupRow['stroke_width'],
                    'opacity': globalGroupRow['opacity'],
                    'stroke_opacity': globalGroupRow['stroke_opacity']
                };
                dfStyles.push(style);
            }
        });
    }
    
    return dfStyles;  
}
