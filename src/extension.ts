import * as vscode from 'vscode';

interface ThemeColors {
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
				}

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
		}

		if (message.type === "clear-theme"){
			await applyColors(null);
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
