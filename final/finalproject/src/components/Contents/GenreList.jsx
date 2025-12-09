import axios from "axios";
import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom";
import "./SearchAndSave.css"

export default function GenreList() {
    //장르 리스트 state
    const [genre, setGenre] = useState([]);

    //effect
    useEffect(()=>{
        loadData();
    }, []);

    //callback
    const loadData = useCallback(async ()=>{
        const {data} = await axios.get("/api/tmdb/genre");
        const genreList = data.map(genre=>({
            ...genre,
        }));
        setGenre(genreList);
    }, []);

    //render
    return(<>
        <div className="row">
            <div className="col dark-bg-wrapper p-4 rounded">
                    <button className="btn btn-danger me-2 mt-2" >전체</button>
                    {genre.map(genreDto=>(
                        <button className="btn btn-danger me-2 mt-2" key={genreDto.genreId}>
                            <Link to={`/contents/listByGenre/${genreDto.genreName}`} className="text-decoration-none link-body-emphasis">
                            {genreDto.genreName}
                            </Link>
                        </button>
                    ))}
            </div>
        </div>
    </>)
}