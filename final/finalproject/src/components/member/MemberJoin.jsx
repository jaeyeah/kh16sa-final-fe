import axios from "axios";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"


export default function member(){
    //도구
    const navigate = useNavigate();

    //state
    const [member, setMember] = useState({
        memberId : "", memberPw : "", memberNickname : "",
        memberEmail : "", memberBirth : "", memberContact : "",
        memberPost : "", memberAddress1 : "", memberAddress2 : ""
    });
    const [memberClass, setMemberClass] = useState({
        memberId : "", memberPw : "", memberNickname : "",
        memberEmail : "", memberBirth : "", memberContact : "",
        memberPost : "", memberAddress1 : "", memberAddress2 : ""
    });

    // callback
    const changeStrValue = useCallback(e=>{
        const {name, value} = e.target;
        setMember(prev=>({...prev, [name]:value}))
    },[])

    const changeDateValue = useCallback((date)=>{
        // → 별도의 포맷 전환 절차가 필요
        const replacement = format(date,"yyyy-MM-dd");
        setAccount(prev=>({...prev, accountBirth : replacement}));
    },[]);



    //memo
    // 모든 항목이 유효한지 검사(선택항목은 is-invalid가 아니어야함)
    const memberValid = useMemo(()=>{
        //필수항목
        // if(memberClass.memberId !== "is-valid") return false;
        // if(memberClass.memberPw !== "is-valid") return false;
        // if(memberClass.memberNickname !== "is-valid") return false;
        // if(memberClass.memberEmail !== "is-valid") return false;
        // //선택항목
        // if(memberClass.memberBirth==="is-invalid") return false;
        // if(memberClass.memberContact==="is-invalid") return false;
        // if(memberClass.memberPost==="is-invalid") return false;
        // if(memberClass.memberAddress1==="is-invalid") return false;
        // if(memberClass.memberAddress2==="is-invalid") return false;
        // return true;
    },[memberClass])

    //callback
    //최종 가입
    const sendData = useCallback(async()=>{
        if(memberValid === false) return ;
        const {data} = await axios.post("/member/",member)
        
        //navigate("/"); // 메인페이지
    },[member,memberValid])

    //render
    return (<>
        <h2>회원가입</h2>

        {/* 아이디 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">아이디</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberId}`} 
                            name="memberId" value={member.memberId}
                            onChange={changeStrValue}
                            //onBlur={}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback"></div>
            </div>
        </div>

        {/* 비밀번호 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">비밀번호</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberPw}`} 
                            name="memberPw" value={member.memberPw}
                            onChange={changeStrValue}
                            //onBlur={}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback"></div>
            </div>
        </div>
        
        {/* 닉네임 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">닉네임</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberNickname}`} 
                            name="memberNickname" value={member.memberNickname}
                            onChange={changeStrValue}
                            //onBlur={}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback"></div>
            </div>
        </div>
        
        {/* 이메일 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">이메일</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberEmail}`} 
                            name="memberEmail" value={member.memberEmail}
                            onChange={changeStrValue}
                            //onBlur={}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback"></div>
            </div>
        </div>

        {/* 생년월일 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">생년월일</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberBirth}`} 
                            name="memberBirth" value={member.memberBirth}
                            onChange={changeStrValue}
                            //onBlur={}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback"></div>
            </div>
        </div>

        {/* 연락처 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">연락처</label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberContact}`} 
                            name="memberContact" value={member.memberContact}
                            onChange={changeDateValue}
                            //onBlur={}
                            />
                <div className="valid-feedback"></div>
                <div className="invalid-feedback"></div>
            </div>
        </div>
        
        {/* 주소 (Post, Address1, Address2) */}
        {/* ---------------------------- */}
        
        {/* 가입버튼  */}
        <div className="row mt-4">
            <div className="col">
                <button type="button" className="btn btn-lg btn-success w-100"
                            disabled={memberValid === false}
                            onClick = {sendData}
                            >
                <span>가입</span>
                </button>
            </div>
        </div>


    </>)
}