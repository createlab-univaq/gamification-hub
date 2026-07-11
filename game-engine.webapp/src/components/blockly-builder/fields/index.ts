import * as Blockly from "blockly";
import {FieldWithSuggestions} from "./input-with-suggestion.ts";
import {BindingInput} from "./binding-input.ts";

export function registerFields(): void {
    try {
        Blockly.fieldRegistry.register('binding_input', BindingInput)
        Blockly.fieldRegistry.register('field_suggestions', FieldWithSuggestions)
    } catch {
        // already registered — no-op on remount
    }
}