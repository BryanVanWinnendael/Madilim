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

function activate(context) {
  const ROUNDED_CSS_URL =
    "https://raw.githubusercontent.com/BryanVanWinnendael/Madilim/main/rounded.css"

  const toggleCommand = vscode.commands.registerCommand(
    "madilim.toggleCustomCSS",
    async () => {
      // Check if vscode-custom-css is installed
      const customCssExtension = vscode.extensions.getExtension(
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
        await vscode.commands.executeCommand("extension.enableCustomCSS")
        await vscode.commands.executeCommand("extension.reloadCustomCSS")
        return
      }

      try {
        // Get current imports
        let imports = vscode.workspace
          .getConfiguration()
          .get("vscode_custom_css.imports")

        const isEnabled = imports && imports.includes(ROUNDED_CSS_URL)

        if (isEnabled) {
          // Disable by removing URL
          imports = imports.filter((url) => url !== ROUNDED_CSS_URL)
        } else {
          // Enable by adding URL
          imports = imports ? [...imports, ROUNDED_CSS_URL] : [ROUNDED_CSS_URL]
        }

        await vscode.workspace
          .getConfiguration()
          .update(
            "vscode_custom_css.imports",
            imports,
            vscode.ConfigurationTarget.Global
          )

        const action = await vscode.window.showInformationMessage(
          `Custom CSS has been ${
            isEnabled ? "disabled" : "enabled"
          }. VS Code needs to reload.`,
          "Reload Now"
        )

        if (action === "Reload Now") {
          await vscode.commands.executeCommand("extension.updateCustomCSS")
        }
      } catch (_err) {
        vscode.window.showErrorMessage("Failed to toggle custom CSS.")
      }
    }
  )

  context.subscriptions.push(toggleCommand)
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
