// region helpers
console.log("logic.js loaded!");
const default_colors = {
    background: "#121314",
    foreground: "#B5CEA8",
    "plain-code": "#C9D1D9",
    keyword: "#FF7B72",
    function: "#D2A8FF",
    string: "#A5D6FF",
    "primitive-type": "#FF7B72",
    "library-type": "#4EC9B0",
    modifier: "#569CD6",
    constant: "#79C0FF",
    parameter: "#FFA657",
    comment: "#8B949E"
};

function select(selector_string){
    return document.querySelector(selector_string);
}
function selectAll(selector_string){
    return document.querySelectorAll(selector_string);
}
// endregion

let vscode;

if (typeof acquireVsCodeApi !== "undefined"){
    vscode = acquireVsCodeApi();
}


document.addEventListener("DOMContentLoaded", make_logic);

function make_logic(){
    listen_to_pickers();
    listen_to_buttons();
    listen_to_messages();
    listen_to_nav();
}

function listen_to_buttons(){
    select("#apply-button").addEventListener("click", apply_theme);
    
    select("#clear-edit-button").addEventListener("click", () => {
        vscode.postMessage({
            type: "clear-theme",
            commit: false
        });
    });

    select("#clear-changes-button").addEventListener("click", () => {
        vscode.postMessage({
            type: "clear-theme",
            commit: true
        });
    });

}

function listen_to_messages(){
    window.addEventListener("message", event => {
        if (event.data.type === "clear-theme"){
            clear_pickers();
        }
        if (event.data.type === "update-pickers"){
            update_pickers(event.data.colors);
        }
    });
}

function update_pickers(colors){
    const pickers = selectAll("input[type='color']");

    pickers.forEach(picker => {
        const color = colors[picker.id];
        picker.value = color;

        document.documentElement.style.setProperty(
            `--${picker.id}`,
            color
        );
    });
}

function listen_to_nav(){
    const menu_buttons = selectAll(".menu-button");
    const menus = selectAll(".menu");

    menu_buttons.forEach(button => {
        
        const dropdown = button.parentElement.querySelector(".dropdown");

        button.addEventListener("click", () => {
            dropdown.classList.toggle("open");
            console.log("click!");
        });
    });

    document.addEventListener("click", event => {
        const menu = event.target.closest(".menu");

        menus.forEach(m => {
            if (menu === null || m !== menu){
                m.querySelector(".dropdown").classList.remove("open");
            } 
        });
    }); 


    const export_button = select("#export-button");
    const import_button = select("#import-button");

    export_button.addEventListener("click", export_theme);
    import_button.addEventListener("click", import_theme);


    const help_button = select("#help-button");
    help_button.addEventListener("click", () => {
        // TODO CONTINUAR AQUI! Terminar o help-page
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

function clear_pickers(){
    const pickers = selectAll("input[type='color']");

    pickers.forEach(picker => {
        const color = default_colors[picker.id];
        picker.value = color;

        document.documentElement.style.setProperty(
            `--${picker.id}`,
            color
        );
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

function import_theme(){
    vscode.postMessage({
        type: "import-theme",
    });
}

function export_theme(){
    const colors = {};

    const pickers = selectAll("input[type='color']");

    pickers.forEach(picker => {
        colors[picker.id] = picker.value;
    });

    const theme_string = JSON.stringify(colors, null, 4);

    vscode.postMessage({
        type: "export-theme",
        theme: theme_string
    });
}