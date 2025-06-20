const DEVELOPMENT_MODE = false;

const Environment = {
    API_BASE: (DEVELOPMENT_MODE) ? "http://localhost:3001" : "http://localhost:3001",
    HEADERS: { 
        headers: { 
            HOTFRIENDS_ACCESS_TOKEN : localStorage.getItem("HOTFRIENDS_ACCESS_TOKEN")
        } 
    },
}

export default Environment;