"use client";

import { useState } from "react";
import { Button } from "@nextui-org/button";

import { SingleRequest } from "./SingleRequest";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Spacer } from "@nextui-org/spacer";

export default function App() {
	const [requests, setRequests] = useState<number[]>([]);

	return (
		<div style={{ maxWidth: "700px" }}>
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

					<SingleRequest />
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
