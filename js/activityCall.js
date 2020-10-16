let tkn = ""
let acct = ""
gen()

//the tour call
$.ajax({
    url: "https://www.triposo.com/api/20200803/tour.json?location_ids=" + city + "&count=10&fields=all&order_by=-score&account=" + acct + "&token=" + tkn,
    method: "GET"
}).done(function (response) {
    console.log(response);
});


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