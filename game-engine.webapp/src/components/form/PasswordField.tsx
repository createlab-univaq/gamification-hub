import {Button, InputAdornment, TextField} from "@mui/material";
import {useState} from "react";
import type {TextFieldProps} from "@mui/material/TextField";
import {Visibility, VisibilityOff} from '@mui/icons-material'

type PasswordFieldProps = Omit<TextFieldProps, "type" | "slotProps">

export function PasswordField(props: PasswordFieldProps) {

    const [visible, setVisible] = useState(false)

    return <TextField {...props}
                      type={visible ? "text" : "password"}
                      slotProps={{
                          input: {
                              endAdornment: <InputAdornment sx={{borderLeft: "1px gray solid"}} position={"end"}>
                                  <Button size={"small"}
                                          onClick={() => setVisible(!visible)}
                                  >
                                      {visible ? <Visibility/> : <VisibilityOff/>}
                                  </Button>
                              </InputAdornment>
                          }
                      }}
    />
}