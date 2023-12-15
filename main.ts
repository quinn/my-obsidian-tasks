import {
	App,
	Editor,
	MarkdownFileInfo,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
} from 'obsidian'
import { compose, filter, prop, sortBy } from 'https://esm.sh/rambda@8.6.0'

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
}
const findDailyNotes = compose(
	filter((f: TFile) => f.parent?.name === 'Daily'),
	sortBy(prop('name')),
)

export default class MyPlugin extends Plugin {
	settings?: MyPluginSettings

	async onload() {
		await this.loadSettings()

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			'dice',
			'Sample Plugin',
			(_evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice('Hello from Deno')
			},
		)
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class')

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem()
		statusBarItemEl.setText('Status Bar Text')

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app, 'Woah!').open()
			},
		})

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Fix daily notes links',
			editorCallback: (
				editor: Editor,
				_view: MarkdownView | MarkdownFileInfo,
			) => {
				const dailyNotes = findDailyNotes(this.app.vault.getFiles())

				const line = editor.getLine(1)

				console.log(dailyNotes)
				console.log(line)

				// const cView = view as MarkdownView
				// const text = editor.getValue()
				// cView.app.fileManager.
				// cView.editor.setValue(text)

				new SampleModal(this.app, 'Done').open()
			},
		})

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(
					MarkdownView,
				)

				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app, 'Woah!').open()
					}

					// This command will only show up in Command Palette when the check function returns true
					return true
				}
			},
		})

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this))

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt)
		})

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			setInterval(() => console.log('setInterval'), 5 * 60 * 1000),
		)
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}
}

class SampleModal extends Modal {
	private text: string

	constructor(app: App, text: string) {
		super(app)
		this.text = text
	}

	onOpen() {
		const { contentEl } = this
		contentEl.setText(this.text)
	}

	onClose() {
		const { contentEl } = this
		contentEl.empty()
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const { containerEl } = this

		containerEl.empty()

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText((text) =>
				text
					.setPlaceholder('Enter your secret')
					.setValue(this.plugin.settings?.mySetting ?? '')
					.onChange(async (value) => {
						if (this.plugin.settings) {
							this.plugin.settings.mySetting = value
						} else {
							throw new Error('settings is missing')
						}
						await this.plugin.saveSettings()
					})
			)
	}
}
