$('.ui.modal').modal();
let acct = ""
let tkn = ""
gen()

//check for existing plan - if none found show the new plan modal
if (localStorage.getItem("tripPlanStorage") == null) {
    $('.ui.dropdown').dropdown()
    $('.ui.modal').modal('show');
} else {
    console.log("nope")
    //if plan exists, parse it and call function to write plan cards
    let daysPlan = JSON.parse(localStorage.getItem("tripPlanStorage"))
    writePlan(daysPlan)
}

$(document).on("click", ".act-btn", function () {
    let date = $(this).attr("data-date");
    let city = $(this).attr("data-city");
    actSearch(city, date)
})

$("#submit-button").on("click", function () {
    event.preventDefault();
    let arrive = dayjs($("#arrival-date").val(), "YYYY-MM-DD")
    let depart = dayjs($("#departure-date").val(), "YYYY-MM-DD")
    let city = $("#cityPick").dropdown('get value')
    if (arrive != null && depart != null && city != null) {
        if (dayjs(arrive).isAfter(depart)) {
            if ($("#errMsg").length) {
                return false
            } else {
                $("#departure-date").after('<p id="errMsg" style="color:red">Departure date must be AFTER arrival date.</p>')
                return false
            }
        }
        $('.ui.modal').modal('hide');
        createPlan(arrive, depart, city)
    }
})
//set up a new trip plan
function createPlan(arrive, depart, city) {
    $.ajax({
        url: "https://www.triposo.com/api/20200803/location.json?id=" + city + "&account=" + acct + "&token=" + tkn,
        method: "GET"
    }).done(function (response) {
        let daysPlan = {
            'city': {
                'id': city,
                'name': response.results[0].name,
                'coords': {
                    'lat': response.results[0].coordinates.latitude,
                    'lon': response.results[0].coordinates.longitude
                }
            },
            'dayArr': [],
        }
        let x = dayjs(depart).diff(arrive, 'day')
        for (i = 0; i <= x; i++) {
            let nDay = dayjs(arrive).add(i, 'day')
            let newDay = {
                'date': dayjs(nDay).format('YYYYMMDD'),
                'act': [],
                'rest': [],
                'notes': ""
            }
            daysPlan.dayArr.push(newDay)
        }
        console.log(daysPlan)
        localStorage.setItem("tripPlanStorage", JSON.stringify(daysPlan))
        writePlan(daysPlan)
    });
}

function writePlan(daysPlan) {
    $("#planBody").html("")
    //set flag for weather
    let weather = false
    //check if the dates are in range for weather
    if (dayjs(daysPlan.dayArr[0].date).diff(dayjs(), 'day') <= 8) {
        //yes in range, change flag and call OpenWeather for dailies
        weather = true
    } else {
        weather = false
    }
    let array = daysPlan.dayArr
    for (let day of array) {
        let date = dayjs(day.date, "YYYYMMDD")
        let newCard = $("<div>").addClass("daily-activity ui centered raised fluid card")
        newCard.attr("style", "margin-top: 30px; padding: 0px; background-color: #fcf2cf;")
        let newHead = $("<div>").addClass("content dayHeaderContent")
        if (weather = true) {
            //insert icon from OpenWeather
            //<img class="right floated mini ui image" src="https://openweathermap.org/img/wn/50d@2x.png"/>
        }
        let newLabel = $("<div>").addClass("dayHeader")
        newLabel.text(dayjs(date).format('dddd[, ]M/D/YY'))
        newHead.append(newLabel)
        newCard.append(newHead)
        let newBody = $("<div>").addClass("activityContent")
        let newSection = $("<div>").addClass("ui feed")
        newSection.append('<h5 class="ARheader">Activities</h5>')
        //insert activity
        if (day.act[0]) {
            for (i = 0; i < day.act.length; i++) {
                newSection.append('<a target="_blank" href="' + day.act[i].link + '">' + day.act[i].name + '</a>')
                newSection.append('<p>' + day.act[i].intro + '</p>')
            }
        } else {
            newSection.append('<p>No activities selected.</p>')
        }
        newBody.append(newSection)
        //insert restaurant
        newSection = $("<div>").addClass("ui feed")
        newBody.append('<h5 class="ARheader">Restaurants</h5>')
        if (day.rest[0]) {
            for (i = 0; i < day.act.length; i++) {
                newBody.append('<a target="_blank" href="' + day.rest.link + '">').text(day.act.name)
                newBody.append('<p>').text(day.rest.intro)
            }
        } else {
            newBody.append('<p>No restaurants selected.</p>')
        }
        newCard.append(newBody)
        //add buttons
        let newBtn = $("<div>").addClass("buttonContent")
        newBtn.append('<button data-city=' + daysPlan.city.id + '  data-date=' + day.date + ' class="act-btn ui button">ADD ACTIVITY</button>')
        newBtn.append('<button data-city=' + daysPlan.city.id + '  data-date=' + day.date + ' class="rest-btn ui button">ADD RESTAURANT</button>')
        newCard.append(newBtn)
        $("#planBody").append(newCard)
    }
}

function gen() {
    //make stuff harder to copy paste
    let maker = "B"
    maker = maker + "0"
    maker = maker + "H"
    maker = maker + "P"
    maker = maker + "O"

    acct = acct + maker[0]
    acct = acct + maker[3]
    acct = acct + maker[2]
    acct = acct + maker[1]
    acct = acct + maker[0]
    acct = acct + maker[4]
    acct = acct + maker[2]
    acct = acct + maker[2]

    let ptA = "uh5"
    let ptB = "agyl"
    let ptC = "izr2"
    let ptD = "p98"
    maker = "fvxt"
    maker = maker + ptA + ptB + ptC + ptD

    tkn = tkn + maker[4]
    tkn = tkn + maker[5]
    tkn = tkn + maker[2]
    tkn = tkn + maker[15]
    tkn = tkn + maker[11]
    tkn = tkn + maker[0]
    tkn = tkn + maker[1]
    tkn = tkn + maker[6]
    tkn = tkn + maker[4]
    tkn = tkn + maker[12]
    tkn = tkn + maker[12]
    tkn = tkn + maker[13]
    tkn = tkn + maker[14]
    tkn = tkn + maker[7]
    tkn = tkn + maker[8]
    tkn = tkn + maker[11]
    tkn = tkn + maker[5]
    tkn = tkn + maker[9]
    tkn = tkn + maker[10]
    tkn = tkn + maker[2]
    tkn = tkn + maker[16]
    tkn = tkn + maker[9]
    tkn = tkn + maker[1]
    tkn = tkn + maker[2]
    tkn = tkn + maker[2]
    tkn = tkn + maker[7]
    tkn = tkn + maker[17]
    tkn = tkn + maker[9]
    tkn = tkn + maker[14]
    tkn = tkn + maker[9]
    tkn = tkn + maker[13]
    tkn = tkn + maker[3]
}