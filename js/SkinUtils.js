function SkinThumbnail(item, classes, bottomText, onclick, additionalTexts) {
    var div = createEl('div', classes);
    div.setAttribute("onclick", onclick);
    var card = div.appendChild(createEl('div', ['card', 'bg-light', 'shadow-sm'], {margin:"10px"}));
    var body = card.appendChild(createEl('div', ['card-body', rarityClass(item.rarity)], {width:"100%", height:"100%"}));

    var title = createEl('strong', null, {'top':'-15px'}, {'innerText':item.skin});
    var floatRange = createEl('strong', null, {'bottom':'-15px'}, {'innerText':bottomText});

    var floatRangeInvalidMin = createEl('div', ['invalid-range', 'invalid-range-min'], {left:"0%",width:(item.minFloat * 100 + "%")})
    var floatRangeInvalidMax = createEl('div', ['invalid-range', 'invalid-range-max'], {left:(item.maxFloat * 100 + "%"), width:((1 - item.maxFloat) * 100 + "%")})
    var floatRangeValid = createEl('div', ['valid-range'], {left:(item.minFloat * 100 + "%"), width:((item.maxFloat - item.minFloat) * 100 + "%")});

    card.appendChild(title);
    card.appendChild(floatRange);

    var floatRangeVisualizer = card.appendChild(createEl('div', [], {margin:"5px"}));

    floatRangeVisualizer.appendChild(floatRangeInvalidMin);
    floatRangeVisualizer.appendChild(floatRangeValid);
    floatRangeVisualizer.appendChild(floatRangeInvalidMax);

    if (additionalTexts) {
        for (var t of additionalTexts) {
            card.appendChild(createEl('p', null, t.offset, {'innerText':t.text}));
        }
    }

    body.appendChild(SkinImage(item));

    return div;
}

function SkinImage(item) {
    var img = document.createElement("img");
    img.setAttribute("src", item.img);
    img.setAttribute("alt", item.skin);
    img.setAttribute("data-skin", item.skin);
    img.setAttribute("width", "100%");
    img.classList.add("skinImg");
    return img;
}

function createEl(el, classes, styles, attributes) {
    var el = document.createElement(el);

    if (classes) {
        for (var c of classes) {
            el.classList.add(c);
        }
    }

    if (styles) {
        for (var s in styles) {
            el.style[s] = styles[s];
        }
    }

    if (attributes) {
        for (var a in attributes) {
            el[a] = attributes[a];
        }
    }

    return el;
}

function getIEEE754(x) {
    x = Number(x);
    var float = new Float32Array(1);
    float[0] = x;
    return float[0];
}

function rarityClass(rarity) {
    switch(rarity) {
        case "Consumer":
            return "bg-consumer";
        case "Industrial":
            return "bg-industrial";
        case "Mil-Spec":
            return "bg-milspec";
        case "Restricted":
            return "bg-restricted";
        case "Classified":
            return "bg-classified";
        case "Covert":
            return "bg-covert";
        default:
            return "bg-consumer";
    }
}