import type {ReactNode} from "react";
import {useEffect, useState} from "react";
import {Autocomplete, Box, Button, Divider, FormControl, FormHelperText, Stack, TextField} from "@mui/material";
import {useTranslation} from "react-i18next";
import {CRON_PARTS, describeCron, toCronExpression, toCronParts} from "../utils/cron-utils.ts";
import {InfoOutlined} from "@mui/icons-material";

interface CronFieldProps {
    size?: "small" | "medium";
    value?: string
    onChange?: (value: string) => void
    onBlur?: () => void
    name?: string
    label?: string
    required?: boolean
    disabled?: boolean
    error?: boolean
    helperText?: ReactNode
}

export function CronField({
                              value,
                              onChange,
                              onBlur,
                              name,
                              label,
                              required,
                              disabled,
                              error,
                              helperText,
                              size
                          }: CronFieldProps) {
    const [t, i18n] = useTranslation()
    // The boxes hold their own text rather than reading it back out of the expression. Deriving them from
    // the value would make typing impossible wherever nothing feeds the value back, and would turn each
    // untouched box into a star the moment a neighbour is filled in.
    const [parts, setParts] = useState<string[]>(() => toCronParts(value))

    useEffect(() => {
        // Only a value from elsewhere is adopted: a reset, or an existing schedule arriving. What this
        // field itself just emitted is already on screen.
        if (toCronExpression(parts) === (value ?? "").trim()) {
            return
        }
        setParts(toCronParts(value))
        // parts is deliberately not a dependency: it changes as the reader types, and re-running then
        // would overwrite the keystroke with the value from before it.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    const change = (index: number, part: string) => {
        const next = parts.map((current, i) => i === index ? part : current)
        setParts(next)
        onChange?.(toCronExpression(next))
    }

    // Said in words rather than in fields, so a schedule can be checked without reading cron. It stands
    // in for the given text once there is something to read, and gives way again when the field is in
    // error, since a validation message matters more than a reading of what caused it.
    const sentence = parts.some(part => part.trim())
        ? describeCron(toCronExpression(parts), i18n.language)
        : undefined
    const hint = error ? helperText : sentence ?? helperText

    return <FormControl fullWidth={true} error={error} disabled={disabled} variant={"outlined"}>
        {/* A real fieldset with a legend, which is how an outlined field cuts the gap its label sits in.
            Drawing the label above instead would leave this field a row taller than its neighbours. */}
        <Box
            component={"fieldset"}
            sx={{
                m: 0,
                px: {xs: 0.5, sm: 1},
                py: 0,
                // The height is stated rather than grown into, because this legend is part of the layout
                // instead of being lifted out of it as an outlined input's is: left to itself the field
                // would stand as tall as a row plus its own label. Border-box keeps the focused border,
                // which thickens to two pixels, from adding to it.
                boxSizing: "border-box",
                height: size === "small" ? "2.5rem" : "3.5rem",
                borderRadius: 1,
                border: "1px solid",
                borderColor: error ? "error.main" : "divider",
                "&:hover": {borderColor: error ? "error.main" : "text.primary"},
                "&:focus-within": {
                    borderColor: error ? "error.main" : "primary.main",
                    borderWidth: 2
                }
            }}
        >
            {label &&
                <Box component={"legend"} sx={{
                    px: 0.5,
                    fontSize: "0.75rem",
                    display: "flex",
                    lineHeight: 1,
                    alignItems: "center",
                    color: error ? "error.main" : "text.secondary"
                }}>
                    {label}{required && " *"}
                    {/* component="a" opts out of the router: the theme makes every button's href a
                        router link, and this one leaves the application. It opens beside the form so a
                        half-filled schedule is not lost, and noreferrer keeps the console's URL private. */}
                    <Button
                        component={"a"}
                        href={"https://www.w3schools.com/tools/tool_cron_builder.php"}
                        target={"_blank"}
                        rel={"noreferrer"}
                        title={t("cron.help")}
                        aria-label={t("cron.help")}
                        sx={{p: 0, minWidth: 0, ml: 0.5}}
                    >
                        <InfoOutlined sx={{fontSize: "0.9rem"}}/>
                    </Button>
                </Box>}
            {/* The parts get a row of their own, so the dividers fall between them and not after the
                legend, which the row would otherwise count as its first child. */}
            <Stack
                direction={"row"}
                divider={<Divider orientation={"vertical"} flexItem={true}/>}
                sx={{alignItems: "center", height: "100%"}}
            >
                {CRON_PARTS.map((part, index) =>
                    <Autocomplete
                        key={part.key}
                        options={part.options}
                        size={size}
                        freeSolo={true}
                        autoHighlight={true}
                        filterSelectedOptions={true}
                        disabled={disabled}
                        disableClearable={true}
                        // Five boxes at four rem each cannot fit a narrow phone, so the floor drops and
                        // they share whatever the screen has. They still grow to fill a wider one.
                        sx={{flex: 1, minWidth: {xs: "2.5rem", sm: "4rem"}, px: {xs: 0.25, sm: 1}}}
                        inputValue={parts[index]}
                        onInputChange={(_, next) => change(index, next)}
                        onBlur={onBlur}
                        renderInput={(params) =>
                            <TextField
                                {...params}
                                fullWidth={true}
                                name={name ? `${name}-${part.key}` : undefined}
                                placeholder={"*"}
                                variant={"standard"}
                                slotProps={{
                                    ...params.slotProps,
                                    input: {...params.slotProps.input, disableUnderline: true},
                                    htmlInput: {
                                        ...params.slotProps.htmlInput,
                                        style: {textAlign: "center"}
                                    }
                                }}
                            />}
                    />
                )}
            </Stack>
        </Box>
        {/* No margin override: the outlined variant indents its helper text, and so do the fields above. */}
        {hint && <FormHelperText>{hint}</FormHelperText>}
    </FormControl>
}
