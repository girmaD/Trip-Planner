$('.ui.modal').modal();
let acct = ""
let tkn = ""
gen()

//check for existing plan - if none found show the new plan modal
if (localStorage.getItem("tripPlanStorage") == null) {
    $('.ui.dropdown').dropdown()
    $('.ui.modal').modal('show');
} else {
    //if plan exists, parse it and call function to write plan cards
    let daysPlan = JSON.parse(localStorage.getItem("tripPlanStorage"))
    writePlan(daysPlan)
}

$(document).on("click", ".resetBtn", function () {
    localStorage.removeItem("tripPlanStorage")
    location.reload()
})

$(document).on("click", ".act-btn", function () {
    let date = $(this).attr("data-date");
    let city = $(this).attr("data-city");
    let cityName = $(this).attr("data-name");
    actSearch(city, date, cityName)
})

$(document).on("click", ".rest-btn", function () {
    let date = $(this).attr("data-date");
    let city = $(this).attr("data-city");
    let cityName = $(this).attr("data-name");
    restSearch(city, date, cityName)
})

$("#submit-button").on("click", function (event) {
    event.preventDefault();
    let arrive = dayjs($("#arrival-date").val(), "YYYY-MM-DD")
    let depart = dayjs($("#departure-date").val(), "YYYY-MM-DD")
    let now = dayjs().format("YYYY-MM-DD");   
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
        if(dayjs(arrive).isBefore(now) && dayjs(depart).isBefore(now) ){           
            $("#departure-date").after('<p id="errMsg" style="color:red">Arrival and Departure dates cannot be in the past.</p>')
            return false
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
    $(window).scrollTop(0)
    let newCard = $("<div>").addClass("daily-activity ui centered raised fluid card")
    newCard.attr("style", "margin-top: 30px; padding: 10px; background-color: #fcf2cf;")
    let newTitle = $("<h2>").addClass("mainSectionHeader")
    newTitle.html('My Trip to ' + daysPlan.city.name + ': ' + dayjs(daysPlan.dayArr[0].date).format('M/D/YY') + ' to ' + dayjs(daysPlan.dayArr[daysPlan.dayArr.length - 1].date).format('M/D/YY'))
    newCard.append(newTitle)
    let subTitle = $("<button>").addClass("resetBtn")
    subTitle.html("Click here to start over.")
    newCard.append(subTitle)
    $("#planBody").append(newCard)
    //set flag for weather
    let weather = false
    //check if the dates are in range for weather
    if (dayjs(daysPlan.dayArr[0].date, "YYYYMMDD").diff(dayjs(), 'day') <= 8) {
        //yes in range, call OpenWeather for dailies
        let lat = daysPlan.city.coords.lat;
        let lon = daysPlan.city.coords.lon;
        let api = "99686e16316412bc9b27bd9cb868d399";
        let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&appid=${api}`
        $.ajax({
            url: url,
            method: "GET",
            async: false
        }).done(function (oneCall) {
            weather = oneCall.daily
        })
    } else {
        weather = false
    }
    let array = daysPlan.dayArr
    for (let day of array) {
        let date = dayjs(day.date, "YYYYMMDD")
        newCard = $("<div>").addClass("daily-activity ui centered raised fluid card")
        newCard.attr("style", "margin-top: 30px; padding: 0px; background-color: #fcf2cf;")
        let newHead = $("<div>").addClass("content dayHeaderContent")
        //create img tag with the classes included as shown
        let imgEl =$(`<img class="right floated mini image weatherIcon">`)
        // create a src attribute to make the image a question mark
        let src = "https://img.icons8.com/clouds/45/000000/question-mark.png";
        imgEl.attr("src", src)  
        //if the dates choses are with in the range of weather data, weather icons will replace the question mark img
        if (weather != false) {
                let i = 0;
                while (i < weather.length) {
                    let wDay = dayjs.unix(weather[i].dt)
                    wDay = dayjs(wDay).subtract(1, 'day')
                    let formattedDay = dayjs(wDay).format("YYYYMMDD");
                    if (formattedDay == day.date) {
                        let icon = weather[i].weather[0].icon
                        src = `https://openweathermap.org/img/wn/${icon}.png`
                        imgEl.attr("src", src)
                    }
                    i++
                }
        }
        let newLabel = $("<div>").addClass("dayHeader left floated")
        newLabel.text(dayjs(date).format('dddd[, ]M/D/YY'))
        newHead.append(newLabel)
        newHead.append(imgEl);
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
        newSection.append('<h5 class="ARheader">Restaurants</h5>')
        if (day.rest[0]) {
            for (i = 0; i < day.rest.length; i++) {
                newSection.append('<a target="_blank" href="' + day.rest[i].link + '">' + day.rest[i].name + '</a>')
                newSection.append('<p>' + day.rest[i].intro + '</p>')
            }
        } else {
            newSection.append('<p>No restaurants selected.</p>')
        }
        newBody.append(newSection)
        newCard.append(newBody)
        //add buttons
        let newBtn = $("<div>").addClass("buttonContent")
        newBtn.append('<button data-city=' + daysPlan.city.id + ' data-name=' + daysPlan.city.name + '  data-date=' + day.date + ' class="act-btn ui button">ADD ACTIVITY</button>')
        newBtn.append('<button data-city=' + daysPlan.city.id + ' data-name=' + daysPlan.city.name + '  data-date=' + day.date + ' class="rest-btn ui button">ADD RESTAURANT</button>')
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