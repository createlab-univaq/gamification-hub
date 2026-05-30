import {Box, Stack, Typography} from "@mui/material";
import {useRef, useState, type DragEvent} from "react";
import {CloudUpload, InsertDriveFile, DeleteForever} from "@mui/icons-material";

interface FileUploaderProps {
    multiple?: boolean
    disabled?:boolean
    acceptedMimeTypes?: string[]
    onChange?: (files: FileList) => void
}

export function FileUploader({acceptedMimeTypes, onChange, multiple, disabled}: FileUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [currentFiles, setCurrentFiles] = useState<FileList | undefined>(undefined)
    const [dragOver, setDragOver] = useState(false)

    const handleChangeEvent = (files: FileList) => {
        setCurrentFiles(files)
        onChange?.(files)
    }

    const handleDropEvent = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        setDragOver(false)
        handleChangeEvent(event.dataTransfer.files)
    }

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        setDragOver(true)
    }

    const handleRemoveFile = (index: number) => {
        if (!currentFiles) return
        const dt = new DataTransfer()
        Array.from(currentFiles).forEach((f, i) => {
            if (i !== index) dt.items.add(f)
        })
        handleChangeEvent(dt.files)
        if (inputRef.current) inputRef.current.value = ""
    }

    const files = currentFiles ? Array.from(currentFiles) : []

    return (
        <fieldset disabled={disabled}>
            <Box
                onClick={() => {
                    if(!disabled) {
                        inputRef.current?.click()
                    }
                }}
                onDrop={handleDropEvent}
                onDragOver={handleDragOver}
                onDragLeave={() => setDragOver(false)}
                sx={{
                    border: "2px dashed",
                    borderColor: dragOver ? "primary.main" : "divider",
                    borderRadius: 2,
                    p: 3,
                    minHeight: 160,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: 2,
                    cursor: "pointer",
                    bgcolor: dragOver ? "action.hover" : "transparent",
                    transition: "background-color 120ms, border-color 120ms",
                }}
            >
                <input
                    disabled={disabled}
                    ref={inputRef}
                    multiple={multiple}
                    type="file"
                    hidden
                    onChange={(event) => handleChangeEvent(event.target.files)}
                    accept={acceptedMimeTypes?.join(",")}
                />
                {files.length === 0 ? (
                    <Stack spacing={1} sx={{color: "text.secondary", alignItems:"center"}}>
                        <CloudUpload sx={{fontSize: 48}}/>
                        <Typography variant="body2">
                            Drag &amp; drop or click to upload
                        </Typography>
                    </Stack>
                ) : (
                    files.map((file, i) => (
                        <Stack
                            key={`${file.name}-${i}`}
                            spacing={0.5}
                            sx={{
                                position: "relative",
                                width: 96,
                                p: 1,
                                alignItems: "center",
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                                transition: "background-color 120ms"
                            }}
                        >
                            <DeleteForever
                                className="delete-icon"
                                onClick={(e) => {
                                    if(disabled) {
                                        return
                                    }
                                    e.stopPropagation()
                                    handleRemoveFile(i)
                                }}
                                sx={{
                                    position: "absolute",
                                    top: 2,
                                    right: 2,
                                    fontSize: 18,
                                    color: "error.main",
                                    cursor: "pointer",
                                    transition: "opacity 120ms, color 120ms",
                                    "&:hover": {color: "error.dark"},
                                }}
                            />
                            <InsertDriveFile sx={{fontSize: 40, color: "primary.main"}}/>
                            <Typography
                                variant="caption"
                                title={file.name}
                                sx={{
                                    width: "100%",
                                    textAlign: "center",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {file.name}
                            </Typography>
                        </Stack>
                    ))
                )}
            </Box>
        </fieldset>
    )
}
