import React, {useCallback, useMemo, useRef, useState} from "react";
import {SliderHandle, SliderInput, SliderMarker, SliderRange, SliderTrack,} from "@reach/slider";
import {useToasts} from "react-toast-notifications";
import {setGraphData, useGraphContext} from "../contexts/GraphContext";
import {getState, step, stop} from "../utils/rest/simulation"
import {useRouter} from "next/router";
import ClipLoader from "react-spinners/ClipLoader";

export default function Configuration() {
    const intervalId = useRef(null);
    const {addToast} = useToasts();
    const {setGraphState} = useGraphContext();
    const router = useRouter();
    const [intervalTime, setIntervalTime] = useState(1);
    const [isRunning, setRun] = useState(false);

    const startTimer = useCallback(() => {
        if (intervalId.current !== null) return;
        const ms = intervalTime * 1000; //ms
        setRun(true);
        intervalId.current = setInterval(async () => {
            await step();
            const [updatedState] = await getState();
            setGraphData(updatedState, setGraphState);
        }, ms);
    }, [intervalTime, setGraphData, step, getState]);

    const stopTimer = useCallback(() => {
        if (intervalId.current === null) return;
        clearInterval(intervalId.current);
        setRun(false);
        intervalId.current = null;
    }, []);

    const incrementOnce = async () => {
        stopTimer();
        await step();
        const [updatedState] = await getState();
        setGraphData(updatedState, setGraphState);
    };


    const handleIntervalChange = useCallback(async () => {
        //delete previous interval before call another
        if (intervalId.current !== null) {
            stopTimer();
            console.log("Supposed request");
            startTimer();
        }
    }, [startTimer, stopTimer])


    const deleteTimer = async () => {
        await stop();
        await router.replace("/");
    }

    const Slider = useMemo(() => <SliderInput onChange={setIntervalTime} onTouchEnd={handleIntervalChange}
                                              value={intervalTime} min={1} max={5} step={1}>
        <SliderTrack>
            <SliderRange/>
            <SliderMarker value={2} />
            <SliderMarker value={3} />
            <SliderMarker value={4} />
            <SliderHandle/>
        </SliderTrack>
    </SliderInput>, [setIntervalTime, handleIntervalChange, intervalTime]);

    return (
        <div className="simulation__left-panel stack">
            <p>Configure</p>
            <button className="button" onClick={incrementOnce}>Run one step</button>

            <button className="button" onClick={startTimer} disabled={isRunning} style={{display: "flex",alignItems: "center", justifyContent : "center"}}>
                <div style={{marginRight: "6px"}}>{isRunning ? "Running": "Run"}</div>
                <ClipLoader color={"#00000"} loading={isRunning} size={30}/>
            </button>
            <button className="button danger" onClick={stopTimer} disabled={!isRunning}>Stop</button>
            <button className="button danger" onClick={deleteTimer}>Delete simulation</button>
            <p>Period</p>
            <div style={{width: "100%"}}>
                {Slider}
            </div>
        </div>
    )
}
