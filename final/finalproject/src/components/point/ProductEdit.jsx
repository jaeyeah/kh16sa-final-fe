import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function ProductEdit({ target, closeModal, reload }) {
    // [1] 입력값 관리 (pointItemDailyLimit 필드 추가)
    const [input, setInput] = useState({
        pointItemNo: 0,
        pointItemName: "",
        pointItemPrice: 0,
        pointItemStock: 0,
        pointItemType: "FOOD",
        pointItemReqLevel: "일반회원",
        pointItemContent: "",
        pointItemSrc: "",
        pointItemIsLimitedPurchase: "N", // Y 또는 N (DB 타입에 맞춰 0/1로 쓰고 싶다면 Number 변환 필요)
        pointItemDailyLimit: 0          // 일일 제한 추가
    });

    // 모달이 열리면 target 데이터를 input에 채워넣음
    useEffect(() => {
        if(target) {
            setInput({ 
                ...target,
                // 혹시 DB에서 넘어온 값이 null일 경우를 대비해 기본값 세팅
                pointItemDailyLimit: target.pointItemDailyLimit || 0
            });
        }
    }, [target]);

    const changeInput = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
    };

    // [2] 수정 실행
    const handleEdit = async () => {
        if (!input.pointItemName || input.pointItemPrice < 0) {
            return toast.warning("상품명과 가격을 올바르게 입력해주세요. 🤔");
        }

        try {
            // 서버 전송 전 데이터 정제 (숫자 타입 변환)
            const payload = {
                ...input,
                pointItemPrice: Number(input.pointItemPrice),
                pointItemStock: Number(input.pointItemStock),
                pointItemDailyLimit: Number(input.pointItemDailyLimit)
            };

            // 수정 API 호출
            const resp = await axios.post("/point/main/store/item/edit", payload);
            
            if (resp.data === "success") {
                toast.success("🛠️ 상품 정보가 수정되었습니다!");
                reload();
                closeModal();
            } else {
                toast.error("수정 실패: " + resp.data);
            }
        } catch (e) {
            console.error(e);
            toast.error("서버 오류가 발생했습니다. ☠️");
        }
    };

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg border-0">
                    <div className="modal-header bg-warning text-dark">
                        <h5 className="modal-title fw-bold">🛠️ 상품 정보 수정 (No. {input.pointItemNo})</h5>
                        <button type="button" className="btn-close" onClick={closeModal}></button>
                    </div>
                    <div className="modal-body p-4">
                        
                        {/* 상품명 */}
                        <div className="mb-3">
                            <label className="form-label fw-bold small">상품명</label>
                            <input type="text" name="pointItemName" value={input.pointItemName || ""} className="form-control" onChange={changeInput} />
                        </div>

                        {/* 가격 & 재고 */}
                        <div className="row mb-3">
                            <div className="col">
                                <label className="form-label fw-bold small">가격(P)</label>
                                <input type="number" name="pointItemPrice" value={input.pointItemPrice} className="form-control" onChange={changeInput} />
                            </div>
                            <div className="col">
                                <label className="form-label fw-bold small">재고</label>
                                <input type="number" name="pointItemStock" value={input.pointItemStock} className="form-control" onChange={changeInput} />
                            </div>
                        </div>

                        {/* 유형 & 등급 */}
                        <div className="row mb-3">
                            <div className="col">
                                <label className="form-label fw-bold small">유형</label>
                                <select name="pointItemType" className="form-select" onChange={changeInput} value={input.pointItemType}>
                                    <option value="">== 유형 선택 ==</option>
                                    <optgroup label="기능성 아이템">
                                        <option value="HEART_RECHARGE">하트 충전권 (5개)</option>
                                        <option value="CHANGE_NICK">닉네임 변경권</option>
                                        <option value="LEVEL_UP">레벨업 부스터</option>
                                    </optgroup>
                                    <optgroup label="치장/꾸미기">
                                        <option value="DECO_NICK">닉네임 치장</option>
                                        <option value="DECO_ICON">프로필 아이콘</option>
                                        <option value="DECO_BG">배경 스킨</option>
                                    </optgroup>
                                    <optgroup label="이벤트/기타">
                                        <option value="VOUCHER">포인트 충전권</option>
                                        <option value="RANDOM_ICON">아이콘뽑기</option>
                                        <option value="RANDOM_ROULETTE">룰렛이용권</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div className="col">
                                <label className="form-label fw-bold small">등급</label>
                                <select name="pointItemReqLevel" className="form-select" value={input.pointItemReqLevel} onChange={changeInput}>
                                    <option value="일반회원">일반회원</option>
                                    <option value="우수회원">우수회원</option>
                                    <option value="관리자">관리자</option>
                                </select>
                            </div>
                        </div>

                        {/* 구매 제한 설정 (중복구매 여부 & 일일 제한 수량) */}
                        <div className="row mb-3">
                            <div className="col-6">
                                <label className="form-label fw-bold small">1인 1회 제한</label>
                                <select name="pointItemIsLimitedPurchase" className="form-select" value={input.pointItemIsLimitedPurchase} onChange={changeInput}>
                                    <option value="N">N (중복 가능)</option>
                                    <option value="Y">Y (1회 한정)</option>
                                </select>
                            </div>
                            <div className="col-6">
                                <label className="form-label fw-bold small text-danger">일일 구매 제한 개수</label>
                                <input 
                                    type="number" 
                                    name="pointItemDailyLimit" 
                                    className="form-control border-danger border-opacity-50" 
                                    value={input.pointItemDailyLimit} 
                                    onChange={changeInput} 
                                />
                            </div>
                        </div>

                        {/* 이미지 & 설명 */}
                        <div className="mb-3">
                            <label className="form-label fw-bold small">이미지 URL</label>
                            <input type="text" name="pointItemSrc" value={input.pointItemSrc || ""} className="form-control" onChange={changeInput} />
                        </div>
                        <div className="mb-0">
                            <label className="form-label fw-bold small">설명</label>
                            <textarea name="pointItemContent" value={input.pointItemContent || ""} className="form-control" rows="2" onChange={changeInput}></textarea>
                        </div>

                    </div>
                    <div className="modal-footer bg-light">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>취소</button>
                        <button type="button" className="btn btn-warning fw-bold px-4" onClick={handleEdit}>수정 완료</button>
                    </div>
                </div>
            </div>
        </div>
    );
}