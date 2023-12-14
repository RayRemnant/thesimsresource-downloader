"use client"
import React, { useState, ChangeEvent, FormEvent } from 'react';
import {Input} from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Url } from "url";

export default function App() {

  const [resourceUrl, setResourceUrl] = React.useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(resourceUrl)

    //request to Vercel HOST / ?url=thesimsresource

    // if response is captcha true -> redirect to captcha form 

  };

  function validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  const validateEmail = (value: string) => value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

  const isInvalid = React.useMemo(() => {
    if (resourceUrl === "") return true

    return validateUrl(resourceUrl) ? false : true;
  }, [resourceUrl]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
    <Input
      value={resourceUrl}
      type="url"
      label="URL"
      variant="bordered"
      isInvalid={isInvalid}
      color={isInvalid ? "danger" : "success"}
      errorMessage={isInvalid && "Please enter a valid url"}
      onValueChange={setResourceUrl}
      className="max-w-xs"
    />
    <Button type="submit" color="primary">
        Submit
      </Button>	
      </form>

  <form /* onSubmit={}  */method="POST" className="flex w-full flex-wrap md:flex-nowrap gap-4">
  <input type="url" name="url" placeholder="Enter https://www.thesimsresource.com/ content URL" />
	    <button type="submit" color="primary">
        Submit
      </button>	
</form>
  </div>
  );
}
