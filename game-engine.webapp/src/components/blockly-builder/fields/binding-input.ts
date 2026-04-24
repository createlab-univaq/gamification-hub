import * as Blockly from 'blockly'

export class BindingInput extends Blockly.FieldTextInput {

    constructor(value: string) {
        super(value)
    }

    static fromJson(options: Record<string, unknown>): BindingInput {
        const text = (options['text'] as string) ?? ''
        if (text.startsWith("$")) {
            return new BindingInput(text.substring(1))
        }
        return new BindingInput(text)
    }

    protected override getValueFromEditorText_(text: string) {
        if (text) {
            return super.getValueFromEditorText_(text.startsWith("$") ? text.substring(1) : text)
        }
        return super.getValueFromEditorText_(text);
    }

    protected doClassValidation_(newValue?: string): string | null {
        return super.doClassValidation_(newValue && newValue.startsWith("$") ? newValue.substring(1) : newValue);
    }

}
