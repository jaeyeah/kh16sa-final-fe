import axios from "axios";
import { useCallback, useEffect, useState } from "react"
import { useParams } from "react-router-dom"



export default function BoardDetail(){

    //state
    const [board, setBoard] = useState({});
    const {boardNo} = useParams();


    // effect
    useEffect(()=>{
        console.log(boardNo);
        loadData();
    },[])

    // callback
    const loadData = useCallback(async()=>{
        const {data} = await axios.get(`/board/${boardNo}`);
        setBoard(data);
    },[])

    //rendar
    return (<>
        <div className="row">
            <div className="col">
                {board.boardNo}
            </div>
        </div>

        {board.boardTitle} <br/>
        {board.boardContentsId}<br/>
        {board.boardWtime}<br/>
        {board.boardEtime}<br/>
        {board.boardWriter}<br/>
        {board.boardText}<br/>

    </>)


}