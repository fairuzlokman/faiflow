import { describe, it, expect } from 'vitest'
import {
	validateTitle,
	validateDescription,
	validateComment,
	validateTime,
	TITLE_MAX,
	DESCRIPTION_MAX,
} from '@/lib/validation'

describe('validateTitle', () => {
	it('rejects empty strings', () => {
		expect(validateTitle('')).toEqual({ ok: false, message: 'Title is required.' })
	})

	it('rejects whitespace-only strings', () => {
		expect(validateTitle('   ')).toEqual({ ok: false, message: 'Title is required.' })
	})

	it('accepts a normal title', () => {
		expect(validateTitle('Welcome Message')).toEqual({ ok: true })
	})

	it('rejects titles over the max length', () => {
		const tooLong = 'a'.repeat(TITLE_MAX + 1)
		const result = validateTitle(tooLong)
		expect(result.ok).toBe(false)
	})

	it('accepts titles exactly at the max length', () => {
		expect(validateTitle('a'.repeat(TITLE_MAX))).toEqual({ ok: true })
	})
})

describe('validateDescription', () => {
	it('treats empty as ok (description is optional)', () => {
		expect(validateDescription('')).toEqual({ ok: true })
	})

	it('rejects descriptions over the max length', () => {
		expect(validateDescription('a'.repeat(DESCRIPTION_MAX + 1)).ok).toBe(false)
	})
})

describe('validateComment', () => {
	it('accepts empty comments', () => {
		expect(validateComment('')).toEqual({ ok: true })
	})
})

describe('validateTime', () => {
	it('accepts HH:MM', () => {
		expect(validateTime('09:00')).toEqual({ ok: true })
		expect(validateTime('23:59')).toEqual({ ok: true })
	})

	it('rejects malformed strings', () => {
		expect(validateTime('9:00').ok).toBe(false)
		expect(validateTime('').ok).toBe(false)
	})
})
