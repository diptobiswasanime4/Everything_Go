import React from "react";
import { useEffect, useState } from "react";
import { authState } from "../recoil/atoms/recoilState";
import { useRecoilState } from "recoil";
import axios from "axios";

function ForgotPassword() {
  const [auth, setAuth] = useRecoilState(authState);
  const [otp, setOTP] = useState("");
  const [newPassword, setNewPassword] = useState(false);
  useEffect(() => {
    console.log(1);

    getOTP();
  }, []);
  async function getOTP() {
    console.log(1);

    console.log(auth.Email);

    const resp = await axios.get(
      `http://localhost:3000/verify?email=${auth.Email}`
    );

    console.log(resp);
  }
  async function verify() {
    let otpNum = parseInt(otp, 10);
    const body = {
      OTP: otpNum,
    };
    console.log(body);
    let resp;
    try {
      resp = await axios.post("http://localhost:3000/verify", body, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(resp.data);
    } catch (error) {
      console.log("Got an error.", error);
    }
    if (resp?.data.status == "Ok") {
      setNewPassword(true);
    }
  }
  async function submitNewPassword() {}

  if (newPassword) {
    return (
      <div className="flex flex-col items-center gap-4 text-2xl my-8">
        <div className="text-4xl mb-4">Enter New Password</div>
        <input
          className="border rounded-md"
          type="text"
          placeholder="new Password"
          value={auth.Password}
          onChange={(e) =>
            setAuth((e) => ({ ...auth, Password: e.target.value }))
          }
        />
        <button
          onClick={submitNewPassword}
          className="bg-black hover:opacity-85 w-1/6 text-3xl p-1 mt-2 rounded-xl text-white"
        >
          Submit
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-4 text-2xl my-8">
      <div className="text-4xl mb-4">Verify</div>
      <input
        className="border rounded-md"
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOTP(e.target.value)}
      />
      <button
        onClick={verify}
        className="bg-black hover:opacity-85 w-1/6 text-3xl p-1 mt-2 rounded-xl text-white"
      >
        Submit
      </button>
    </div>
  );
}

export default ForgotPassword;
