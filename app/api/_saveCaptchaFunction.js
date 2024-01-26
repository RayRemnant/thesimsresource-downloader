const submitCaptcha = (e) => {
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
		.catch((e) => {
			setIsLoading(false);
			console.log(e);
		});

	console.log(captchaValue);

	//request to Vercel HOST /captcha/captchaValue

	// if response is captcha true -> redirect to captcha form
};