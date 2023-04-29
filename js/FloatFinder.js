const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const loadedSkin = urlParams.get('item');
const skinDataDiv = document.getElementById("skinData");

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

let fillerCollections = [];

function OnbodyLoad() {
    var item = skinDataBySkin[loadedSkin];
    var bottomText = "Float range: " + (item.minFloat.toString() + " - " + item.maxFloat.toString());
    skinDataDiv.appendChild(SkinThumbnail(item, ['col'], bottomText, onclick));
    LoadAllCollectionsIntoDropdown();

    document.getElementById("stattrakDiv").hidden = !item.stattrackAvailable;
}

function OnFloatChanged() {
    var input = document.getElementById("floatInputField");
    var button = document.getElementById("FindTradeupButton");

    var inputValue = input.value;
    var item = skinDataBySkin[loadedSkin];

    inputValue = clamp(inputValue, item.minFloat, item.maxFloat);

    input.value = getIEEE754(inputValue);
    button.classList.remove("disabled");
}

function OnUseMaxOverpayChange() {
    var input = document.getElementById("useMaxOverpay");
    document.getElementById("maxOverpayInPercent").disabled = !input.checked;
}

function LoadAllCollectionsIntoDropdown() {
    class Collection {
        constructor(collection, skinsInTierAbove) {
            this.collection = collection;
            this.skinsInTierAbove = skinsInTierAbove;
        }
    }

    var collections = [];

    var dropdown = document.getElementById("collectionsList");
    dropdown.innerHTML = "";

    Object.keys(skinDataByCollection).forEach(collection => {
        var collectionSkins = Object.values(skinDataByCollection[collection]);
        
        //Abort when we require a statrak output but the collection is not available in stattrak
        if(document.getElementById("searchStattrak").checked && !collectionSkins[0].stattrackAvailable) {
            return;
        }

        //Abort when it's the same collection as the desired skin :P
        if(collection == skinDataBySkin[loadedSkin].collection) {
            return;
        }

        //Abort when the collection doesn't have the required tiers
        if(!(collectionSkins[collectionSkins.length-1].rarityNumber < skinDataBySkin[loadedSkin].rarityNumber)) {
            return;
        }

        if(!(collectionSkins[0].rarityNumber >= skinDataBySkin[loadedSkin].rarityNumber)) {
            return;
        }

        var skinsInTierAbove = collectionSkins.filter(obj => {
            return obj.rarityNumber == skinDataBySkin[loadedSkin].rarityNumber;
        })

        collections[collections.length] = new Collection(collection, skinsInTierAbove);
    });

    collections.sort((a,b) => a.skinsInTierAbove.length - b.skinsInTierAbove.length);

    collections.forEach(collection => {
        CreateCollectionDropdownEntry(collection.collection, dropdown, collection.skinsInTierAbove.length);
    });
}

function CreateCollectionDropdownEntry(collectionName, dropdown, countInTierAbove) {
    var label = createEl("label", ["col", "list-group-item"], {}, {});

    var checkbox = createEl('input', [], {}, {type:'checkbox'});
    checkbox.onclick = function() { AddToFillerList(collectionName) };
    label.appendChild(checkbox);

    label.appendChild(createEl('a', [], {}, {innerText:` ${collectionName} (${countInTierAbove})`}));

    dropdown.appendChild(label);
}

function AddToFillerList(collection) {
    var dropdown = document.getElementById("collectionsList");
    var sum = 0;

    for (i = 0; i < dropdown.getElementsByTagName('input').length; i++) {
        var item = dropdown.getElementsByTagName('input').item(i);

        if(item.type == 'checkbox' && item.checked) {
            sum++;
        }

        if(sum > 3) {
            alert("Can't select more than 3 filler collections");
            item.checked = false;
            return;
        }
    }

    if(fillerCollections.includes(collection)) {
        fillerCollections.splice(collection, 1);
    } else {
        fillerCollections[fillerCollections.length] = collection;
    }
}

