<script lang="ts">
	import { PDFDocument, StandardFonts } from 'pdf-lib';
	import SignaturePad from 'signature_pad';
	import { supabase } from '../../supabaseClient.ts';
	import { onMount } from 'svelte';

	let name = '';
	let streetAddress = '';
	let cityStateZip = '';
	let userName = '';
	let currentDate = new Date();
	let formattedDate = `${
		currentDate.getMonth() + 1
	}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
	let signaturePad;
	let committee = 'FLI Golf';
	let ad1 = '5621 PALMER WAY STE G';
	let ad2 = 'Carlsbad, CA, 92010';
	let userData;
	let approvedSignatureandDate = false;
	let errorMessage = '';

	$: console.log('Checkbox status:', approvedSignatureandDate);

	async function fetchUserData() {
		// Fetch the current user's details
		const {
			data: { user }
		} = await supabase.auth.getUser();

		// Now use the user's ID to fetch their profile data
		const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

		// Log the fetched data to the console
		console.log(data);

		if (error) {
			console.error('Error fetching user data:', error);
		} else if (data) {
			// Store the profile data in the userData variable
			userData = data;

			// Populate the Svelte state variables with the fetched data
			name = data.full_name || ''; // Mapping full_name to name
			streetAddress = data.street_address || '';
			cityStateZip = data.city_state_zip || '';
			userName = data.username || ''; // Assuming username contains the email. Adjust if needed.
			// ... and so on for other fields
		}
	}

	async function updateHasSignedStatus() {
		if (!userData) {
			console.error('User data is not fetched yet. Refresh you browser');
			return;
		}

		const { error } = await supabase
			.from('profiles')
			.update({ has_signed: true })
			.eq('id', userData.id);

		if (error) {
			console.error('Error updating has_signed status:', error);
		}
	}

	onMount(() => {
		fetchUserData();
		const canvas = document.querySelector('canvas');
		signaturePad = new SignaturePad(canvas);
	});
	// Generate the PDF
	async function generatePDF() {
		console.log('Value of approvedSignatureandDate:', approvedSignatureandDate);
		if (!approvedSignatureandDate) {
			console.log('Please check the box before submitting.');
			errorMessage = 'Please check the box before submitting.';
			return;
		}
		errorMessage = '';
		await updateHasSignedStatus();

		const pdfDoc = await PDFDocument.create();
		const page = pdfDoc.addPage([800, 1100]);

		// Set font for the document
		const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

		// Draw the title
		page.drawText('LETTER OF INTENT TO PLAY', { x: 250, y: 1050, size: 24, font });

		// Decrease yPosition for the next section
		let yPosition = 1000;

		// Add user information to the PDF
		page.drawText(`${committee}`, { x: 50, y: yPosition, size: 12, font });
		yPosition -= 25;

		page.drawText(`${ad1}`, { x: 50, y: yPosition, size: 12, font });
		yPosition -= 20;

		page.drawText(`${ad2}`, { x: 50, y: yPosition, size: 12, font });
		yPosition -= 20;

		// You can continue like this for other fields...

		// Draw the letter content onto the PDF, this is an example and you might need to adjust
		// the content and spacing accordingly.
		const paragraphs = [
			'',
			`Dear FLI Golf`,
			``,
			`
            I am writing this letter to express my sincere intent and enthusiasm to participate in the FLI Golf Tour. 
            I, ${name}, am thrilled by the prospect of being a part of this groundbreaking Disc Golf
            tournament and contributing my skills and passion to the sport. I understand the significance of
            FLI Golf Tour in elevating Disc Golf to unprecedented heights and embracing innovative approaches
            to enhance the game. I am excited to align myself with an organization that shares my vision for
            the future of this sport. By signing this letter of intent, I affirm the following: - I commit to
            participating in all required, scheduled FLI Golf Tour events and adhere to the rules and
            regulations set forth by the tournament committee. - I will conduct myself with sportsmanship,
            integrity, and respect for fellow players, officials, and spectators at all times during the FLI
            Golf Tour. - I understand and acknowledge that my participation in FLI Golf Tour events is subject
            to compliance with all applicable laws and regulations, as well as the tournament guidelines
            provided by the organizing committee. I grant FLI Golf Tour the right to use my name, likeness,
            photographs, and videos for promotional and marketing purposes related to the tournament. In
            accordance with the official player agreement. I will sign the official “FLI Golf Players
            Agreement” when the stipulations of this letter are fulfilled. Additionally, this is a letter of
            intent and is only valid if/when the following six stipulations are met: - 50% of tour sponsors
            MUST be secured and on contract. - ALL 12 schools must agree to participate. - The tour schedule
            must be set for the 2025 season. - Proof of secured purse funds for the year must be provided. -
            Proof of an active sports tour insurance policy must be provided. - A sports network must be
            secured to ensure coverage of the tournaments. I am excited about the prospect of contributing to
            the success of FLI Golf Tour and helping to propel Disc Golf into a new era of recognition and
            popularity. I am confident in my abilities and am fully committed to giving my best effort to
            achieve success in this prestigious tournament. Please find my signature below, indicating my
            intent to participate in the FLI Golf Tour`
		];

		for (let para of paragraphs) {
			page.drawText(para, { x: 50, y: yPosition, size: 12, font, width: 750, lineHeight: 20 });
			yPosition -= 30;
		}

		// Add signature to the PDF
		yPosition -= 625; // Some additional space for the signature
		const signatureImage = await pdfDoc.embedPng(signaturePad.toDataURL());
		page.drawImage(signatureImage, { x: 50, y: yPosition, width: 400, height: 200 });

		page.drawText(`${formattedDate}`, { x: 50, y: yPosition, size: 12, font });
		yPosition -= 20;
		page.drawText(`${name}`, { x: 50, y: yPosition, size: 12, font });
		yPosition -= 20;
		page.drawText(`${streetAddress}`, { x: 50, y: yPosition, size: 12, font });
		yPosition -= 20;
		page.drawText(`${cityStateZip}`, { x: 50, y: yPosition, size: 12, font });
		yPosition -= 20;

		const pdfBytes = await pdfDoc.save();
		const blob = new Blob([pdfBytes], { type: 'application/pdf' });
		const pdfFileName = `Letter_of_Intent_${name.replace(/ /g, '_')}.pdf`;

		const { error: uploadError } = await supabase.storage
			.from('proIntentContracts')
			.upload(pdfFileName, blob);

		if (uploadError) {
			console.error('Error uploading PDF to storage:', uploadError);
		} else {
			console.log('PDF uploaded successfully');
		}

		// Offer the PDF for download
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = 'Letter_of_Intent.pdf';
		link.click();
		location.reload();
	}
</script>

<div class="letter-content">
	LETTER OF INTENT TO PLAY

	<!-- Display the fetched user data instead of input fields -->
	<p>Name: {name}</p>
	<p>Street Address: {streetAddress}</p>
	<p>City, State, ZIP Code: {cityStateZip}</p>
	<p>User Name: {userName}</p>
	<p>Date: {formattedDate}</p>

	I, {name}, am thrilled by the prospect of being a part of this groundbreaking Disc Golf tournament
	and contributing my skills and passion to the sport. I understand the significance of FLI Golf
	Tour in elevating Disc Golf to unprecedented heights and embracing innovative approaches to
	enhance the game. I am excited to align myself with an organization that shares my vision for the
	future of this sport. By signing this letter of intent, I affirm the following: - I commit to
	participating in all required, scheduled FLI Golf Tour events and adhere to the rules and
	regulations set forth by the tournament committee. - I will conduct myself with sportsmanship,
	integrity, and respect for fellow players, officials, and spectators at all times during the FLI
	Golf Tour. - I understand and acknowledge that my participation in FLI Golf Tour events is subject
	to compliance with all applicable laws and regulations, as well as the tournament guidelines
	provided by the organizing committee. I grant FLI Golf Tour the right to use my name, likeness,
	photographs, and videos for promotional and marketing purposes related to the tournament. In
	accordance with the official player agreement. I will sign the official “FLI Golf Players
	Agreement” when the stipulations of this letter are fulfilled. Additionally, this is a letter of
	intent and is only valid if/when the following six stipulations are met: - 50% of tour sponsors
	MUST be secured and on contract. - ALL 12 schools must agree to participate. - The tour schedule
	must be set for the 2025 season. - Proof of secured purse funds for the year must be provided. -
	Proof of an active sports tour insurance policy must be provided. - A sports network must be
	secured to ensure coverage of the tournaments. I am excited about the prospect of contributing to
	the success of FLI Golf Tour and helping to propel Disc Golf into a new era of recognition and
	popularity. I am confident in my abilities and am fully committed to giving my best effort to
	achieve success in this prestigious tournament. Please find my signature below, indicating my
	intent to participate in the FLI Golf Tour:
	{#if errorMessage}
		<p class="text-red-500 mt-4 font-bold">{errorMessage}</p>
	{/if}
	<!-- Add this right after the Date and before the signature canvas -->
	<label class="flex items-center space-x-2 mt-6">
		<input bind:checked={approvedSignatureandDate} type="checkbox" />
		<span
			>By checking this box and signing this form, you {name} acknowledge and agree to the following
			on the date of: {formattedDate}.</span
		>
	</label>
	<div class="relative group">
		<canvas
			width="400"
			height="200"
			class="block border hover:shadow-lg hover:bg-indigo-200 transition duration-300"
		/>
		<div
			class="text-black absolute top-2 left-2 opacity-0 group-hover:opacity-100 z-20 select-none"
		>
			Sign here
		</div>
	</div>
	<button
		class="btn btn-sm variant-ghost-surface p-2 flex-1 mr-1"
		on:click={() => signaturePad.clear()}>Clear Signature</button
	>
	<button
		on:click={() => {
			console.log('Button clicked!');
			generatePDF();
		}}
		class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
		>Generate PDF</button
	>
</div>

<style>
	/* Add some basic styling for better layout */
	input,
	canvas,
	button {
		display: block;
		margin-bottom: 20px;
	}

	canvas {
		border: 1px solid #000;
	}

	/* Black text for inputs */
	input {
		color: black;
		/* If you want a black border around your input fields, you can add: border: 1px solid black; */
	}

	/* White background and black text for signature area */
	canvas {
		background-color: white;
		color: black; /* Not typically needed for a canvas, but added just in case */
	}

	.letter-content {
		font-family: 'Arial', sans-serif; /* Use a clean, readable font. Adjust as needed. */
		line-height: 1.6; /* Increase line height for readability. */
		max-width: 600px; /* Set a max-width to prevent the letter from stretching too wide on large screens. */
		margin: 0 auto; /* Center the letter on the page. */
		padding: 20px; /* Add some padding around the letter. */
	}

	.letter-content h1 {
		text-align: center;
		font-size: 24px;
		margin-bottom: 20px;
	}

	.letter-content p {
		margin-bottom: 20px; /* Space out the paragraphs a bit. */
	}

	.letter-content ul {
		margin-left: 40px;
		margin-bottom: 20px;
	}

	.letter-content li {
		margin-bottom: 10px;
	}
</style>
