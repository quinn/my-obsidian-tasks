import { Editor, MarkdownFileInfo, MarkdownView, Plugin } from 'obsidian'
import { curry, join, pipe, reverse, split } from 'https://esm.sh/rambda@8.6.0'
import { extractPath, findDailyNotes, makeNoteNavLink } from './src/util.ts'
import { NOTE_NAV_LINE } from './src/const.ts'

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
}

export default class MyPlugin extends Plugin {
	settings?: MyPluginSettings

	async onload() {
		await this.loadSettings()

		const statusBarItemEl = this.addStatusBarItem()
		statusBarItemEl.setText('🔗')

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'fix-daily-notes-command',
			name: 'Fix daily notes links',
			editorCallback: (
				editor: Editor,
				_view: MarkdownView | MarkdownFileInfo,
			) => {
				const dailyNotes = findDailyNotes(this.app.vault.getFiles())
				const noteNav = editor.getLine(NOTE_NAV_LINE)

				const newNoteNav = pipe(
					split(' | '),
					curry((links: string[]) => {
						const prevPath = extractPath(links[0])
						const notesLink = links[1]
						const nextPath = extractPath(links[2])

						const newPrevPath = reverse(dailyNotes).find((f) =>
							f.path < prevPath
						)?.path

						if (!newPrevPath) {
							throw new Error(`No previous path for ${prevPath}`)
						}

						console.log(nextPath, dailyNotes.map((f) => f.path))
						const newNextPath = dailyNotes.find((f) => f.path > nextPath )
							?.path ?? nextPath

						const newLinks = [
							makeNoteNavLink(newPrevPath),
							notesLink,
							makeNoteNavLink(newNextPath, false),
						]

						return newLinks
					}),
					join(' | '),
				)(noteNav)

				editor.setLine(NOTE_NAV_LINE, newNoteNav)
			},
		})
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
