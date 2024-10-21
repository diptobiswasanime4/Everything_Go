import React, { useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import axios from "axios";

function Sign() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOTP] = useState("");
  const [redirect, setRedirect] = useState(false);

  const location = useLocation();
  const curPath = location.pathname;

  async function register() {
    let body = {
      Email: email,
      password: password,
    };
    const resp = await axios.post("http://localhost:3000/register", body, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(resp);
    if (resp.data.status == "Ok") {
      setRedirect(true);
    }
  }

  async function login() {
    let body = {
      Email: email,
      password: password,
    };
  }
  if (redirect) {
    return <Navigate to={"/verify"} />;
  }
  if (curPath == "/register") {
    return (
      <div className="flex flex-col items-center gap-4 text-2xl my-8">
        <div className="text-4xl mb-4">Register</div>
        <input
          className="border rounded-md"
          type="text"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={register}
          className="bg-black hover:opacity-85 w-1/6 text-3xl p-1 mt-2 rounded-xl text-white"
        >
          Submit
        </button>
        <div className="">
          Already Registered ? Please{" "}
          <Link className="text-purple-600 hover:underline" to={"/login"}>
            login
          </Link>
        </div>
      </div>
    );
  } else if (curPath == "/login") {
    return (
      <div className="flex flex-col items-center gap-4 text-2xl my-8">
        <div className="text-4xl mb-4">Login</div>
        <input
          className="border rounded-md"
          type="text"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex flex-col">
          <input
            className="border"
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Link
            className="text-xl m-1 text-yellow-700 hover:underline"
            to={"/forgot-password"}
          >
            Forgot Password ?
          </Link>
        </div>
        <button
          onClick={register}
          className="bg-black hover:opacity-85 w-1/6 text-3xl p-1 rounded-xl text-white"
        >
          Submit
        </button>
        <div className="">
          Not a User ? Please{" "}
          <Link className="text-purple-600 hover:underline" to={"/register"}>
            register
          </Link>
        </div>
      </div>
    );
  }
}

export default Sign;
