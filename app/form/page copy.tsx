"use client";
import { useState, ChangeEvent, FormEvent, useMemo } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Url } from "url";
import { Link } from "@nextui-org/link";

export default function App() {
	const validateEmail = (value: string) =>
		value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

	const [array1, setArray1] = useState([1]);

	const Component1 = () => {
		const [resourceUrl, setResourceUrl] = useState("");
		const [isLoading, setIsLoading] = useState(false);

		const [requiresCaptcha, setRequiresCaptcha] = useState(false);
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
						captcha?: boolean;
						url: any;
						method: any;
						headers: any;
						body: any;
					} = await result.json();

					//if captcha true
					//show captcha form
					if (data.captcha) {
						setRequiresCaptcha(true);
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

		const isInvalid = useMemo(() => {
			if (resourceUrl === "") return true;

			return validateUrl(resourceUrl) ? false : true;
		}, [resourceUrl]);

		return (
			<div>
				<form
					onSubmit={handleSubmit}
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
					}}
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
					{downloadLink ? (
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
				{requiresCaptcha ? (
					<div>
						<img
							width="250"
							height="250"
							alt="captcha image"
							src="https://f003.backblazeb2.com/file/thesimsresource/captcha.png"
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
	};

	return (
		<div>
			<div>
				{array1.map((item, index) => (
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							marginBottom: "2em",
							alignItems: "center",
						}}
						key={index}
					>
						<Button
							onClick={() => {
								setArray1((prevItems) =>
									prevItems.filter((_, i) => i !== index)
								);
							}}
							color="default"
							variant="faded"
							style={{ marginBottom: "2em" }}
						>
							-
						</Button>
						<Component1 />
					</div>
				))}
				<Button
					onClick={() => {
						// You can replace 'New Item' with the actual content of the new item
						const newItem = "New Item";

						// Use the spread operator to create a new array with the existing items and the new item
						setArray1((prevItems) => [...prevItems, 1]);
					}}
					color="default"
					variant="faded"
					style={{ marginBottom: "2em" }}
				>
					+
				</Button>
			</div>
		</div>
	);
}
