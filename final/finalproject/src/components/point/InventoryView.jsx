import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./InventoryView.css";

export default function InventoryView({ refreshPoint }) {
    const [myInven, setMyInven] = useState([]);

    // 인벤토리 목록 불러오기
    const loadInven = useCallback(async () => {
        try {
            const resp = await axios.get("/point/main/store/inventory/my");
            // 백엔드에서 이미 수량(inventoryQuantity)이 합쳐져서 온다고 가정
            setMyInven(resp.data);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { loadInven(); }, [loadInven]);

    // [사용] 핸들러
    const handleUse = async (item) => {
        // DTO 필드명: inventoryNo, pointItemType (조인된 필드)
        const targetNo = item.inventoryNo; 
        const type = item.pointItemType;
        let extraValue = null;

        // 1. 유형별 추가 데이터 입력 로직
        if (type === "CHANGE_NICK") {
            extraValue = window.prompt("변경할 닉네임을 입력해주세요. (2~10자)");
            if (!extraValue) return;
        } 
        else if (type === "DECO_NICK") { 
            // 백엔드 변경됨: 아이템 이름(예: '무지개')을 보고 자동 적용하므로 선택창 불필요
            if(item.inventoryEquipped === 'Y') {
                toast.info("이미 착용중입니다.");
                return;
            }
            if (!window.confirm(`[${item.pointItemName}] 닉네임 스타일을 적용하시겠습니까?`)) return;
        }
        else if (type === "RANDOM_ICON") {
            // 뽑기는 별도 로직 (결과값인 아이콘 정보를 받아와야 하므로 별도 API 호출 유지)
            if (!window.confirm("🎲 아이콘 뽑기를 진행하시겠습니까? (티켓 1장 소모)")) return;
            try {
                // 뽑기 전용 컨트롤러가 있다면 이곳 호출
                const drawResp = await axios.post("/point/icon/draw", { inventoryNo: targetNo });
                const icon = drawResp.data; // { iconName, iconRarity, iconSrc ... }
                
                toast.success(
                    <div className="text-center">
                        <p className="mb-1 fw-bold">🎉 {icon.iconRarity} 등급 획득!</p>
                        <img src={icon.iconSrc} style={{width:'60px', height:'60px', borderRadius:'8px', border:'2px solid #eee', objectFit: 'cover'}} alt="icon" />
                        <div className="mt-2 fw-bold text-dark">{icon.iconName}</div>
                    </div>, 
                    { autoClose: 4000, hideProgressBar: false }
                );
                loadInven(); // 수량 갱신
                if (refreshPoint) refreshPoint(); // 포인트 등 갱신
            } catch (e) { 
                toast.error("뽑기 실패: " + (e.response?.data?.message || "오류 발생")); 
            }
            return; // 일반 use API 호출 건너뜀
        }
      else if (type === "VOUCHER") {
            if (!window.confirm("포인트를 충전하시겠습니까?")) return;
        }
        
        // ★ [추가] 룰렛 이용권 처리 (백엔드 에러 방지)
        else if (type === "RANDOM_ROULETTE") {
            if (window.confirm("이 아이템은 '행운의 룰렛' 페이지에서 사용할 수 있습니다.\n이동하시겠습니까?")) {
                // 라우터가 있다면 navigate('/roulette') 처리
                // 혹은 탭을 바꾸는 함수 호출
                window.location.href = "/roulette"; // 예시 경로
            }
            return; // API 호출 막기
        }
        else if (type === "RANDOM_POINT") {
            if (!window.confirm("랜덤 포인트 상자를 여시겠습니까?")) return;
        }
        else {
            // 그 외 아이템
            if (!window.confirm("아이템을 사용하시겠습니까?")) return;
        }

        // 2. 일반 사용 API 호출
        try {
            const resp = await axios.post("/point/main/store/inventory/use", { 
                inventoryNo: targetNo, 
                extraValue: extraValue 
            });
            
            if (resp.data === "success") {
                toast.success("사용 완료!");
                loadInven();
                if (refreshPoint) refreshPoint();
            } else {
                // 에러 메시지 처리 (fail:이유)
                const msg = String(resp.data).startsWith("fail:") ? resp.data.substring(5) : resp.data;
                toast.error(msg);
            }
        } catch (e) { 
            toast.error(e.response?.data?.message || "사용 중 오류가 발생했습니다."); 
        }
    };

    // [환불]
    const handleCancel = async (item) => {
        if (!window.confirm("구매를 취소하고 환불하시겠습니까?")) return;
        try {
            await axios.post("/point/main/store/cancel", { inventoryNo: item.inventoryNo });
            toast.info("환불이 완료되었습니다. 💸");
            loadInven();
            if (refreshPoint) refreshPoint();
        } catch (err) { 
            toast.error(err.response?.data?.message || "환불 실패"); 
        }
    };

    // [삭제/버리기]
    const handleDiscard = async (item) => {
        if (!window.confirm("정말 버리시겠습니까? (복구 불가)")) return;
        try {
            await axios.post("/point/main/store/inventory/delete", { inventoryNo: item.inventoryNo });
            toast.success("아이템을 버렸습니다. 🗑️");
            loadInven();
        } catch (err) { 
            toast.error("삭제 실패"); 
        }
    };

    return (
        <div className="inven-container mt-3">
            <h5 className="text-white fw-bold mb-4 px-2">
                🎒 나의 보관함 <span className="text-secondary small">({myInven.length})</span>
            </h5>
            
            {myInven.length === 0 ? (
                <div className="inven-empty">
                    <span className="inven-empty-icon">📦</span>
                    <h5>보관함이 비어있습니다.</h5>
                    <p>스토어에서 아이템을 구매해보세요!</p>
                </div>
            ) : (
                <div className="inven-grid">
                    {myInven.map((item) => {
                        // DECO_NICK 타입이면서 inventoryEquipped가 'Y'인 경우
                        const isEquipped = item.inventoryEquipped === 'Y';

                        return (
                            <div className={`inven-card ${isEquipped ? 'equipped-card' : ''}`} key={item.inventoryNo}>
                                
                                {/* 이미지 영역 */}
                                <div className="inven-img-box">
                                    {item.pointItemSrc ? 
                                        <img src={item.pointItemSrc} className="inven-img" alt={item.pointItemName}/> 
                                        : <div className="no-img">Img</div>
                                    }
                                    {/* 수량 뱃지 (1개 이상일 때만 표시하거나 항상 표시) */}
                                    <span className="inven-count-badge">x{item.inventoryQuantity}</span>

                                    {/* 착용중 뱃지 */}
                                    {isEquipped && <span className="badge bg-success equipped-badge">착용중</span>}
                                </div>

                                {/* 정보 영역 */}
                                <div className="inven-info">
                                    <h6 className="inven-name" title={item.pointItemName}>{item.pointItemName}</h6>
                                    <span className="inven-type">{item.pointItemType}</span>
                                </div>

                                {/* 버튼 그룹 */}
                                <div className="inven-actions">
                                    {["CHANGE_NICK", "LEVEL_UP", "RANDOM_POINT", "VOUCHER", "DECO_NICK", "RANDOM_ICON"].includes(item.pointItemType) && (
                                        <button 
                                            className={`btn-inven use ${isEquipped ? 'disabled' : ''}`} 
                                            onClick={() => handleUse(item)}
                                            disabled={isEquipped} // 착용중이면 사용 버튼 비활성
                                        >
                                            {item.pointItemType === 'RANDOM_ICON' ? '뽑기' : 
                                             item.pointItemType === 'DECO_NICK' ? (isEquipped ? '사용중' : '장착') : 
                                             '사용'}
                                        </button>
                                    )}
                                    
                                    {/* 환불/삭제 버튼 (착용중이 아닐 때만 가능하게 처리 등) */}
                                    {!isEquipped && (
                                        <>
                                            <button className="btn-inven refund" onClick={() => handleCancel(item)}>환불</button>
                                            <button className="btn-inven delete" onClick={() => handleDiscard(item)}>버리기</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}