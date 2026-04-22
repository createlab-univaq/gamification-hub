import * as Blockly from 'blockly'

// ─── FieldWithSuggestions ─────────────────────────────────────────────────────
// Extends FieldTextInput to attach a <datalist> to the native <input> that
// Blockly shows when the field enters edit mode. Gives browser-native
// autocomplete while still allowing any free-text value.

class FieldWithSuggestions extends Blockly.FieldTextInput {
    private suggestions: string[]

    constructor(value: string, suggestions: string[]) {
        super(value)
        this.suggestions = suggestions
    }

    static fromJson(options: Record<string, unknown>): FieldWithSuggestions {
        const text = (options['text'] as string) ?? ''
        const suggestions = (options['suggestions'] as string[]) ?? []
        return new FieldWithSuggestions(text, suggestions)
    }

    protected override showEditor_() {
        super.showEditor_()

        const input = this.htmlInput_
        if (!input) return

        // One shared datalist is fine — Blockly only edits one field at a time.
        const id = 'blockly-field-suggestions'
        let dl = document.getElementById(id) as HTMLDataListElement | null
        if (!dl) {
            dl = document.createElement('datalist')
            dl.id = id
            document.body.appendChild(dl)
        }

        dl.innerHTML = this.suggestions
            .map(s => `<option value="${s}">`)
            .join('')

        input.setAttribute('list', id)
    }
}

export function registerFields(): void {
    try {
        Blockly.fieldRegistry.register('field_suggestions', FieldWithSuggestions)
    } catch {
        // already registered — no-op on remount
    }
}
