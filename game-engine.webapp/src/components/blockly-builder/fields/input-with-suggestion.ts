import * as Blockly from 'blockly'
import type {Block} from 'blockly'

type Suggestions = string[] | ((block: Block) => string[])

export class FieldWithSuggestions extends Blockly.FieldTextInput {
    private suggestions: Suggestions

    constructor(value: string, suggestions: Suggestions) {
        super(value)
        this.suggestions = suggestions
    }

    static fromJson(options: Record<string, unknown>): FieldWithSuggestions {
        const text = (options['text'] as string) ?? ''
        const suggestions = (options['suggestions'] as Suggestions) ?? []
        return new FieldWithSuggestions(text, suggestions)
    }

    private resolveSuggestions(): string[] {
        if (typeof this.suggestions === 'function') {
            return this.sourceBlock_ ? this.suggestions(this.sourceBlock_) : []
        }
        return this.suggestions
    }

    protected override showEditor_() {
        super.showEditor_()
        const input = this.htmlInput_
        if (!input) return

        const id = 'blockly-field-suggestions'
        let dl = document.getElementById(id) as HTMLDataListElement | null
        if (!dl) {
            dl = document.createElement('datalist')
            dl.id = id
            document.body.appendChild(dl)
        }

        dl.replaceChildren(...this.resolveSuggestions().map(s => {
            const option = document.createElement('option')
            option.value = s
            return option
        }))

        input.setAttribute('list', id)
    }
}
