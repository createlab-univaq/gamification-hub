import {useEffect, useState} from "react";

export function useWindowSize() {

    const [size, setSize] = useState({
        width:window.innerWidth,
        height:window.innerHeight,
        isMobile: window.innerWidth < 500
    })

    const updateSize = () => {
        setSize({
            width: window.innerWidth,
            height: window.innerHeight,
            isMobile: window.innerWidth < 500
        })
    }

    useEffect(() => {
        window.addEventListener("resize", updateSize)
        return ()=>{
            window.removeEventListener("resize", updateSize)
        }
    }, []);

    return size

}