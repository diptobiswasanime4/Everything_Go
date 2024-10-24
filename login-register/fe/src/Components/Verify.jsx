import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

function Verify() {
  const [otp, setOTP] = useState("");
  const [redirect, setRedirect] = useState(false);

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
      setRedirect(true);
    }
  }
  if (redirect) {
    return <Navigate to={"/login"} />;
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

export default Verify;
