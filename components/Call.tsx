"use client";

import React, { useEffect } from "react";
import AgoraRTC, {
    AgoraRTCProvider,
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    usePublish,
    useRemoteUsers,
    useRTCClient,
} from "agora-rtc-react";
import { LocalVideoTrack } from "agora-rtc-react";

const Call = (props: { appId: string; channelName: string }) => {
    const { appId, channelName } = props;

    const client = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }));
    const { isLoading: isLoadingMic, localMicrophoneTrack } = useLocalMicrophoneTrack();
    const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();
    const remoteUsers = useRemoteUsers();

    // useJoin 훅에서 필요한 인자를 제공
    const { data: uid, isLoading: isJoining, isConnected, error: joinError } = useJoin(
        {
            appid: appId,
            channel: channelName,
            token: null,
        },
        true
    ); // true는 준비된 상태로 간주

    // usePublish 훅에서 필요한 인자를 제공
    const { isLoading: isPublishing, error: publishError } = usePublish(
        [localMicrophoneTrack, localCameraTrack],
        true
    ); // true는 준비된 상태로 간주

    // publish 트랙이 준비되었을 때 호출
    useEffect(() => {
        const publishTracks = async () => {
            if (isConnected && localMicrophoneTrack && localCameraTrack && !isPublishing) {
                try {
                    await client.publish([localMicrophoneTrack, localCameraTrack]); // publish 호출
                } catch (e) {
                    console.error("Error publishing tracks:", e);
                }
            }
        };
        publishTracks();
    }, [localMicrophoneTrack, localCameraTrack, isPublishing, isConnected, client]);

    useEffect(() => {
        const joinChannel = async () => {
            try {
                if (!isJoining && !isConnected) {
                    await client.join(appId, channelName, null, uid); // 조인 메서드 호출
                }
            } catch (e) {
                console.error("Error joining channel:", e);
            }
        };

        // Join the channel when the component mounts
        joinChannel();
    }, [appId, channelName, uid, isJoining, isConnected, client]);

    console.log(localCameraTrack)
    return (
        <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold">Agora Video Call</h2>
            <div className="flex flex-col">
                {localCameraTrack ? (
                    <div>
                        <LocalVideoTrack
                            track={localCameraTrack}
                            style={{ width: "400px", height: "300px" }}
                            play
                        />
                    </div>
                ) : (
                    <p>카메라를 초기화 중입니다...</p> // 초기화 중일 때 로딩 메시지
                )}

                {remoteUsers.map((user) => (
                    <div key={user.uid}>
                        <h3>User ID: {user.uid}</h3>
                        <RemoteUser user={user} />
                    </div>
                ))}
            </div>
        </div>
    );

};

const RemoteUser = ({ user }: any) => {
    const { videoTrack } = user;

    return (
        <div>
            {videoTrack && (
                <video
                    ref={(ref) => {
                        if (ref) {
                            videoTrack.play(ref);
                        }
                    }}
                    style={{ width: "400px", height: "300px" }}
                />
            )}
        </div>
    );
};

const CallWrapper = (props: { appId: string; channelName: string }) => {
    const client = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }));

    return (
        <AgoraRTCProvider client={client}>
            <Call appId={props.appId} channelName={props.channelName} />
        </AgoraRTCProvider>
    );
};

export default CallWrapper;
