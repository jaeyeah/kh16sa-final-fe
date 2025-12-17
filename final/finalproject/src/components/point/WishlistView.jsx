import React, { useState, useEffect, useCallback } from 'react';
import axios from "axios"; // axios import 수정
import { useAtomValue } from "jotai"; 
import { loginIdState } from "../../utils/jotai"; 
import { toast } from "react-toastify";
import "./WishlistView.css";

export default function WishlistView({ refreshPoint }) { 
    const loginId = useAtomValue(loginIdState); 
    const [wishes, setWishes] = useState([]);
    const [loading, setLoading] = useState(true);

    // 찜 목록 불러오기
    const loadWishes = useCallback(async () => {
        if (!loginId) {
            setWishes([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get("/point/main/store/wish/my");
            setWishes(response.data); 
        } catch (error) {
            console.error("로드 실패:", error);
            toast.error("찜 목록을 불러오지 못했습니다. 😥");
            setWishes([]);
        } finally {
            setLoading(false);
        }
    }, [loginId]);

    useEffect(() => {
        loadWishes();
    }, [loadWishes]);

    // 찜 삭제 핸들러
    const handleRemove = async (targetItemNo) => {
        if (!window.confirm("이 상품을 찜 목록에서 삭제하시겠습니까?")) return;
        
        try {
            // ★ 중요: 백엔드 PointItemWishVO가 { itemNo: long }을 받으므로 키 이름을 'itemNo'로 통일
            await axios.post("/point/main/store/wish/delete", { itemNo: targetItemNo });
            
            toast.info("찜 목록에서 삭제되었습니다. 🗑️");
            loadWishes(); // 목록 새로고침
        } catch (error) {
            console.error("삭제 실패:", error);
            toast.error("삭제에 실패했습니다.");
        }
    };

    if (loading) return <div className="text-center p-5 text-white"><div className="spinner-border text-primary"></div></div>;
    if (!loginId) return <div className="alert alert-dark text-center mt-4 m-3 border-secondary text-white">🔒 로그인이 필요합니다.</div>;
    
    // 찜 목록이 없을 때
    if (wishes.length === 0) return (
        <div className="wish-empty">
            <span className="wish-empty-icon">💔</span>
            <h5 className="text-white fw-bold mb-2">찜한 상품이 없습니다.</h5>
            <p className="small mb-0">스토어에서 마음에 드는 상품을 담아보세요!</p>
        </div>
    );

    return (
        <div className="mt-3">
            {/* 헤더 */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                <h5 className="fw-bold text-white mb-0">💖 나의 위시리스트 ({wishes.length})</h5>
            </div>
            
            {/* 그리드 리스트 */}
            <div className="wish-grid">
                {wishes.map((w) => (
                    // ★ 수정: w.withListNo -> w.pointWishlistNo (DTO 필드명 일치)
                    <div className="wish-card" key={w.pointWishlistNo}> 
                        
                        {/* 이미지 영역 */}
                        <div className="wish-img-wrapper">
                            {w.pointItemSrc ? (
                                <img src={w.pointItemSrc} alt={w.pointItemName} className="wish-img" />
                            ) : (
                                <div className="wish-img d-flex align-items-center justify-content-center bg-secondary text-white">
                                    No Image
                                </div>
                            )}

                            {/* 삭제 버튼 (X) */}
                            <button 
                                className="btn-remove-wish"
                                // ★ 수정: w.withListItemNo -> w.pointWishlistItemNo (DTO 필드명 일치)
                                onClick={() => handleRemove(w.pointWishlistItemNo)} 
                                title="목록에서 제거"
                            >
                                ✕
                            </button> 
                        </div>

                        {/* 정보 영역 */}
                        <div className="wish-info">
                            <h6 className="wish-title" title={w.pointItemName}>{w.pointItemName}</h6>
                            <h6 className="wish-price">{w.pointItemPrice.toLocaleString()} P</h6>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}