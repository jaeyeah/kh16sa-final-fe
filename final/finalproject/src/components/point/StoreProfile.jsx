import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import "./StoreProfile.css"; 

export default function StoreProfile({ refreshTrigger }) {
    const loginId = useAtomValue(loginIdState);
    
    const [userInfo, setUserInfo] = useState({
        nickname: "",
        point: 0,
        level: "",
        iconSrc: null,
        nickStyle: "",
        frameSrc: "", // 추가: 테두리 클래스명 (frame-gold 등)
        bgSrc: ""     // 추가: 배경 클래스명 (bg-ice 등)
    });

    useEffect(() => {
        if (!loginId) return;
        
        axios.get("/point/main/store/my-info")
            .then(res => {
                if (res.data) {
                    setUserInfo(res.data);
                }
            })
            .catch(err => console.error("프로필 로드 실패:", err));
            
    }, [loginId, refreshTrigger]); 

    if (!loginId) return null;

    // DB에서 넘어오는 'bg-ice', 'frame-gold' 등의 값을 클래스로 사용
    const bgEffectClass = userInfo.bgSrc || ""; 
    const frameEffectClass = userInfo.frameSrc || "";

    return (
        <div className="store-profile-wrapper">
            {/* 배경 및 테두리 효과 동적 부여 */}
            <div className={`membership-card ${bgEffectClass} ${frameEffectClass}`}>
                
                <div className="card-user-info">
                    {/* 아바타 박스에도 프레임 클래스 부여 */}
                    <div className={`card-avatar-box ${frameEffectClass}`}>
                        {userInfo.iconSrc ? (
                            <img 
                                src={userInfo.iconSrc} 
                                alt="avatar" 
                                className="card-avatar-img" 
                            />
                        ) : (
                            <div className="default-avatar">👤</div>
                        )}
                    </div>
                    
                    <div className="card-text-group">
                        <div className={`card-nickname ${userInfo.nickStyle || ""}`}>
                            {userInfo.nickname || loginId}
                        </div>
                        
                        <div className="card-grade">
                            <span className={`badge-level ${userInfo.level === '관리자' ? 'admin' : ''}`}>
                                👑 {userInfo.level || "MEMBER"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="card-point-wallet">
                    <span className="wallet-label">CURRENT BALANCE</span>
                    <div className="wallet-amount">
                        {userInfo.point ? userInfo.point.toLocaleString() : 0}
                        <span className="currency-unit">P</span>
                    </div>
                </div>
            </div>
        </div>
    );
}