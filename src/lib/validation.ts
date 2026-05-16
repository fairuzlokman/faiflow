// Pure validators for form inputs. Returning a discriminated union (rather
// than throwing) keeps validation side-effect-free and easy to test.

export type ValidationResult = { ok: true } | { ok: false; message: string }

export const TITLE_MAX = 80
export const DESCRIPTION_MAX = 280
export const COMMENT_MAX = 500

export const validateTitle = (value: string): ValidationResult => {
	const trimmed = value.trim()
	if (trimmed.length === 0) return { ok: false, message: 'Title is required.' }
	if (trimmed.length > TITLE_MAX) {
		return { ok: false, message: `Title must be ${TITLE_MAX} characters or fewer.` }
	}
	return { ok: true }
}

export const validateDescription = (value: string): ValidationResult => {
	if (value.length > DESCRIPTION_MAX) {
		return { ok: false, message: `Description must be ${DESCRIPTION_MAX} characters or fewer.` }
	}
	return { ok: true }
}

export const validateComment = (value: string): ValidationResult => {
	if (value.length > COMMENT_MAX) {
		return { ok: false, message: `Comment must be ${COMMENT_MAX} characters or fewer.` }
	}
	return { ok: true }
}

// Loose 24h "HH:MM" check; intentionally light because <input type="time">
// already enforces the format in the browser.
export const validateTime = (value: string): ValidationResult => {
	if (!/^\d{2}:\d{2}$/.test(value)) {
		return { ok: false, message: 'Time must be in HH:MM format.' }
	}
	return { ok: true }
}
