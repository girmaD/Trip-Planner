function restSearch(city, date, cityName) {
    //Triposo call for restaurant data, using city ID provided in call
    $.ajax({
        url: "https://www.triposo.com/api/20200803/poi.json?location_id=" + city + "&tag_labels=eatingout&count=25&fields=all&order_by=-score&account=" + acct + "&token=" + tkn,
        method: "GET"
    }).done(function (response) {
        //passes response to function, along with date and city name
        writeRest(response.results, date, cityName);
    });
}


function writeRest(results, date, cityName) {
    //Wipe any existing cards
    $("#planBody").html("")
    //scroll to top of window
    $(window).scrollTop(0)
    //create HTML objects for a header/title card
    let newCard = $("<div>").addClass("daily-activity ui centered raised fluid card")
    newCard.attr("style", "margin-top: 30px; padding: 10px; background-color: #fcf2cf;")
    //populate title card with kind of search done, and in what city
    let newTitle = $("<h2>").addClass("mainSectionHeader")
    newTitle.html('Top Restaurants in ' + cityName)
    newCard.append(newTitle)
    //add button to return to daily plan without adding anything
    let subTitle = $("<button>").addClass("resetBtn backBtn")
    subTitle.html("Click here to go back.")
    newCard.append(subTitle)
    //write title card to page
    $("#planBody").append(newCard)
    //create variable to track search result index
    let x = 0
    //iterate through search results to create a card for each
    for (let rest of results) {
        //create card
        let newCard = $("<div>").addClass("daily-activity ui centered raised fluid card")
        newCard.attr("style", "margin-top: 30px; padding: 0px; background-color: #fcf2cf;")
        //create header section for card
        let newHead = $("<div>").addClass("content dayHeaderContent")
        //add label with Restaurant's name, noting its index
        let newLabel = $("<div data-index=" + x + ">").addClass("srchHeader actName")
        newLabel.text(rest.name)
        newHead.append(newLabel)
        //add header to card
        newCard.append(newHead)
        //add body section
        let newBody = $("<div>").addClass("activityContent")
        newCard.append(newBody)
        //info section header
        newBody.append('<h4 class="ARheader">Info</h4>')
        //add intro paragraph from call
        newBody.append('<p class="intro" data-index=' + x + '>' + rest.intro + '</p>')
        //if there was a highlights section in search result, add as bullet points to card
        if (rest.highlights != null) {
            newBody.append('<h4 class="ARheader">Highlights</h4>')
            let newList = $("<ul>")
            for (let dot of rest.highlights) {
                let newDot = $("<li>").text(dot)
                newList.append(newDot)
            }
            newBody.append(newList)
        }
        //website header
        newBody.append('<h4 class="ARheader">Website</h4>')
        //link to restaurant's facebook page, if provided (call results don't generally have a website for the restaurants)
        if (rest.facebook_id) {
            newBody.append('<a class="restLink" target="_blank" data-index=' + x + ' href="https://facebook.com/profile.php?id=' + rest.facebook_id + '">More information here!</a>')
        } else {
            //if no facebook id, use the "attribution" section
            if (rest.attribution.length == 1) {
                //use first address if there is only one (usually openmap)
                newBody.append('<a class="restLink" target="_blank" data-index=' + x + ' href="' + rest.attribution[0].url + '">More information here!</a>')
            } else if (rest.attribution.length > 1) {
                //use the second if there's more than one (usually a wikivoyage or wikipedia page)
                newBody.append('<a class="restLink" target="_blank" data-index=' + x + ' href="' + rest.attribution[1].url + '">More information here!</a>')
            } else {
                //if also no attributions, give up.
                newBody.append("<p>(No website available.)</p>")
            }
        }
        //add button to save this restaurant to daily plan
        let newBtn = $("<div>").addClass("buttonContent")
        newBtn.append('<button data-index=' + x + ' data-date=' + date + ' class="rest-add ui button">Add to ' + dayjs(date).format('dddd[, ]M/D/YY') + '</button>')
        newCard.append(newBtn)
        $("#planBody").append(newCard)
        //loop to next result
        x++
    }
}
//listener and function for "save" buttons
$(document).on("click", ".rest-add", function () {
    //take date and index from button clicked
    let date = $(this).attr("data-date");
    let index = $(this).attr("data-index");
    //pull necessary data from card elements with the correct index
    let name = $(".actName[data-index='" + index + "']").html()
    let intro = $(".intro[data-index='" + index + "']").text()
    let link = $(".restLink[data-index='" + index + "']").attr('href')
    let newRest = {
        'name': name,
        'intro': intro,
        'link': link
    }
    //open plan from localStorage
    let daysPlan = JSON.parse(localStorage.getItem("tripPlanStorage"))
    //find index of date chosen
    let ind = daysPlan.dayArr.findIndex(x => x.date === date)
    //push restaurant data to plan array
    daysPlan.dayArr[ind].rest.push(newRest)
    //save new data object to localStorage
    localStorage.setItem("tripPlanStorage", JSON.stringify(daysPlan))
    //call function to write new plan
    writePlan(daysPlan)
})
