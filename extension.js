const vscode = require("vscode")

async function installCustomCssExtension() {
  try {
    await vscode.commands.executeCommand(
      "workbench.extensions.installExtension",
      "be5invis.vscode-custom-css"
    )
    return true
  } catch (err) {
    console.error("Failed to install Custom CSS extension:", err)
    return false
  }
}

async function activate(context) {
  const ROUNDED_CSS_URL =
    "https://raw.githubusercontent.com/BryanVanWinnendael/Madilim/main/rounded.css"

  let enableCommand = vscode.commands.registerCommand(
    "madilim.enableCustomCSS",
    async () => {
      // Check if vscode-custom-css is installed
      let customCssExtension = vscode.extensions.getExtension(
        "be5invis.vscode-custom-css"
      )

      if (!customCssExtension) {
        const installed = await installCustomCssExtension()
        if (!installed) {
          vscode.window.showErrorMessage(
            "Failed to install Custom CSS extension."
          )
          return
        }
      }

      try {
        // Update custom CSS settings with the URL
        let imports = vscode.workspace
          .getConfiguration()
          .get("vscode_custom_css.imports")

        if (imports && imports.includes(ROUNDED_CSS_URL)) {
          vscode.window.showInformationMessage("Custom CSS is already enabled.")
          return
        }

        imports = imports ? [...imports, ROUNDED_CSS_URL] : [ROUNDED_CSS_URL]

        await vscode.workspace
          .getConfiguration()
          .update(
            "vscode_custom_css.imports",
            imports,
            vscode.ConfigurationTarget.Global
          )

        const action = await vscode.window.showInformationMessage(
          "Custom CSS has been enabled. VS Code needs to reload.",
          "Reload Now"
        )

        if (action === "Reload Now") {
          await vscode.commands.executeCommand("workbench.action.reloadWindow")
        }
      } catch (err) {
        vscode.window.showErrorMessage("Failed to enable custom CSS.")
      }
    }
  )

  let disableCommand = vscode.commands.registerCommand(
    "madilim.disableCustomCSS",
    async () => {
      try {
        // Get the custom css settings and remove the URL
        let imports = vscode.workspace
          .getConfiguration()
          .get("vscode_custom_css.imports")

        if (!imports || !imports.includes(ROUNDED_CSS_URL)) {
          vscode.window.showInformationMessage(
            "Custom CSS is already disabled."
          )
          return
        }

        imports = imports.filter((url) => url !== ROUNDED_CSS_URL)

        await vscode.workspace
          .getConfiguration()
          .update(
            "vscode_custom_css.imports",
            imports,
            vscode.ConfigurationTarget.Global
          )

        const action = await vscode.window.showInformationMessage(
          "Custom CSS has been disabled. VS Code needs to reload.",
          "Reload Now"
        )

        if (action === "Reload Now") {
          await vscode.commands.executeCommand("workbench.action.reloadWindow")
        }
      } catch (err) {
        vscode.window.showErrorMessage("Failed to disable custom CSS.")
      }
    }
  )

  context.subscriptions.push(enableCommand, disableCommand)
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
