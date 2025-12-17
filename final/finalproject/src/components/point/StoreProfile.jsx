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
        nickStyle: "" 
    });

    useEffect(() => {
        if (!loginId) return;
        
        // 백엔드: PointStoreRestController -> @GetMapping("/point/main/store/my-info")
        axios.get("/point/main/store/my-info")
            .then(res => {
                if (res.data) {
                    setUserInfo(res.data);
                }
            })
            .catch(err => console.error("프로필 로드 실패:", err));
            
    }, [loginId, refreshTrigger]); 

    if (!loginId) return null;

    return (
        <div className="store-profile-wrapper">
            <div className="membership-card">
                
                {/* 왼쪽: 유저 정보 */}
                <div className="card-user-info">
                    {/* 아바타 영역 */}
                    <div className="card-avatar-box">
                        {userInfo.iconSrc ? (
                            <img 
                                src={userInfo.iconSrc} 
                                alt="avatar" 
                                // ★ [수정] bg-white(흰배경), rounded-circle(원형), p-1(여백) 추가
                                className="card-avatar-img bg-white rounded-circle p-1" 
                            />
                        ) : (
                            <div className="default-avatar">👤</div>
                        )}
                    </div>
                    
                    {/* 텍스트 정보 */}
                    <div className="card-text-group">
                        {/* ★ 닉네임 꾸미기 클래스 적용 (nick-rainbow 등) */}
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

                {/* 오른쪽: 포인트 지갑 */}
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