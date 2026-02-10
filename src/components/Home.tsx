import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();
    return(
        <>
        <h1>Japanese Quiz Game</h1>
        <button onClick={() => navigate("/unlimode")}>UNLIMODE</button>
        </>
    );
}
