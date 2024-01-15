/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, ChangeEvent, FormEvent, useMemo } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Url } from "url";
import { Link } from "@nextui-org/link";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Spacer } from "@nextui-org/spacer";
import { Image } from "@nextui-org/image";
import { Divider } from "@nextui-org/divider";

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
		setRequiresCaptcha(false);
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

	const maxWidth = "600px";

	return (
		<div style={{ maxWidth }}>
			<h1 style={{ fontSize: "2em" }}>
				The Sims Resource
				<br /> Download Scraper
			</h1>

			<Spacer x={8} y={4} />
			<Accordion variant="shadow">
				<AccordionItem
					key="1"
					aria-label="How does it work?"
					title="How does it work?"
				>
					<ol style={{ listStyle: "inside auto" }}>
						<li>Insert the URL of the item you want to download</li>

						<Spacer x={1} />
						<li>Wait around 30 seconds to complete</li>

						<Spacer x={1} />
						<li>The download link will appear on the right</li>

						<Spacer x={1} />
						<li>Enjoy!</li>
					</ol>
				</AccordionItem>
			</Accordion>

			<Spacer x={8} y={4} />

			<form
				onSubmit={handleSubmit}
				className="flex flex-row items-center flex-wrap"
			>
				<Input
					value={resourceUrl}
					type="url"
					label="URL"
					variant="bordered"
					isInvalid={isInvalid}
					color={isInvalid ? "danger" : "success"}
					errorMessage={isInvalid && "Please enter a valid url"}
					description={isLoading ? "Working on it..." : "Good to go!"}
					onValueChange={setResourceUrl}
					className="max-w-xs"
					placeholder="https://www.thesimsresource.com/..."
				/>
				<Spacer x={2} />
				<Button
					type="submit"
					color="primary"
					isLoading={isLoading}
					isDisabled={isInvalid}
					style={{ marginBottom: "2em" }}
				>
					Submit
				</Button>
				<Spacer x={2} />
				{downloadLink && !isLoading ? (
					<Button
						href={downloadLink}
						as={Link}
						color="default"
						showAnchorIcon
						variant="solid"
						style={{ marginBottom: "2em" }}
					>
						Download Link
					</Button>
				) : (
					""
				)}
			</form>
			{requiresCaptcha && captchaImage ? (
				<div>
					<Divider />
					<Spacer y={4} />
					<Image
						src={`data:image/jpeg;base64,${captchaImage}`}
						alt="Buffer Image"
					/>
					<Spacer y={2} />
					<form
						onSubmit={submitCaptcha}
						className="flex flex-row items-center flex-wrap"
					>
						<Input
							value={captchaValue}
							type="text"
							label="captcha"
							variant="bordered"
							onValueChange={setCaptchaValue}
							className="max-w-xs"
						/>
						<Spacer x={2} />
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
