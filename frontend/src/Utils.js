import axios from "axios";

export function setAuthToken(token) {
  if (token) {
    axios.defaults.headers.common["HOTFRIENDS_ACCESS_TOKEN"] = token;
  } else {
    delete axios.defaults.headers.common["HOTFRIENDS_ACCESS_TOKEN"];
  }
}

export function removeAuthToken() {
  delete axios.defaults.headers.common["HOTFRIENDS_ACCESS_TOKEN"];
}
