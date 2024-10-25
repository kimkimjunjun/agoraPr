import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
    hlsUrl: string; // RTSP 대신 HLS URL
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ hlsUrl }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<any>(null);

    useEffect(() => {
        // Video.js player 생성
        if (videoRef.current && !playerRef.current) {
            playerRef.current = videojs(videoRef.current, {
                controls: true,
                autoplay: true,
                preload: 'auto',
                sources: [
                    {
                        src: hlsUrl,
                        type: 'application/x-mpegURL', // HLS MIME 타입
                    },
                ],
            });
        }

        return () => {
            // 컴포넌트 언마운트 시 player 해제
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, [hlsUrl]);

    return (
        <div>
            <video ref={videoRef} className="video-js vjs-default-skin" />
        </div>
    );
};

export default VideoPlayer;
