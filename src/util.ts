import { filter, pipe, prop, replace, sortBy } from 'https://esm.sh/rambda@8.6.0'
import type { TFile } from 'obsidian'

export const findDailyNotes = pipe(
	filter((f: TFile) => f.parent?.name === 'Daily'),
	sortBy(prop('name')),
)

export const extractPath = (link: string) => {
	const match = link.match(/\[\[(.*)\]\]/)

	if (!match) {
		throw new Error(`Invalid link ${link}`)
	}

	return match[1].split('|')[0] + '.md'
}

const dateFromPath = pipe(replace('.md', ''), replace('Daily/', ''))

const navIcon = (text: string, back: boolean) => back ? `‹‹ ${text}` : `${text} ››`

export const makeNoteNavLink = (path: string, back = true) => {
	return `[[${path.replace('.md', '')}|${navIcon(dateFromPath(path), back)}]]`
}
