const DEVELOPMENT_MODE = false;

const Environment = {
    API_BASE: (DEVELOPMENT_MODE) ? "http://localhost:3001" : "https://hot-friends-hotfriends-backend.pvuzyy.easypanel.host",
    HEADERS: { 
        headers: { 
            HOTFRIENDS_ACCESS_TOKEN : localStorage.getItem("HOTFRIENDS_ACCESS_TOKEN")
        } 
    },
}

export default Environment;