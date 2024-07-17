window.addEventListener('load',function(){
    fetch("./api/data.js")
    .then(function(data) {
        document.querySelector('#contentAll').classList.remove("d-none");
        console.log(data);
        document.querySelector('#mkl').classList.add("d-none");
    });
    
});
$media = $(window).width();
  
   
if($media >= 776){
    $("#sidebar").removeClass("toggleDeActive");
    $("#sidebar").addClass("w200");
}

if($media <= 776){
    
    $statToggle = false;
    console.log($statToggle);
    $('#toggle').on('click', function() {
        if(!$statToggle){
                console.log("Toggle Active");
                $statToggle = true;
                $("#navbar nav").removeClass("navbarDeActive");
                $("#navbar nav").addClass("navbarActive");
                $("#sidebar").removeClass("toggleActive");
                $("#sidebar").addClass("toggleActive");
                console.log($statToggle);
        }else{ 
            console.log("Toggle DeActive");
            $statToggle = false;
            $("#navbar nav").addClass("navbarDeActive");
            $("#navbar nav").removeClass("navbarActive");
            $("#sidebar").addClass("toggleActive");
            $("#sidebar").removeClass("toggleActive");
           
            console.log($statToggle);
        }
    });

    $("#sidebar").addClass("toggleDeActive");
    $("#sidebar").removeClass("w200");
}

let getData = async() => {
    let url = "./api/data.js";

    let get =   await fetch(url);
    let data = await get.json();

    return data;
}

console.log(getData());

// Data Tablees
var tables = new DataTable('#example', {
    ajax: './api/data.js',
    columns: [
        { data: 'name' },
        { data: 'position' },
        { data: 'office' },
        { data: 'extn' },
        { data: 'start_date' },
        { data: 'salary' }
    ],
    layout: {
        bottomStart: null
    },
    paging: false,
    scrollCollapse: true,
    scrollY: '20vh',
    processing: true,
    responsive: true,
    colReorder: true
});
