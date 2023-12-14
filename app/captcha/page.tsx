"use client"
import React, { useState, ChangeEvent, FormEvent } from 'react';
import {Input} from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Url } from "url";

export default function App() {

  const [captchaValue, setCaptchaValue] = React.useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(captchaValue)

    //request to Vercel HOST /captcha/captchaValue

    // if response is captcha true -> redirect to captcha form 

  };

  return (
    <div>
        <img width="250" height="250" alt="captcha image" src="https://f003.backblazeb2.com/file/thesimsresource/captcha.png"/>
      <form onSubmit={handleSubmit}>
    <Input
      value={captchaValue}
      type="text"
      label="captcha"
      variant="bordered"
      onValueChange={setCaptchaValue}
      className="max-w-xs"
    />
    <Button type="submit" color="primary">
        Submit
      </Button>	
      </form>
  </div>
  );
}
