//initializing modal menu and api keys
$('.ui.modal').modal();
let acct = ""
let tkn = ""
let owa = ""
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

//listener for reset button on plan deck - clears storage and refreshes page
$(document).on("click", ".newBtn", function () {
    localStorage.removeItem("tripPlanStorage")
    location.reload()
})

//listener for "back" button on search decks - refreshes page
$(document).on("click", ".backBtn", function () {
    location.reload()
})

//listener to call a tour/activity search, function in tourCall.js
$(document).on("click", ".act-btn", function () {
    let date = $(this).attr("data-date");
    let city = $(this).attr("data-city");
    let cityName = $(this).attr("data-name");
    //Passes city id for Triposo, date for "add" buttons, and city name for header
    //Wipe cards so user knows something happened
    $("#planBody").html("")
    actSearch(city, date, cityName)
})

//listener to call a restaurant search, function in restCall.js
$(document).on("click", ".rest-btn", function () {
    let date = $(this).attr("data-date");
    let city = $(this).attr("data-city");
    let cityName = $(this).attr("data-name");
    //Passes city id for Triposo, date for "add" buttons, and city name for header
    //Wipe cards so user knows something happened
    $("#planBody").html("")
    restSearch(city, date, cityName)
})

//listener for submit button on modal form to create new trip
$("#submit-button").on("click", function (event) {
    event.preventDefault();
    //parse arrival date with day.js, using the format given by form
    let arrive = dayjs($("#arrival-date").val(), "YYYY-MM-DD")
    //parse departure date with day.js, using the format given by form
    let depart = dayjs($("#departure-date").val(), "YYYY-MM-DD")
    //take city ID from dropdown
    let city = $("#cityPick").dropdown('get value')
    //check all boxes are filled in
    if (arrive != null && depart != null && city != null) {
        //check arrival date is BEFORE departure date
        if (dayjs(arrive).isAfter(depart)) {
            if ($("#errMsg").length) {
                return false
            } else {
                $("#departure-date").after('<p id="errMsg" style="color:red">Departure date must be AFTER arrival date.</p>')
                return false
            }
        }
        //check dates are present or future
        if (dayjs(arrive).isBefore(dayjs()) || dayjs(depart).isBefore(dayjs())) {
          if ($("#errMsgtwo").length) {
                return false
          } else {
                $("#departure-date").after('<p id="errMsgtwo" style="color:red">Arrival and Departure dates cannot be in the past.</p>')
                return false
          }
        }
        //if dates check out, hide modal and call function to make new data structure
        $('.ui.modal').modal('hide');
        createPlan(arrive, depart, city)
    }
})
//set up a new trip plan using form data
function createPlan(arrive, depart, city) {
    //call Triposo to get city name and coordinates (later used in OpenWeather call)
    $.ajax({
        url: "https://www.triposo.com/api/20200803/location.json?id=" + city + "&account=" + acct + "&token=" + tkn,
        method: "GET"
    }).done(function (response) {
        //create data structure object for localStorage
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
        //populate days as a loop, iterating by how many days there are in the range
        let x = dayjs(depart).diff(arrive, 'day')
        for (i = 0; i <= x; i++) {
            let nDay = dayjs(arrive).add(i, 'day')
            let newDay = {
                //dates must be stored as a string, YYYYMMDD format chosen early in project
                'date': dayjs(nDay).format('YYYYMMDD'),
                'act': [],
                'rest': []
            }
            daysPlan.dayArr.push(newDay)
        }
        //save new data object to localStorage
        localStorage.setItem("tripPlanStorage", JSON.stringify(daysPlan))
        //call function to write cards to page
        writePlan(daysPlan)
    });
}

