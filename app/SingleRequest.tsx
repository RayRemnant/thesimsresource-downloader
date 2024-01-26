/* eslint-disable @next/next/no-img-element */
"use client";
import {
	useState,
	ChangeEvent,
	FormEvent,
	useMemo,
	useRef,
	useEffect,
} from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Url } from "url";
import { Link } from "@nextui-org/link";
import { Spacer } from "@nextui-org/spacer";
import { Image } from "@nextui-org/image";
import { Divider } from "@nextui-org/divider";

export const SingleRequest = ({
	requiresCaptcha,
	setRequiresCaptcha,
	setCaptchaImage,
	sharedAbortController,
	setSharedAbortController,
}: {
	requiresCaptcha: boolean;
	setRequiresCaptcha: React.Dispatch<React.SetStateAction<boolean>>;
	setCaptchaImage: React.Dispatch<React.SetStateAction<any>>;
	sharedAbortController: AbortController;
	setSharedAbortController: React.Dispatch<React.SetStateAction<any>>;
}) => {
	const [resourceUrl, setResourceUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const [downloadLink, setDownloadLink] = useState("");

	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		// Focus on the input field when the component is mounted
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [sharedAbortController]); // The empty dependency array ensures this effect runs only once on mount

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setIsLoading(true);
		setRequiresCaptcha(false);
		setDownloadLink("");

		//pass function from parent here
		fetch(`/api?url=${resourceUrl}`, { signal: sharedAbortController.signal })
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
					setRequiresCaptcha(() => {
						// Callback function executed after state is updated
						// Abort all ongoing fetch requests
						console.log("ABORT FETCH...");
						sharedAbortController.abort();
						setSharedAbortController(new AbortController());
						return true;
					});
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
		<div className="flex-grow">
			<form
				onSubmit={(e) => {
					handleSubmit(e);
				}}
				className="flex flex-row items-center flex-wrap"
			>
				<Input
					ref={inputRef}
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
		</div>
	);
};
