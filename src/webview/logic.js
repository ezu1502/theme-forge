// region helpers
console.log("logic.js loaded!");

const themes = {
    default: {
        "window-color": "#191a1b",
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
    },

    minimalist: {
        "window-color": "#121314",
        "background": "#181a1b",
        "foreground": "#EEEEEE",
        "plain-code": "#cccccc",
        "keyword": "#9a57ff",
        "function": "#a8c2ff",
        "string": "#ad91ee",
        "primitive-type": "#5374f9",
        "library-type": "#c64cc8",
        "modifier": "#9a57ff",
        "constant": "#80ffb7",
        "parameter": "#FFA657",
        "comment": "#8B949E"
    },

    future: {
        "window-color": "#121314",
        "background": "#111716",
        "foreground": "#60e2c8",
        "plain-code": "#aadfdb",
        "keyword": "#3d7eff",
        "function": "#76cb7c",
        "string": "#5d6dbb",
        "primitive-type": "#d86dd9",
        "library-type": "#ff24cf",
        "modifier": "#3d7eff",
        "constant": "#ff7a7a",
        "parameter": "#fd1767",
        "comment": "#446f5b"
    },
    
    habanero: {
        "background": "#111111",
        "foreground": "#eeeeee",
        "plain-code": "#cbcda7",
        "keyword": "#ff7752",
        "function": "#f099af",
        "string": "#fdffa3",
        "primitive-type": "#ef3300",
        "library-type": "#bdd85a",
        "modifier": "#ced657",
        "constant": "#c4d7fd",
        "parameter": "#ff9e42",
        "comment": "#8b949e"
    },
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
    listen_to_hex_inputs();
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

    select("#github-button").addEventListener("click", () => {
        vscode.postMessage({
            type: "open-github"
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

    if (Object.keys(colors).length === 0){
        return update_pickers(themes.default);
    }

    const pickers = selectAll("input[type='color']");

    pickers.forEach(picker => {
        const color = colors[picker.id] ?? themes.default[picker.id];
        const hex_input = select(`#${picker.id}-hex`);

        picker.value = color;
        hex_input.value = color;

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
        });
    });

    document.addEventListener("click", event => {
        const menu = event.target.closest(".menu");

        menus.forEach(m => {

            const dropdown = m.querySelector(".dropdown");

            if ((menu === null || m !== menu) && (dropdown !== null)){
                dropdown.classList.remove("open");
            } 
        });
    }); 


    const export_button = select("#export-button");
    const import_button = select("#import-button");

    export_button.addEventListener("click", export_theme);
    import_button.addEventListener("click", import_theme);


    const help_button = select("#help-button");
    help_button.addEventListener("click", () => {
        select("#editor-page").classList.toggle("hidden");
        select("#help-page").classList.toggle("hidden");
    });


    const themes_dropdown = select("#themes-dropdown");

    const themes_options = themes_dropdown.querySelectorAll("button");

    themes_options.forEach(theme => {
        theme.addEventListener("click", () => {
            update_pickers(themes[theme.id]);

            menus.forEach(m => {
                m.querySelector(".dropdown")?.classList.remove("open");
            });
        });

        
    });



}

function listen_to_hex_inputs(){
    const hex_inputs = selectAll("input[type='text']");

    hex_inputs.forEach(input => {
        const color_id = input.id.replace("-hex", "");
        const picker = select(`#${color_id}`);

        input.addEventListener("input", () => {
            if (!input.value.startsWith("#")){
                input.value = "#" + input.value;
            }
            const color = input.value;

            if (!/^#[0-9A-Fa-f]{6}$/.test(color)){
                return;
            }

            picker.value = input.value;

            document.documentElement.style.setProperty(
                `--${picker.id}`,
                picker.value
            );
        });
    });
}

function listen_to_pickers(){
    const pickers = selectAll("input[type='color']");

    pickers.forEach(function(picker){
        const hex_input = select(`#${picker.id}-hex`);

        picker.addEventListener("input", () =>  {
            document.documentElement.style.setProperty(
                `--${picker.id}`,
                picker.value
            );

            hex_input.value = picker.value;
        });
    });
}

function clear_pickers(){
    update_pickers(themes.default);
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