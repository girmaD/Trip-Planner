//a file to hold the API call for activities
let day = moment();
let today = moment().format("L");
function buildZomatoUrl(){
    let url = "https://developers.zomato.com/api/v2.1/cities?";
    var queryParams = { "user-key": "98d23cca392225897709930429fe8c69"};
    // queryParams.lat = lat;
    // queryParams.lon = lon;   
    queryParams.q = "Seattle";
    return url + $.param(queryParams);    
}
// $.ajax(
//     {
//         url: buildZomatoUrl(),
//         method: "GET"
//     }
//     ).then(function(res){
//         console.log(res)
//     })
$("#plan-header").html(`${today}'s Plans`);

let url = "https://www.triposo.com//api/20200803/poi.json?tag_labels=cuisine-Pizza&ag_labels=cuisine-Beer&location_id=Amsterdam&count=10&order_by=-score&fields=name,best_for,coordinates,core,id";

$.ajax({
    url: url,
    method: "GET"
}).then(function(res){
    console.log(res)
});