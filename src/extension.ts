import * as vscode from 'vscode';

interface ThemeColors {
	"window-color": string;
    "background": string;
    "foreground": string;

    "plain-code": string;

    "keyword": string;
    "function": string;
    "string": string;

    "primitive-type": string;
    "library-type": string;

    "modifier": string;
    "constant": string;

	"parameter": string,
    "comment": string;
}

async function applyColors(colors: ThemeColors | null){
	const config = vscode.workspace.getConfiguration();

	if (colors === null){
		await config.update(
			"workbench.colorCustomizations",
			undefined,
			vscode.ConfigurationTarget.Global
		);

		await config.update(
			"editor.tokenColorCustomizations",
			undefined,
			vscode.ConfigurationTarget.Global
		);
		return;
	}

	await config.update(
		"workbench.colorCustomizations",
		{

			"titleBar.activeBackground":colors["window-color"],
			"activityBar.background": colors["window-color"],
			"sideBar.background": colors["window-color"],
			"statusBar.background": colors["window-color"],
			
			"editor.background": colors["background"],
			"editor.foreground": colors["foreground"]
		},
		vscode.ConfigurationTarget.Global
	);	

	await config.update(
		"editor.tokenColorCustomizations",
		{
			"textMateRules": [
				{
					"scope": "keyword.control",
					"settings": {
						"foreground": colors["keyword"]
					}
				},

				{
					"scope": "comment",
					"settings": {
						"foreground": colors["comment"]
					}
				},

				{
					"scope": "entity.name.function",
					"settings": {
						"foreground": colors["function"]
					}
				},

				{
					"scope": "constant",
					"settings": {
						"foreground": colors["constant"]
					}
				},

				{
					"scope": "storage.modifier",
					"settings": {
						"foreground": colors["modifier"]
					}
				},

				{
					"scope": "storage.type",
					"settings": {
						"foreground": colors["primitive-type"]
					}
				},

				{
					"scope": [
						"support.type",
						"support.class",
						"support.struct",
						"entity.name.type",
						"entity.name.class",
						"entity.name.namespace",
						"entity.other.attribute"
					],

					"settings": {
						"foreground": colors["library-type"]
					}
				},

				{
					"scope": "string",
					"settings": {
						"foreground": colors["string"]
					}
				},

				{
					"scope": "variable.parameter",
					"settings": {
						"foreground": colors["parameter"]
					}
				},
				

			]
		},
		vscode.ConfigurationTarget.Global
	);
}

async function openForge(context: vscode.ExtensionContext){
	const htmlPath = vscode.Uri.joinPath(
		context.extensionUri,
		'src',
		'webview',
		'index.html'
	);
	const html = await vscode.workspace.fs.readFile(htmlPath);
	const htmlContent = Buffer.from(html).toString('utf8');

	const cssPath = vscode.Uri.joinPath(
		context.extensionUri,
		'src',
		'webview',
		'style.css'
	);

	const jsPath = vscode.Uri.joinPath(
		context.extensionUri,
		'src',
		'webview',
		'logic.js'
	);
	

	const panel = vscode.window.createWebviewPanel(
		'themeForge',
		'Theme Forge',
		vscode.ViewColumn.One,
		{
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.joinPath(context.extensionUri, 'src', 'webview')
			]
		}
	);

	const cssUri = panel.webview.asWebviewUri(cssPath);
	const jsUri = panel.webview.asWebviewUri(jsPath);

	panel.webview.html = htmlContent.replace('style.css', cssUri.toString()).replace('logic.js', jsUri.toString());

	panel.webview.onDidReceiveMessage(async message => {
		if (message.type === "apply-theme"){
			const colors = message.colors as ThemeColors;

			await applyColors(colors);

			vscode.window.showInformationMessage("Theme applied successfully!");
		}

		if (message.type === "clear-theme"){
			let popup = message.commit ? "Theme cleared successfully!" : "Editor changes cleared!";

			if (message.commit){
				await applyColors(null);
			}

			panel.webview.postMessage({
				type: "clear-theme"
			});

			vscode.window.showInformationMessage(popup);
		}

		if (message.type === "export-theme"){
			const theme = message.theme;

			const pathUri = await vscode.window.showSaveDialog({
				defaultUri: vscode.Uri.file("forged-theme.json"),
				filters: {
					"JSON - Javascript Object Notation": ["json"]
				}
			});


			if (pathUri === undefined){
				return;
			}



			try {
				await vscode.workspace.fs.writeFile(
					pathUri,
					Buffer.from(theme, "utf8")
				);

				vscode.window.showInformationMessage("Theme exported successfully");
			}
			catch (error){
				vscode.window.showErrorMessage("Failed to export theme.");
			}
		}

		if (message.type === "import-theme"){
			const pathUris = await vscode.window.showOpenDialog({
				filters: {
					"JSON - Javascript Object Notation": ["json"]
				}
			});

			if (pathUris === undefined){
				return;
			}

			const pathUri = pathUris[0];

			const data = await vscode.workspace.fs.readFile(pathUri);
			const themeString = Buffer.from(data).toString("utf8");
			
			let colors;

			try {
				colors = JSON.parse(themeString);
			}
			catch (error){
				vscode.window.showErrorMessage("Couldn't import theme!");
				return;
			}

			panel.webview.postMessage({
				type: "update-pickers",
				colors: colors
			});

			vscode.window.showInformationMessage("Theme imported successfully!");
		}

		if (message.type === "open-github"){
			await vscode.env.openExternal(
				vscode.Uri.parse("https://github.com/ezu1502/theme-forge")
			);
		}
	});



}

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "theme-forge" is now active!');

	const disposable = vscode.commands.registerCommand(
		'theme-forge.open',

		() => {
			openForge(context);
		}
	);

	context.subscriptions.push(disposable);
}

export function deactivate() {
	applyColors(null);
}
