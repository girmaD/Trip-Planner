function actSearch(city, date) {
    //the tour call - tkn and acct are still around from index
    $.ajax({
        url: "https://www.triposo.com/api/20200803/tour.json?location_ids=" + city + "&count=25&fields=name,highlights,intro,vendor_tour_url&order_by=-score&account=" + acct + "&token=" + tkn,
        method: "GET"
    }).done(function (response) {
        console.log(response);
        writeSearch(response.results, date)
    });
}

function writeSearch(results, date) {
    $("#planBody").html("")
    let x = 0
    for (let act of results) {
        let newCard = $("<div>").addClass("daily-activity ui centered raised fluid card")
        let newHead = $("<div>").addClass("content")
        let newLabel = $("<div data-index=" + x + ">").addClass("header actName")
        newLabel.text(act.name)
        newHead.append(newLabel)
        newCard.append(newHead)
        let newBody = $("<div>").addClass("content")
        newBody.append('<h4 class="ui sub header">Info</h4>')
        newBody.append('<p class="intro" data-index=' + x + '>').text(act.intro)
        newBody.append('<h4 class="ui sub header">Website</h4>')
        newBody.append('<a class="actLink" target="_blank" data-index=' + x + ' href="' + act.vendor_tour_url + '">').text("More information here!")
        newCard.append(newBody)
        let newBtn = $("<div>").addClass("extra content")
        newBtn.append('<button data-index=' + x + ' data-date=' + date + ' class="add-btn ui basic green button">Add to ' + dayjs(date).format('dddd[, ]M/D/YY') + '</button>')
        newCard.append(newBtn)
        $("#planBody").append(newCard)
    }
}

$(document).on("click", ".add-btn", function () {
    let date = $(this).attr("data-date");
    let index = $(this).attr("data-index");
    let name = $(".actName[data-index='" + index + "']").text()
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
    writePlan(daysPlan)
})