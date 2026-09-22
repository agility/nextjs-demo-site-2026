'use client'

import { useState } from 'react'
import { Container } from '@/components/container'
import { Heading, Subheading } from '@/components/text'
import { Button } from '@/components/button'
import { getContentItem } from '@/lib/cms/getContentItem'
import type { UnloadedModuleProps } from '@agility/nextjs'
import { clsx } from 'clsx'

interface IContactUs {
	heading: string
	description: string
	submitURL: string
	successMessage: string
	errorMessage: string
	loadingMessage: string
	address: string
	phone: string
	email: string
}

interface FormData {
	firstName: string
	lastName: string
	email: string
	phone: string
	message: string
}

interface FormState {
	status: 'idle' | 'loading' | 'success' | 'error'
	errors: Partial<FormData>
}

/**
 * ContactUs component for displaying contact form and information.
 * This component fetches content from Agility CMS and displays a contact section with form and contact details.
 *
 * @param {UnloadedModuleProps} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered contact section.
 */
export const ContactUs = async ({ module, languageCode, isPreview }: UnloadedModuleProps) => {
	const {
		fields: {
			heading,
			description,
			submitURL = '/api/contact', // Default fallback URL
			successMessage = 'Thank you for your message! We\'ll get back to you soon.',
			errorMessage = 'Sorry, there was an error sending your message. Please try again.',
			loadingMessage = 'Sending your message...',
			address,
			phone,
			email
		},
		contentID,
	} = await getContentItem<IContactUs>({
		preview: isPreview,
		contentID: module.contentid,
		languageCode,
	})

	return (
		<Container className="mt-16 sm:mt-24" data-agility-component={contentID}>
			<div className="mx-auto max-w-7xl">
				<div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
					{/* Contact Information */}
					<div>
						<Subheading data-agility-field="heading">Get in touch</Subheading>
						<Heading as="h2" className="mt-2 max-w-lg" data-agility-field="heading">
							{heading}
						</Heading>
						<p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-300" data-agility-field="description">
							{description}
						</p>

						<div className="mt-10 space-y-4 text-base leading-7 text-gray-600 dark:text-gray-300">
							{address && (
								<div className="flex gap-x-4" data-agility-field="address">
									<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
										<svg className="h-5 w-5 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
											<path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.757.433l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
										</svg>
									</div>
									<div>
										<p className="font-semibold text-gray-900 dark:text-gray-100">Office</p>
										<p className="mt-1">{address}</p>
									</div>
								</div>
							)}

							{phone && (
								<div className="flex gap-x-4" data-agility-field="phone">
									<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
										<svg className="h-5 w-5 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
											<path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
										</svg>
									</div>
									<div>
										<p className="font-semibold text-gray-900 dark:text-gray-100">Phone</p>
										<p className="mt-1">
											<a href={`tel:${phone}`} className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
												{phone}
											</a>
										</p>
									</div>
								</div>
							)}

							{email && (
								<div className="flex gap-x-4" data-agility-field="email">
									<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
										<svg className="h-5 w-5 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
											<path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
											<path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
										</svg>
									</div>
									<div>
										<p className="font-semibold text-gray-900 dark:text-gray-100">Email</p>
										<p className="mt-1">
											<a href={`mailto:${email}`} className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
												{email}
											</a>
										</p>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Contact Form */}
					<ContactForm
						submitURL={submitURL}
						successMessage={successMessage}
						errorMessage={errorMessage}
						loadingMessage={loadingMessage}
					/>
				</div>
			</div>
		</Container>
	)
}

interface ContactFormProps {
	submitURL: string
	successMessage: string
	errorMessage: string
	loadingMessage: string
}

function ContactForm({ submitURL, successMessage, errorMessage, loadingMessage }: ContactFormProps) {
	const [formData, setFormData] = useState<FormData>({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		message: ''
	})

	const [formState, setFormState] = useState<FormState>({
		status: 'idle',
		errors: {}
	})

	const validateForm = (): boolean => {
		const errors: Partial<FormData> = {}

		if (!formData.firstName.trim()) {
			errors.firstName = 'First name is required'
		}

		if (!formData.lastName.trim()) {
			errors.lastName = 'Last name is required'
		}

		if (!formData.email.trim()) {
			errors.email = 'Email is required'
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			errors.email = 'Please enter a valid email address'
		}

		if (!formData.message.trim()) {
			errors.message = 'Message is required'
		}

		setFormState(prev => ({ ...prev, errors }))
		return Object.keys(errors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) {
			return
		}

		setFormState({ status: 'loading', errors: {} })

		try {
			const response = await fetch(submitURL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			})

			if (response.ok) {
				setFormState({ status: 'success', errors: {} })
				setFormData({
					firstName: '',
					lastName: '',
					email: '',
					phone: '',
					message: ''
				})
			} else {
				throw new Error('Form submission failed')
			}
		} catch (error) {
			setFormState({ status: 'error', errors: {} })
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target
		setFormData(prev => ({ ...prev, [name]: value }))

		// Clear specific field error when user starts typing
		if (formState.errors[name as keyof FormData]) {
			setFormState(prev => ({
				...prev,
				errors: { ...prev.errors, [name]: undefined }
			}))
		}
	}

	if (formState.status === 'success') {
		return (
			<div className="rounded-2xl bg-green-50 dark:bg-green-900/20 p-6 border border-green-200 dark:border-green-800">
				<div className="flex">
					<div className="flex-shrink-0">
						<svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.53a.75.75 0 00-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
						</svg>
					</div>
					<div className="ml-3">
						<p className="text-sm font-medium text-green-800 dark:text-green-200">
							{successMessage}
						</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{formState.status === 'error' && (
				<div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-6 border border-red-200 dark:border-red-800">
					<div className="flex">
						<div className="flex-shrink-0">
							<svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
							</svg>
						</div>
						<div className="ml-3">
							<p className="text-sm font-medium text-red-800 dark:text-red-200">
								{errorMessage}
							</p>
						</div>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
				<div>
					<label htmlFor="firstName" className="block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
						First name *
					</label>
					<div className="mt-2.5">
						<input
							type="text"
							name="firstName"
							id="firstName"
							value={formData.firstName}
							onChange={handleChange}
							className={clsx(
								"block w-full rounded-lg border-0 px-3.5 py-2 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 bg-white dark:bg-gray-800 transition-colors",
								formState.errors.firstName
									? "ring-red-300 dark:ring-red-700 focus:ring-red-500 dark:focus:ring-red-400"
									: "ring-gray-300 dark:ring-gray-600 focus:ring-indigo-600 dark:focus:ring-indigo-400"
							)}
							placeholder="First name"
						/>
						{formState.errors.firstName && (
							<p className="mt-2 text-sm text-red-600 dark:text-red-400">{formState.errors.firstName}</p>
						)}
					</div>
				</div>

				<div>
					<label htmlFor="lastName" className="block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
						Last name *
					</label>
					<div className="mt-2.5">
						<input
							type="text"
							name="lastName"
							id="lastName"
							value={formData.lastName}
							onChange={handleChange}
							className={clsx(
								"block w-full rounded-lg border-0 px-3.5 py-2 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 bg-white dark:bg-gray-800 transition-colors",
								formState.errors.lastName
									? "ring-red-300 dark:ring-red-700 focus:ring-red-500 dark:focus:ring-red-400"
									: "ring-gray-300 dark:ring-gray-600 focus:ring-indigo-600 dark:focus:ring-indigo-400"
							)}
							placeholder="Last name"
						/>
						{formState.errors.lastName && (
							<p className="mt-2 text-sm text-red-600 dark:text-red-400">{formState.errors.lastName}</p>
						)}
					</div>
				</div>
			</div>

			<div>
				<label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
					Email *
				</label>
				<div className="mt-2.5">
					<input
						type="email"
						name="email"
						id="email"
						value={formData.email}
						onChange={handleChange}
						className={clsx(
							"block w-full rounded-lg border-0 px-3.5 py-2 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 bg-white dark:bg-gray-800 transition-colors",
							formState.errors.email
								? "ring-red-300 dark:ring-red-700 focus:ring-red-500 dark:focus:ring-red-400"
								: "ring-gray-300 dark:ring-gray-600 focus:ring-indigo-600 dark:focus:ring-indigo-400"
						)}
						placeholder="Email address"
					/>
					{formState.errors.email && (
						<p className="mt-2 text-sm text-red-600 dark:text-red-400">{formState.errors.email}</p>
					)}
				</div>
			</div>

			<div>
				<label htmlFor="phone" className="block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
					Phone number
				</label>
				<div className="mt-2.5">
					<input
						type="tel"
						name="phone"
						id="phone"
						value={formData.phone}
						onChange={handleChange}
						className="block w-full rounded-lg border-0 px-3.5 py-2 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-400 sm:text-sm sm:leading-6 bg-white dark:bg-gray-800 transition-colors"
						placeholder="Phone number"
					/>
				</div>
			</div>

			<div>
				<label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
					Message *
				</label>
				<div className="mt-2.5">
					<textarea
						name="message"
						id="message"
						rows={4}
						value={formData.message}
						onChange={handleChange}
						className={clsx(
							"block w-full rounded-lg border-0 px-3.5 py-2 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 bg-white dark:bg-gray-800 transition-colors resize-none",
							formState.errors.message
								? "ring-red-300 dark:ring-red-700 focus:ring-red-500 dark:focus:ring-red-400"
								: "ring-gray-300 dark:ring-gray-600 focus:ring-indigo-600 dark:focus:ring-indigo-400"
						)}
						placeholder="Tell us about your project..."
					/>
					{formState.errors.message && (
						<p className="mt-2 text-sm text-red-600 dark:text-red-400">{formState.errors.message}</p>
					)}
				</div>
			</div>

			<div>
				<Button
					type="submit"
					disabled={formState.status === 'loading'}
					className="w-full justify-center disabled:opacity-50"
				>
					{formState.status === 'loading' ? loadingMessage : 'Send message'}
				</Button>
			</div>
		</form>
	)
}

export default ContactUs
