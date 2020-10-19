function restSearch(city, date, cityName) {
    //rest
    $.ajax({
        url: "https://www.triposo.com/api/20200803/poi.json?location_id=" + city + "&tag_labels=eatingout&count=25&fields=all&order_by=-score&account=" + acct + "&token=" + tkn,
        method: "GET"
    }).done(function (response) {
        writeRest(response.results, date, cityName);
    });
}


function writeRest(results, date, cityName) {
    $("#planBody").html("")
    $(window).scrollTop(0)
    let newCard = $("<div>").addClass("daily-activity ui centered raised fluid card")
    newCard.attr("style", "margin-top: 30px; padding: 10px; background-color: #fcf2cf;")
    let newTitle = $("<h2>").addClass("mainSectionHeader")
    newTitle.html('Top Restaurants in ' + cityName)
    newCard.append(newTitle)
    let subTitle = $("<button>").addClass("resetBtn backBtn")
    subTitle.html("Click here to go back.")
    newCard.append(subTitle)
    $("#planBody").append(newCard)
    let x = 0
    for (let rest of results) {
        let newCard = $("<div>").addClass("daily-activity ui centered raised fluid card")
        newCard.attr("style", "margin-top: 30px; padding: 0px; background-color: #fcf2cf;")
        let newHead = $("<div>").addClass("content dayHeaderContent")
        let newLabel = $("<div data-index=" + x + ">").addClass("srchHeader actName")
        newLabel.text(rest.name)
        newHead.append(newLabel)
        newCard.append(newHead)
        let newBody = $("<div>").addClass("activityContent")
        newCard.append(newBody)
        newBody.append('<h4 class="ARheader">Info</h4>')
        newBody.append('<p class="intro" data-index=' + x + '>' + rest.intro + '</p>')
        if (rest.highlights != null) {
            newBody.append('<h4 class="ARheader">Highlights</h4>')
            let newList = $("<ul>")
            for (let dot of rest.highlights) {
                let newDot = $("<li>").text(dot)
                newList.append(newDot)
            }
            newBody.append(newList)
        }
        newBody.append('<h4 class="ARheader">Website</h4>')
        //link to restaurant's facebook page, if provided
        if (rest.facebook_id) {
            newBody.append('<a class="restLink" target="_blank" data-index=' + x + ' href="https://facebook.com/profile.php?id=' + rest.facebook_id + '">More information here!</a>')
        } else {
            //if no facebook id, use the "attribution" section
            if (rest.attribution.length == 1) {
                //use first address if there is only one
                newBody.append('<a class="restLink" target="_blank" data-index=' + x + ' href="' + rest.attribution[0].url + '">More information here!</a>')
            } else if (rest.attribution.length > 1) {
                newBody.append('<a class="restLink" target="_blank" data-index=' + x + ' href="' + rest.attribution[1].url + '">More information here!</a>')
            } else {
                //if also no attributions, give up.
                newBody.append("<p>(No website available.)</p>")
            }
        }
        let newBtn = $("<div>").addClass("buttonContent")
        newBtn.append('<button data-index=' + x + ' data-date=' + date + ' class="rest-add ui button">Add to ' + dayjs(date).format('dddd[, ]M/D/YY') + '</button>')
        newCard.append(newBtn)
        $("#planBody").append(newCard)
        x++
    }
}

$(document).on("click", ".rest-add", function () {
    let date = $(this).attr("data-date");
    let index = $(this).attr("data-index");
    let name = $(".actName[data-index='" + index + "']").html()
    let intro = $(".intro[data-index='" + index + "']").text()
    let link = $(".restLink[data-index='" + index + "']").attr('href')
    let newRest = {
        'name': name,
        'intro': intro,
        'link': link
    }
    let daysPlan = JSON.parse(localStorage.getItem("tripPlanStorage"))
    let ind = daysPlan.dayArr.findIndex(x => x.date === date)
    daysPlan.dayArr[ind].rest.push(newRest)
    localStorage.setItem("tripPlanStorage", JSON.stringify(daysPlan))
    writePlan(daysPlan)
})
