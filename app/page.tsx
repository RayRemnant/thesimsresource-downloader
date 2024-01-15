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

import { useRef } from "react";
//TODO: loses focus on insertion inside input field

interface Request {
	resourceUrl: string;
	isLoading: boolean;
	requiresCaptcha: boolean;
	captchaImage?: string;
	captchaValue: string;
	downloadLink: string;
}

export default function App() {
	const [requests, setRequests] = useState<Request[]>([
		{
			resourceUrl: "",
			isLoading: false,
			requiresCaptcha: false,
			captchaImage: undefined,
			captchaValue: "",
			downloadLink: "",
		},
	]);

	const addRequest = (): void => {
		setRequests((prevRequests) => {
			const newRequests = [
				...prevRequests,
				{
					resourceUrl: "",
					isLoading: false,
					requiresCaptcha: false,
					captchaImage: undefined,
					captchaValue: "",
					downloadLink: "",
				},
			];
			return newRequests;
		});
	};

	const updateRequest = (index: number, updatedRequest: Request): void => {
		setRequests((prevRequests) => {
			const newRequests = [...prevRequests];
			prevRequests[index] = updatedRequest;
			newRequests[index] = updatedRequest;
			return newRequests;
		});
	};

	const submitCaptcha = (e: FormEvent<HTMLFormElement>, index: number) => {
		e.preventDefault();

		const request = requests[index];
		//extract id from url

		let id = request.resourceUrl.split("id/")[1];

		updateRequest(index, { ...request, isLoading: true });

		fetch(`/api/captcha?id=${id}&captchaValue=${request.captchaValue}`)
			.then(async (result) => {
				if (result.status == 200) {
					updateRequest(index, { ...request, requiresCaptcha: false });

					handleSubmit(e, index);

					//loop through all open requests, if (requires captcha == true), resend request
				}

				//if captcha true
				//redirect to captcha form
			})
			.catch((e: any) => {
				updateRequest(index, { ...request, isLoading: false });

				console.log(e);
			});

		console.log(request.captchaValue);

		//request to Vercel HOST /captcha/captchaValue

		// if response is captcha true -> redirect to captcha form
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>, index: number) => {
		e.preventDefault();

		const request = requests[index];

		updateRequest(index, {
			...request,
			isLoading: true,
			requiresCaptcha: false,
		});

		fetch(`/api?url=${request.resourceUrl}`)
			.then(async (result) => {
				updateRequest(index, { ...request, isLoading: false });

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
					updateRequest(index, {
						...request,
						requiresCaptcha: true,
						captchaImage: data.captcha,
					});
					return;
				}

				updateRequest(index, { ...request, downloadLink: data.url });

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
				updateRequest(index, { ...request, isLoading: false });
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

	const maxWidth = "600px";

	const SingleRequest = (request: Request & { index: number }) => {
		const {
			resourceUrl,
			isLoading,
			downloadLink,
			requiresCaptcha,
			captchaImage,
			captchaValue,
			index,
		} = request;

		const isInvalid = useMemo(() => {
			if (resourceUrl === "") return true;

			return validateUrl(resourceUrl) ? false : true;
		}, [resourceUrl]);

		return (
			<div>
				<form
					onSubmit={(e) => handleSubmit(e, index)}
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
						onValueChange={(newValue) =>
							updateRequest(index, { ...request, resourceUrl: newValue })
						}
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
							onSubmit={(e) => submitCaptcha(e, index)}
							className="flex flex-row items-center flex-wrap"
						>
							<Input
								value={captchaValue}
								type="text"
								label="captcha"
								variant="bordered"
								onValueChange={(newValue) =>
									updateRequest(index, { ...request, captchaValue: newValue })
								}
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
	};

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

			{requests.map((item, index) => (
				<div key={index}>
					{index}
					<SingleRequest {...item} index={index} key={index} />
				</div>
			))}
			<Button type="submit" color="primary" onClick={addRequest}>
				+
			</Button>
		</div>
	);
}
