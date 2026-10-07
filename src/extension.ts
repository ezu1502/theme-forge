import * as vscode from 'vscode';

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

export function deactivate() {}
