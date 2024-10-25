"use client";

import { IAgoraRTCRemoteUser, useRemoteUserTrack } from "agora-rtc-react";
import { useEffect, useRef } from "react";

export const RemoteUser = ({ user, acceptedUsers }: { user: IAgoraRTCRemoteUser, acceptedUsers: any }) => {
    const { track: videoTrack, isLoading: isVideoLoading } = useRemoteUserTrack(user, "video");
    const { track: audioTrack, isLoading: isAudioLoading } = useRemoteUserTrack(user, "audio");
    const videoRef = useRef<HTMLVideoElement>(null); // ref 추가

    // 비디오 재생
    useEffect(() => {
        if (videoTrack && videoRef.current) {
            videoTrack.play(videoRef.current);
        }
    }, [videoTrack]);
    // 오디오 재생
    useEffect(() => {
        if (audioTrack && acceptedUsers[user.uid]) {
            audioTrack.play();  // 오디오 트랙을 자동으로 재생
        } else {
            audioTrack?.stop();
        }
        console.log(acceptedUsers[user.uid], audioTrack)
    }, [acceptedUsers[user.uid], audioTrack]);


    return (
        <div id={`player-${user.uid}`}>
            {isVideoLoading ? (
                <p>비디오를 로드 중입니다...</p>
            ) : (
                <video
                    ref={videoRef} // ref 사용
                    id={`video-${user.uid}`}
                    style={{ width: "600px", height: "500px" }}
                />
            )}

            {isAudioLoading ? (
                <p>오디오를 로드 중입니다...</p>
            ) : audioTrack ? (
                <p>오디오가 활성화되었습니다.</p>
            ) : (
                <p>사용자가 오디오를 전송하지 않습니다.</p>
            )}
        </div>
    );
};
