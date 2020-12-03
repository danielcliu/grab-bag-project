import axios from "axios";

const iFixitApi = axios.create({
  baseURL: "https://www.ifixit.com/api/2.0/",
});

export default iFixitApi;