function FindTradeupContract() {
    var selectedFloat = document.getElementById("floatInputField").value;
    var button = document.getElementById('FindTradeupButton');
    var loadingIcon = document.getElementById('loadingIcon');

    button.classList.add("disabled");
    document.getElementById("floatInputField").readOnly = true;
    loadingIcon.hidden = false;

    fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            skin: loadedSkin,
            floatValue: selectedFloat,
            useMaxOverpay: document.getElementById("useMaxOverpay").checked,
            maxOverpay: document.getElementById("maxOverpayInPercent").value,
            stattrak: document.getElementById("searchStattrak").checked,
            fillerCollections: fillerCollections,
            desiredChance: document.getElementById("desiredChance").value
        })
    }).then((res)=> res.json()).then((data)=>{
        if(data.charAt(0) != '{' || Object.keys(JSON.parse(data)).length === 0) {
            document.getElementById("error").hidden = false;
            document.getElementById("outputHolder").hidden = true;
            location.href = "#error";

            button.classList.remove("disabled");
            document.getElementById("floatInputField").readOnly = false;
            loadingIcon.hidden = true;

            return;
        }

        document.getElementById("error").hidden = true;
        document.getElementById("outputHolder").hidden = false;
        document.getElementById("output").textContent = '';

        var json = JSON.parse(data);
        var totalPrice = 0;

        button.classList.remove("disabled");
        document.getElementById("floatInputField").readOnly = false;
        loadingIcon.hidden = true;

        location.href = "#output";

        json.tradeUpSkins.forEach(current => {
            var div = document.getElementById("output");

            div.appendChild(OutputSkinThumbnail(current.name, current.floatValue, current.price, current.url, current.url.includes("StatTrak")));
            totalPrice += current.price;
        });

        document.getElementById("resultingFloat").textContent = json.averageFloat;
        document.getElementById("resultPrice").textContent = "$" + totalPrice.toFixed(2);
        document.getElementById("resultodds").textContent = (json.odds).toFixed(2) + "%";

        var collection = skinDataByCollection[skinDataBySkin[loadedSkin].collection];
        var skinsOnSameTier = 0;

        for (var key of Object.keys(collection)) {
            if(collection[key].rarityNumber == skinDataBySkin[loadedSkin].rarityNumber) {
                skinsOnSameTier++;
            }
        }
    });
}

function ItemReferal(skinName, price) {
    fetch('/itemRefered', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            skin: skinName,
            price: price
        })
    }).then((value) => { });
}

function OutputSkinThumbnail(skinName, floatValue, price, url, isStatTrak) {
    url = decodeURIComponent(url);
    var item = skinData[skinName.split(" (")[0]];

    var div = createEl('div', ['col']);
    var card = div.appendChild(createEl('div', ['card', 'bg-light', 'shadow-sm'], {margin:"10px"}));
    var body = card.appendChild(createEl('div', ['card-body', rarityClass(item.rarityNumber)], {width:"100%", height:"100%"}));

    var title = createEl('strong', null, {'top':'-15px'}, {'innerText':isStatTrak ? "StatTrak™ " + item.skin : item.skin});
    var floatValueText = createEl('strong', null, {'top':'-15px'}, {'innerText':"Float value: " + floatValue.toString().slice(0, -1)});
    var priceText = createEl('strong', null, {'top':'-15px'}, {'innerText':"$ " + price});

    var itemURL = createEl('a', ["btn", "btn-secondary"], {'top':'-15px'}, {innerText:"View market listing", href:url, target:"_blank"});
    itemURL.setAttribute("onclick", `ItemReferal("${skinName}", ${price})`);

    card.appendChild(title);
    card.appendChild(floatValueText);
    card.appendChild(priceText);
    card.appendChild(itemURL);

    body.appendChild(SkinImage(item));

    return div;
}