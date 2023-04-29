function OnbodyLoad() {
    ShowSkinList();
}

function ShowSkinList() {
    var skins = document.getElementById("skinList");

    for (var item of skinDataBySearch) {
        var bottomText = "Float range: " + (item.minFloat.toString() + " - " + item.maxFloat.toString());
        var onclick = `location.href = "./FloatFinder.html?item=` + item.skin + `"`;
        skins.appendChild(SkinThumbnail(item, ['col'], bottomText, onclick));
    }
}

function OnSearchChange() {
    var term = document.getElementById("searchInputfield").value.toLowerCase();
    var termSplit = term.split(' ');
    for (var skinImg of document.getElementsByClassName("skinImg")) {
        var skin = skinImg.getAttribute("data-skin").toLowerCase();
        var skinSplit = skin.split(' | ');

        if (skin.includes(term) || (skinSplit[0].includes(termSplit[0]) && skinSplit[1].includes(termSplit[1])) || skinData[skinImg.getAttribute("data-skin")].collection.toLowerCase().includes(term.toLowerCase())) {
            skinImg.parentElement.parentElement.parentElement.hidden = false;
        } else {
            skinImg.parentElement.parentElement.parentElement.hidden = true;
        }
    }
}