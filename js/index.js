$('.ui.modal').modal();

// $('.ui.dropdown').dropdown()

$('.ui.dropdown').dropdown()
$('.ui.dropdown').dropdown('toggle')

$('.ui.modal').modal('show');


$("#submit-button").on("click", function () {
    event.preventDefault();
    console.log($("#arrival-date").val())
    console.log($("#departure-date").val())
    console.log($("#cityPick").dropdown('get value'))
})