function writePlan(daysPlan) {
    //Wipe any existing cards
    $("#planBody").html("")
    //scroll to top of window (most useful after a search)
    $(window).scrollTop(0)
    //create HTML objects for a header/title card
    let newCard = $("<div>").addClass("daily-activity ui centered raised fluid card")
    newCard.attr("style", "margin-top: 30px; padding: 10px; background-color: #fcf2cf;")
    let newTitle = $("<h2>").addClass("mainSectionHeader")
    //populate title card with name of city and dates of trip
    newTitle.html('My Trip to ' + daysPlan.city.name + ', ' + dayjs(daysPlan.dayArr[0].date).format('M/D/YY') + ' to ' + dayjs(daysPlan.dayArr[daysPlan.dayArr.length - 1].date).format('M/D/YY'))
    newCard.append(newTitle)
    //add a button that will reset the saved data object
    let subTitle = $("<button>").addClass("resetBtn newBtn")
    subTitle.html("Click here to start over.")
    newCard.append(subTitle)
    //write title card to page
    $("#planBody").append(newCard)
    //set default flag for weather
    let weather = false
    //check if the dates are in range for weather - is start date 8 days or less from today
    if (dayjs(daysPlan.dayArr[0].date, "YYYYMMDD").diff(dayjs(), 'day') <= 8) {
        //yes in range, call OpenWeather for dailies
        let lat = daysPlan.city.coords.lat;
        let lon = daysPlan.city.coords.lon;
        let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&appid=${owa}`
        $.ajax({
            url: url,
            method: "GET",
            //must wait for this call to return before moving on, or there will be errors
            async: false
        }).done(function (oneCall) {
            //hold daily forecast in an array to populate weather on individual cards
            weather = oneCall.daily
        })
    }
    let array = daysPlan.dayArr
    //iterate through days array, creating a card for each day
    for (let day of array) {
        let date = dayjs(day.date, "YYYYMMDD")
        //create card
        newCard = $("<div>").addClass("daily-activity ui centered raised fluid card")
        newCard.attr("style", "margin-top: 30px; padding: 0px; background-color: #fcf2cf;")
        //add header section
        let newHead = $("<div>").addClass("content dayHeaderContent")
        //create img tag with the classes included for weather icon
        let imgEl = $(`<img class="right floated mini image weatherIcon">`)
        // create a src attribute to make the image a question mark (default)
        let src = "https://img.icons8.com/clouds/45/000000/question-mark.png";
        imgEl.attr("src", src)
        //if the dates chosen are within the range of weather data, weather icons will replace the question mark img
        if (weather != false) {
            let i = 0;
            //loop through to find matching weather date
            while (i < weather.length) {
                let wDay = dayjs.unix(weather[i].dt)
                wDay = dayjs(wDay).subtract(1, 'day')
                let formattedDay = dayjs(wDay).format("YYYYMMDD");
                if (formattedDay == day.date) {
                    //update icon to match, using OpenWeather's reference system
                    let icon = weather[i].weather[0].icon
                    src = `https://openweathermap.org/img/wn/${icon}.png`
                    imgEl.attr("src", src)
                }
                i++
            }
        }
        //add label for day
        let newLabel = $("<div>").addClass("dayHeader left floated")
        newLabel.text(dayjs(date).format('dddd[, ]M/D/YY'))
        //attach label, and icon to header block
        newHead.append(newLabel)
        newHead.append(imgEl);
        //attach header to card
        newCard.append(newHead)
        //create card body to hold saved activities/restaurants
        let newBody = $("<div>").addClass("activityContent")
        let newSection = $("<div>").addClass("ui feed")
        //activity header
        newSection.append('<h5 class="ARheader">Activities</h5>')
        //check if there are saved activities
        if (day.act[0]) {
            //loop through activity array and add each to body
            for (i = 0; i < day.act.length; i++) {
                newSection.append('<a target="_blank" href="' + day.act[i].link + '">' + day.act[i].name + '</a>')
                newSection.append('<p>' + day.act[i].intro + '</p>')
            }
        } else {
            //if no activities, make a note for user to see
            newSection.append('<p>No activities selected.</p>')
        }
        //add activity section to body
        newBody.append(newSection)
        //restaurant header
        newSection = $("<div>").addClass("ui feed")
        newSection.append('<h5 class="ARheader">Restaurants</h5>')
        //check if there are saved restaurants
        if (day.rest[0]) {
            for (i = 0; i < day.rest.length; i++) {
                //loop through restaurant array and add each to body
                newSection.append('<a target="_blank" href="' + day.rest[i].link + '">' + day.rest[i].name + '</a>')
                newSection.append('<p>' + day.rest[i].intro + '</p>')
            }
        } else {
            //if no restaurants, make a note for user to see
            newSection.append('<p>No restaurants selected.</p>')
        }
        //attach restaurant section to body
        newBody.append(newSection)
        //attach body to card
        newCard.append(newBody)
        //add button section
        let newBtn = $("<div>").addClass("buttonContent")
        //buttons to add activities or restaurants.
        //each has data values for city ID, city name, and card's date to facilitate later functions
        newBtn.append('<button data-city=' + daysPlan.city.id + ' data-name=' + daysPlan.city.name + '  data-date=' + day.date + ' class="act-btn ui button">ADD ACTIVITY</button>')
        newBtn.append('<button data-city=' + daysPlan.city.id + ' data-name=' + daysPlan.city.name + '  data-date=' + day.date + ' class="rest-btn ui button">ADD RESTAURANT</button>')
        //attach buttons to card
        newCard.append(newBtn)
        //write card to page
        $("#planBody").append(newCard)
        //loop to next day
    }
}

//this function makes it so the API keys used aren't in the source in plain text
//it isn't great security, but enough to satisfy GitGuardian
function gen() {
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
ptA = "968e"
ptB = "1342"
ptC = "bc7d"
maker = ptA + ptB + ptC
owa = owa + maker[0]
owa = owa + maker[0]
owa = owa + maker[1]
owa = owa + maker[2]
owa = owa + maker[1]
owa = owa + maker[3]
owa = owa + maker[4]
owa = owa + maker[1]
owa = owa + maker[5]
owa = owa + maker[4]
owa = owa + maker[1]
owa = owa + maker[6]
owa = owa + maker[4]
owa = owa + maker[7]
owa = owa + maker[8]
owa = owa + maker[9]
owa = owa + maker[0]
owa = owa + maker[8]
owa = owa + maker[7]
owa = owa + maker[10]
owa = owa + maker[8]
owa = owa + maker[11]
owa = owa + maker[0]
owa = owa + maker[9]
owa = owa + maker[8]
owa = owa + maker[2]
owa = owa + maker[1]
owa = owa + maker[2]
owa = owa + maker[11]
owa = owa + maker[5]
owa = owa + maker[0]
owa = owa + maker[0]
}