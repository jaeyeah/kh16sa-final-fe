import { useCallback } from "react";
import { useState } from "react";

export default function MemberLogin(){

    //state
    const [member, setMember] = useState({
        memberId : "", memberPw : ""
    })

    //callback
    const changeStrValue = useCallback(e=>{
        const {name, value} = e.target;
        setMember(prev =>({...prev, [name] : value}));
    },[])

    //render
    return(<>
        <div className="row mt-4">
            <div className="col">
                <h1>로그인</h1>
            </div>
        </div>
        
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">ID</label>
            <div className="col-sm-9">
                <input type="text" className="form-control" name="memberId" value={member.memberId}
                    onChange={changeStrValue}/>
            </div>
        </div>
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">비밀번호</label>
            <div className="col-sm-9">
                <input type="password" className="form-control" name="memberPw" value={member.memberPw}
                    onChange={changeStrValue}/>
            </div>
        </div>

        <div className="row mt-4">
            <div className="col">
                <button type="button" className="btn btn-success w-100 btn-lg"
                        //onClick={}
                        > 로그인
                </button>
            </div>
        </div>
    </>)
}