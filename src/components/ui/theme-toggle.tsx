import '../custom-components.css'
export default function ThemeToggle({ onClick }: { onClick?: () => void }){
    return(
        <label className="switch">
            <input type="checkbox" onClick={onClick}/>
            <span className="slider"></span>
        </label>
    )
}