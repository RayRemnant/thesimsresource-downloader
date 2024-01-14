/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, ChangeEvent, FormEvent, useMemo } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Url } from "url";
import { Link } from "@nextui-org/link";

export default function App() {
	const [resourceUrl, setResourceUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const [requiresCaptcha, setRequiresCaptcha] = useState(false);
	const [captchaImage, setCaptchaImage] = useState(undefined);
	const [captchaValue, setCaptchaValue] = useState("");

	const [downloadLink, setDownloadLink] = useState("");

	const submitCaptcha = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		//extract id from url

		let id = resourceUrl.split("id/")[1];

		setIsLoading(true);

		fetch(`/api/captcha?id=${id}&captchaValue=${captchaValue}`)
			.then(async (result) => {
				if (result.status == 200) {
					setRequiresCaptcha(false);
					handleSubmit(e);
				}

				//if captcha true
				//redirect to captcha form
			})
			.catch((e: any) => {
				setIsLoading(false);
				console.log(e);
			});

		console.log(captchaValue);

		//request to Vercel HOST /captcha/captchaValue

		// if response is captcha true -> redirect to captcha form
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setIsLoading(true);
		fetch(`/api?url=${resourceUrl}`)
			.then(async (result) => {
				setIsLoading(false);

				const data: {
					captcha?: any;
					url: any;
					method: any;
					headers: any;
					body: any;
				} = await result.json();

				//if captcha true
				//show captcha form
				if (data.captcha) {
					setRequiresCaptcha(true);
					setCaptchaImage(data.captcha);
					return;
				}

				setDownloadLink(data.url);

				/* console.log(data.url);
				console.log("opening in new tab...");
				window.open(data.url, "_blank");

				await fetch(data.url, {
					method: data.method,
					headers: data.headers,
					body: data.body,
					mode: "no-cors",
				}).then((result) => {
					console.log(result);
					setIsLoading(false);
				}); */
			})
			.catch((e: any) => {
				console.log(e);
				setIsLoading(false);
			});
	};

	function validateUrl(url: string): boolean {
		try {
			new URL(url);
			return true;
		} catch (error) {
			return false;
		}
	}

	const validateEmail = (value: string) =>
		value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

	const isInvalid = useMemo(() => {
		if (resourceUrl === "") return true;

		return validateUrl(resourceUrl) ? false : true;
	}, [resourceUrl]);

	return (
		<div>
			<form
				onSubmit={handleSubmit}
				style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
			>
				<Input
					value={resourceUrl}
					type="url"
					label="URL"
					variant="bordered"
					isInvalid={isInvalid}
					color={isInvalid ? "danger" : "success"}
					errorMessage={isInvalid && "Please enter a valid url"}
					description="Good to go!"
					onValueChange={setResourceUrl}
					className="max-w-xs"
					placeholder="https://www.thesimsresource.com/..."
				/>
				<Button
					type="submit"
					color="primary"
					isLoading={isLoading}
					isDisabled={isInvalid}
					style={{ marginBottom: "2em" }}
				>
					Submit
				</Button>
				{downloadLink && !isLoading ? (
					<Button
						href={downloadLink}
						as={Link}
						color="default"
						showAnchorIcon
						variant="faded"
						style={{ marginBottom: "2em" }}
					>
						Download
					</Button>
				) : (
					""
				)}
			</form>
			{requiresCaptcha && captchaImage ? (
				<div>
					<img
						src={`data:image/jpeg;base64,${captchaImage}`}
						alt="Buffer Image"
					/>

					<form onSubmit={submitCaptcha}>
						<Input
							value={captchaValue}
							type="text"
							label="captcha"
							variant="bordered"
							onValueChange={setCaptchaValue}
							className="max-w-xs"
						/>
						<Button type="submit" color="primary" isLoading={isLoading}>
							Submit
						</Button>
					</form>
				</div>
			) : (
				""
			)}
		</div>
	);
}
