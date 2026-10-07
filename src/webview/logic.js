document.addEventListener("DOMContentLoaded", make_logic);

function make_logic(){
    listen_to_pickers();
}


function listen_to_pickers(){
    const pickers = document.querySelectorAll("input[type='color']");

    pickers.forEach(function(picker){
        picker.addEventListener("input", () =>  {
            document.documentElement.style.setProperty(
                `--${picker.id}`,
                picker.value
            );
        });
    });
}