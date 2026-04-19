import type {SxProps} from "@mui/material"
import {Stack} from "@mui/material";
import {useEffect, useState} from "react";
import ReactCodeMirror from "@uiw/react-codemirror";
import {java} from "@codemirror/lang-java";
import {useThemeProvider} from "../../theme/ThemeProvider.tsx";

interface DroolEditorProps {
    sx?: SxProps
    drl?: string
    onChange?: (drl: string) => void
    readonly?: boolean
}

export function DroolEditor({readonly, onChange, drl, sx}: DroolEditorProps) {

    const [code, setCode] = useState(drl)
    const {mode} = useThemeProvider()

    useEffect(() => {
        setCode(drl)
    }, [drl]);

    return <Stack sx={{
        cursor: readonly ? "not-allowed" : "",
        ...(sx ?? {})
    }}>
        <ReactCodeMirror
            readOnly={readonly}
            height={sx.height}
            value={code}
            onChange={(value) => {
                onChange?.(value)
                setCode(code)
            }}
            theme={mode}
            extensions={[java()]}
            placeholder={"// Start creating you drool rule"}
            basicSetup={{
                lineNumbers: true,
                highlightActiveLine: true,
                bracketMatching: true,
                allowMultipleSelections: true,
                history: true,
                autocompletion: true,
                syntaxHighlighting: !readonly,
                tabSize: 3
            }}
        />
    </Stack>

}