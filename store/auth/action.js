import axios from "axios";

export const register = (userData) => async (dispatch) => {
  const baseurl = "http://springboot:8080";
  dispatch({ type: "REGISTER_REQUEST" });

  try {
    const response = await axios.post(`${baseurl}/auth/register`, userData);
    const user = response.data;
    dispatch({ type: "REGISTER_SUCCESS", payload: user.jwt });
    localStorage.setItem("jwt", user.jwt);

    alert("User registered successfully");
  } catch (error) {
    dispatch({ type: "REGISTER_FAILURE", payload: error.message });
    alert("User registration failed");
  }
};

export const login = (userData) => async (dispatch) => {
  const baseurl = "http://springboot:8080";
  dispatch({ type: "LOGIN_REQUEST" });

  try {
    const response = await axios.post(`${baseurl}/auth/login`, userData);
    const user = response.data;
    dispatch({ type: "LOGIN_SUCCESS", payload: user.jwt });

    localStorage.setItem("jwt", user.jwt);
    alert("User logged in successfully");
  } catch (error) {
    dispatch({ type: "LOGIN_FAILURE", payload: error.message });
    alert("User login failed");
  }
};

export const getUser = (jwt) => async (dispatch) => {
  const baseurl = "http://springboot:8080";
  dispatch({ type: "GET_USER_REQUEST" });
  try {
    const response = await axios.get(`${baseurl}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    const user = response.data;
    dispatch({ type: "GET_USER_SUCCESS", payload: user });
  } catch (error) {
    dispatch({ type: "GET_USER_FAILURE", payload: error.message });
  }
};
