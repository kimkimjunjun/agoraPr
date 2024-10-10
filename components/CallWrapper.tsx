"use client"

import AgoraRTC, { AgoraRTCProvider, useRTCClient } from "agora-rtc-react";
import { Call } from "./Call";

export const CallWrapper = (props: { appId: string; channelName: string }) => {
    const client = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }));
    return (
        <AgoraRTCProvider client={client}>
            <Call appId={props.appId} channelName={props.channelName} />
        </AgoraRTCProvider>
    );
};