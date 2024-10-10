"use client"

import { IAgoraRTCRemoteUser, useRemoteUserTrack } from "agora-rtc-react";
import { useEffect } from "react";

export const RemoteUser = ({ user }: { user: IAgoraRTCRemoteUser }) => {
    const { track: videoTrack, isLoading: isVideoLoading } = useRemoteUserTrack(user, "video");
    const { track: audioTrack, isLoading: isAudioLoading } = useRemoteUserTrack(user, "audio");

    // 비디오 재생
    useEffect(() => {
        if (videoTrack) {
            const videoRef = document.getElementById(`video-${user.uid}`);
            if (videoRef) {
                videoTrack.play(videoRef);
            }
        }
    }, [videoTrack, user.uid]);

    // 오디오 재생
    useEffect(() => {
        if (audioTrack) {
            audioTrack.play();  // 오디오 트랙을 자동으로 재생
        }
    }, [audioTrack]);

    return (
        <div id={`player-${user.uid}`}>
            {isVideoLoading ? (
                <p>비디오를 로드 중입니다...</p>
            ) : videoTrack ? (
                <video
                    id={`video-${user.uid}`}
                    style={{ width: "800px", height: "500px" }}
                />
            ) : (
                <p>사용자가 비디오를 전송하지 않습니다.</p>
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