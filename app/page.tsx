"use client";

import { useState, FormEvent, useMemo, useEffect } from "react";
import { Button } from "@nextui-org/button";

import { SingleRequest } from "./SingleRequest";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Spacer } from "@nextui-org/spacer";

import { Divider } from "@nextui-org/divider";
import { Image } from "@nextui-org/image";
import { Input } from "@nextui-org/input";
import { Modal, ModalContent, useDisclosure } from "@nextui-org/modal";

export default function App() {
	const [requests, setRequests] = useState<number[]>([]);
	const [requiresCaptcha, setRequiresCaptcha]: [
		requiresCaptcha: boolean,
		setRequiresCaptcha: React.Dispatch<React.SetStateAction<boolean>>
	] = useState(false);

	const [captchaImage, setCaptchaImage]: [
		captchaImage: any,
		setCaptchaImage: React.Dispatch<React.SetStateAction<any>>
	] = useState(undefined);
	const [captchaValue, setCaptchaValue] = useState("");

	const [captchaError, setCaptchaError] = useState(false);

	const [isLoading, setIsLoading] = useState(false);

	//move requires captcha here

	const { isOpen, onOpen, onClose } = useDisclosure();

	const submitCaptcha = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setIsLoading(true);
		fetch(`/api/captcha?id=1686374&captchaValue=${captchaValue}`)
			.then(async (result) => {
				if (result.status == 200) {
					setRequiresCaptcha(false);
					setIsLoading(false);
					onClose();
				}

				if (result.status == 422) {
					setIsLoading(false);
					setCaptchaError(true);
				}

				setCaptchaValue("");

				//if captcha true
				//redirect to captcha form
			})
			.catch((e: any) => {
				console.log("CAPTCHA ERROR");
				setCaptchaValue("");
				console.log(e);
				setIsLoading(false);
			});

		console.log(captchaValue);

		//request to Vercel HOST /captcha/captchaValue

		// if response is captcha true -> redirect to captcha form
	};

	function validateCaptcha(url: string): boolean {
		return /^[0-9]{4}$/.test(url);
	}

	const isInvalid = useMemo(() => {
		if (captchaValue === "") return true;

		return validateCaptcha(captchaValue) ? false : true;
	}, [captchaValue]);

	useEffect(() => {
		if (requiresCaptcha) {
			onOpen();
		} else {
			onClose();
		}
	}, [requiresCaptcha, onOpen, onClose]);

	const [sharedAbortController, setSharedAbortController] = useState(
		new AbortController()
	);

	return (
		<div style={{ maxWidth: "700px" }}>
			<Modal
				size="xl"
				isOpen={isOpen}
				onClose={onClose}
				className={`${requiresCaptcha && captchaImage ? "" : ""} `}
			>
				<ModalContent>
					<Spacer y={4} />
					<Image
						className="ml-4"
						src={`data:image/jpeg;base64,${captchaImage}`}
						alt="Buffer Image"
					/>
					<Spacer y={2} />
					<form
						onSubmit={submitCaptcha}
						className="ml-4 mb-4 flex flex-row items-center flex-wrap"
					>
						<Input
							value={captchaValue}
							type="text"
							label="captcha here"
							variant="bordered"
							onValueChange={setCaptchaValue}
							className="max-w-xs"
							color={isInvalid ? "danger" : "success"}
							errorMessage={
								isInvalid && "Please ensure that the captcha is correct."
							}
							description={isLoading ? "Working on it..." : "Nice!"}
						/>
						<Spacer x={2} />
						<Button
							type="submit"
							color="primary"
							isLoading={isLoading}
							style={{ marginBottom: "2em" }}
						>
							Submit
						</Button>
					</form>
				</ModalContent>
			</Modal>

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
						<li>Complete captcha if prompted (should last 24 hours)</li>

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
			{requests.map((id) => (
				<div key={id} className="flex flex-column items-center flex-wrap mb-4">
					<Button
						style={{ marginBottom: "2em" }}
						isIconOnly
						size="sm"
						onClick={() => {
							setRequests((prevRequests) => {
								console.log("PREV REQ ", prevRequests);
								return prevRequests.filter((_id) => _id !== id);
							});
						}}
					>
						-
					</Button>
					<Spacer x={2} />

					<SingleRequest
						requiresCaptcha={requiresCaptcha}
						setRequiresCaptcha={setRequiresCaptcha}
						setCaptchaImage={setCaptchaImage}
						sharedAbortController={sharedAbortController}
						setSharedAbortController={setSharedAbortController}
					/>
				</div>
			))}
			<Button
				onClick={() => {
					setRequests((prevRequests) => {
						return [...prevRequests, Math.random()];
					});
				}}
			>
				+
			</Button>
		</div>
	);
}
