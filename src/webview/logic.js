// region helpers

console.log("Rodou");
function select(selector_string){
    return document.querySelector(selector_string);
}
function selectAll(selector_string){
    return document.querySelectorAll(selector_string);
}
// endregion
const vscode = acquireVsCodeApi();

document.addEventListener("DOMContentLoaded", make_logic);

function make_logic(){
    listen_to_pickers();

    select("#apply-button").addEventListener("click", apply_theme);
    select("#clear-button").addEventListener("click", () => {
        vscode.postMessage({type: "clear-theme"});
    });
}

function listen_to_pickers(){
    const pickers = selectAll("input[type='color']");

    pickers.forEach(function(picker){
        picker.addEventListener("input", () =>  {
            document.documentElement.style.setProperty(
                `--${picker.id}`,
                picker.value
            );

            console.log("chegou aqui");

        });
    });
}

function apply_theme(){
    const colors = {};

    const pickers = selectAll("input[type='color']");

    pickers.forEach(picker => {
        colors[picker.id] = picker.value;
    });

    vscode.postMessage({
        type: "apply-theme",
        colors: colors
    });
}