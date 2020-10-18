function actSearch(city, date) {
    //the tour call - tkn and acct are still around from index
    $.ajax({
        url: "https://www.triposo.com/api/20200803/tour.json?location_ids=" + city + "&count=25&fields=name,highlights,intro,vendor_tour_url&order_by=-score&account=" + acct + "&token=" + tkn,
        method: "GET"
    }).done(function (response) {
        console.log(response);
        writeAct(response.results, date)
    });
}

function writeAct(results, date) {
    $("#planBody").html("")
    $(window).scrollTop(0)
    let x = 0
    for (let act of results) {
        let newCard = $("<div>").addClass("daily-activity ui centered raised fluid card")
        newCard.attr("style", "margin-top: 30px; padding: 0px; background-color: #fcf2cf;")
        let newHead = $("<div>").addClass("content dayHeaderContent")
        let newLabel = $("<div data-index=" + x + ">").addClass("srchHeader actName")
        newLabel.text(act.name)
        newHead.append(newLabel)
        newCard.append(newHead)
        let newBody = $("<div>").addClass("activityContent")
        newCard.append(newBody)
        newBody.append('<h4 class="ARheader">Info</h4>')
        newBody.append('<p class="intro" data-index=' + x + '>' + act.intro + '</p>')
        if (act.highlights != null) {
            newBody.append('<h4 class="ARheader">Highlights</h4>')
            let newList = $("<ul>")
            for (let dot of act.highlights) {
                let newDot = $("<li>").text(dot)
                newList.append(newDot)
            }
            newBody.append(newList)
        }
        newBody.append('<h4 class="ARheader">Website</h4>')
        newBody.append('<a class="actLink" target="_blank" data-index=' + x + ' href="' + act.vendor_tour_url + '">More information here!</a>')
        let newBtn = $("<div>").addClass("buttonContent")
        newBtn.append('<button data-index=' + x + ' data-date=' + date + ' class="act-add ui button">Add to ' + dayjs(date).format('dddd[, ]M/D/YY') + '</button>')
        newCard.append(newBtn)
        $("#planBody").append(newCard)
        x++
    }
}

$(document).on("click", ".act-add", function () {
    let date = $(this).attr("data-date");
    let index = $(this).attr("data-index");
    let name = $(".actName[data-index='" + index + "']").html()
    let intro = $(".intro[data-index='" + index + "']").text()
    let link = $(".actLink[data-index='" + index + "']").attr('href')
    let newAct = {
        'name': name,
        'intro': intro,
        'link': link
    }
    let daysPlan = JSON.parse(localStorage.getItem("tripPlanStorage"))
    let ind = daysPlan.dayArr.findIndex(x => x.date === date)
    daysPlan.dayArr[ind].act.push(newAct)
    console.log(daysPlan)
    localStorage.setItem("tripPlanStorage", JSON.stringify(daysPlan))
    writePlan(daysPlan)
})